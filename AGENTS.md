# Mercy for Humanity project instructions

These instructions apply to this project and all its subdirectories.

## Project organization

- Keep all project source, previews, archives, and other generated files inside `/Users/h/sites/mercyforhumanity/`.
- Use `preview.html` for the standalone design preview and the ignored `outputs/` directory for downloadable archives. Do not leave project files alongside this folder in `sites/`.

## Automatic Git workflow

- After completing any future changes in this project, always automatically stage all project changes, commit them with a clear message, and push to `origin main`.
- Do not ask for confirmation before staging, committing, or pushing. The user has explicitly authorized this workflow.
- Use `main` as the working branch and `https://github.com/ev-digitalmarketing/mercyforhumanity.git` as `origin`.
- Run the relevant build and checks before committing. Respect `.gitignore`; keep credentials, local runtime data, and generated files that are ignored out of commits.
- Preserve existing remote history. Do not force-push or overwrite unrelated work.
- If a commit or push is blocked, report the exact blocker and retain the local work for retry.
