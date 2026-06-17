# AI Prompt Register

A staff-facing website that automatically publishes AI prompts, platforms, and plans submitted by teachers. Built to sit behind a link on a school intranet.

## How it works

1. A teacher clicks the "Add it to the register" link on the site (or you share the issue link directly).
2. They fill in a short form — no GitHub knowledge needed beyond a free account and clicking submit.
3. A GitHub Action automatically turns that submission into a page and republishes the whole site within a minute or two.
4. No moderation step — it goes live immediately (see "Adding a review step" below if you change your mind).

## One-time setup (do this once)

1. **Create the repo.** Push all these files to a new **public** GitHub repository.
2. **Turn on GitHub Pages.** Repo → Settings → Pages → under "Build and deployment", set Source to **GitHub Actions**.
3. **Run the workflow once manually** to publish the first (empty) version of the site:
   - Go to the Actions tab → "Process submission and publish" → Run workflow.
4. **Find your site URL.** After that run finishes, Settings → Pages will show your live URL, something like:
   `https://YOUR-USERNAME.github.io/REPO-NAME/`
5. **Get your submission link.** Go to Issues → New Issue → you'll see "Submit an AI prompt" as a form option. Copy that URL — it'll look like:
   `https://github.com/YOUR-USERNAME/REPO-NAME/issues/new?template=submission.yml`
6. **Update the footer link.** In `index_template.html`, replace `ISSUE_FORM_URL_PLACEHOLDER` with the URL from step 5, commit, and the next build will pick it up.
7. **Add the site URL (from step 4) to your school intranet** as the link staff click.

## Sharing the submission link with staff

Teachers need the Issue Form link from step 5 above (or they can click "Add it to the register" on the site itself, which goes to the same place). They'll need a free GitHub account — if your school wants to avoid that entirely, see "Removing the GitHub account requirement" below.

## Day-to-day

Nothing required. Submissions appear automatically. Your only ongoing "coding upkeep" is optional:
- Tweak `style.css` to change colours/fonts.
- Edit `.github/ISSUE_TEMPLATE/submission.yml` to change the form fields.
- Edit `index_template.html` to change page copy/layout.

Each of those just needs a commit — the site rebuilds itself automatically next time someone submits, or you can trigger a rebuild manually via Actions → Run workflow.

## Adding a review step later

If you want to approve entries before they go live: in `.github/workflows/publish.yml`, change the trigger from `issues: types: [opened]` to `issues: types: [labeled]`, and only let the workflow run when you (or another approver) manually add a `approved` label to the issue. Submissions stay as open issues until labelled.

## Removing the GitHub account requirement

If you'd rather staff not need any GitHub account at all, replace the Issue Form with a Google Form or Microsoft Form that, on submission, calls the GitHub REST API to create an issue automatically (via a small Apps Script / Power Automate flow). Ask me if you want this built out — it slots into the same Action without changing anything else.

## File structure

```
.github/
  ISSUE_TEMPLATE/submission.yml   the form teachers fill in
  workflows/publish.yml           automation: parse → build → publish
scripts/
  parse-issue.js                  turns a new issue into a JSON file
  build.js                        turns all JSON files into index.html
submissions/                      one JSON file per published entry (auto-generated)
index_template.html               the page layout (edit this, not index.html)
index.html                        auto-generated — don't edit by hand
style.css                         all visual styling
```
