// parse-issue.js
// Called by the GitHub Action whenever a new "submission" issue is opened.
// Reads the issue body (which GitHub formats predictably from the Issue Form fields)
// and writes a clean JSON file into /submissions.

const fs = require('fs');
const path = require('path');

// These env vars are set by the GitHub Action step that calls this script.
const issueNumber = process.env.ISSUE_NUMBER;
const issueBody = process.env.ISSUE_BODY;
const issueDate = process.env.ISSUE_DATE; // ISO date string

function extractField(body, label) {
  // GitHub Issue Forms render each field as:
  // ### Label
  //
  // value
  const regex = new RegExp(`### ${label}\\s*\\n\\n([\\s\\S]*?)(?=\\n### |$)`, 'i');
  const match = body.match(regex);
  if (!match) return '';
  let value = match[1].trim();
  if (value === '_No response_') return '';
  return value;
}

function run() {
  const submission = {
    subject: extractField(issueBody, 'Subject'),
    title: extractField(issueBody, 'Short title'),
    platform: extractField(issueBody, 'Platform / tool used'),
    prompt: extractField(issueBody, 'The prompt'),
    notes: extractField(issueBody, 'What worked well / how you used it'),
    author: extractField(issueBody, 'Your name \\(optional\\)'),
    date: issueDate ? issueDate.split('T')[0] : new Date().toISOString().split('T')[0],
    issueNumber,
  };

  if (!submission.subject || !submission.prompt) {
    console.error('Missing required fields, skipping submission.');
    process.exit(1);
  }

  const outDir = path.join(__dirname, '..', 'submissions');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, `issue-${issueNumber}.json`);
  fs.writeFileSync(outPath, JSON.stringify(submission, null, 2));
  console.log(`Wrote ${outPath}`);
}

run();
