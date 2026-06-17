// build.js
// Reads all open/closed issues labelled "submission" (passed in as JSON via env or file),
// writes one JSON file per submission into /submissions, then rebuilds index.html.
//
// This script is invoked by the GitHub Action on every new issue and on a schedule,
// so the site always reflects the latest set of submissions.

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const SUBMISSIONS_DIR = path.join(ROOT_DIR, 'submissions');
const TEMPLATE_PATH = path.join(ROOT_DIR, 'index_template.html');
const OUTPUT_PATH = path.join(ROOT_DIR, 'index.html');

function loadSubmissions() {
  if (!fs.existsSync(SUBMISSIONS_DIR)) return [];
  return fs.readdirSync(SUBMISSIONS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(SUBMISSIONS_DIR, f), 'utf8')))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function buildEntryHtml(sub) {
  const subjSlug = slugify(sub.subject);
  return `
  <details class="entry" data-subject="${subjSlug}">
    <div class="tab">${escapeHtml(sub.subject)}</div>
    <div class="entry-body">
      <summary>
        <span class="entry-title">${escapeHtml(sub.title)}</span>
        <span class="entry-meta">${escapeHtml(sub.platform)} &middot; ${escapeHtml(sub.date)}</span>
      </summary>
      <div class="entry-detail">
        <p class="field-label">Prompt</p>
        <div class="prompt-block">${escapeHtml(sub.prompt)}</div>
        <p class="field-label">Notes</p>
        <p>${escapeHtml(sub.notes)}</p>
        ${sub.author ? `<p class="field-label">Submitted by</p><p>${escapeHtml(sub.author)}</p>` : ''}
      </div>
    </div>
  </details>`;
}

function buildFilterButtons(subjects) {
  return subjects
    .map(s => `<button class="filter-btn" data-subject="${slugify(s)}">${escapeHtml(s)}</button>`)
    .join('\n  ');
}

function build() {
  const submissions = loadSubmissions();
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  const subjects = [...new Set(submissions.map(s => s.subject))].sort();
  const entriesHtml = submissions.length
    ? submissions.map(buildEntryHtml).join('\n')
    : '<p class="empty-state">No submissions yet. Be the first to add one.</p>';

  const output = template
    .replace('<!-- BUILD:ENTRIES -->', entriesHtml)
    .replace('<!-- BUILD:FILTERS -->', buildFilterButtons(subjects));

  fs.writeFileSync(OUTPUT_PATH, output);
  console.log(`Built index.html with ${submissions.length} submission(s).`);
}

build();
