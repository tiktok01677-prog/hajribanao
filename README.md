# HajriBanao – Attendance & Salary Manager

A responsive **HTML + CSS + JavaScript** local-first website / PWA. Designed in the same friendly green-and-cream dashboard style as KhataBanao and StockBanao. Suitable for GitHub Pages and an Android Studio Java WebView wrapper.

## Features

- Employee create / edit / delete, role, phone, joining date, active status and monthly salary.
- Attendance by date: Present, Absent, Paid Leave or unmarked; optional 'mark only unmarked as Present' action.
- Monthly salary estimates, salary advances and payments, balance due/overpayment, salary-slip print view.
- Dashboard and reports, filter/search, CSV exports, JSON backup and restore.
- English / Urdu basic interface, dark mode, responsive layouts, PWA service worker.
- Privacy, terms, data-deletion, help, about and contact pages.
- Uses the current device's localStorage. No server, login, cloud sync or ads.

## Publish to GitHub Pages

1. Extract this ZIP. Open the **`hajribanao`** directory.
2. Create a new GitHub repository, e.g. `HajriBanao`.
3. Upload all files **inside** `hajribanao`, so `index.html` is at the repository root (not inside a nested folder).
4. In your repository: Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
5. Your URL will look like `https://YOUR_USERNAME.github.io/HajriBanao/`. Replace USERNAME with your real username. Wait for GitHub to publish it and verify the live link.
6. Edit `assets/config.js` and the placeholders in `privacy.html`, `contact.html`, `terms.html`, etc. before publishing to Play Store.

## Use with Android Java WebView

See `ANDROID-NOTES.md`. JavaScript and DOM storage must be enabled, and use the **HTTPS GitHub Pages URL**, not `file:///android_asset/index.html` (this project uses JavaScript modules). Ensure your wrapper app's package name, Java package and applicationId are consistent.

**Important:** Standard Android WebView needs native Java support to download JavaScript-generated Blob CSV/JSON files and for print workflows. Browser support and WebView support can differ. Test both before claiming these features in Play Store. Protect employee data; the current storage is not encrypted.

## Salary rule

For each employee, each selected salary month:

```
Paid days = min(Present days + Paid Leave days, Settings working days)
Earned amount = rounded(monthly salary × Paid days / Settings working days)
Balance due = Earned amount - Advances assigned to month - Salary payments assigned to month
```

- Default working days = 26; change in Settings for your workplace. Unmarked and Absent days earn 0 by this rule. A negative balance represents an overpayment.
- The employee's current monthly salary rate is used to calculate past months too. If salaries change historically, export your records first. No overtime, tax, unpaid-leave policy or statutory payroll logic is included.
- The tool is for simple recordkeeping, not legal payroll advice.

## Backups & privacy

Employee and attendance data are saved locally in the browser or WebView profile. Clearing site data or app storage can erase it. A JSON backup can restore the app's records; CSV is reporting-only. Exports include sensitive employee information and are not encrypted. No cloud backup is included.

## Test the logic

Node.js 18+:

```
node --test tests/*.test.mjs
node scripts/check.mjs
```

## Files

- `index.html`, `assets/app.mjs`, `assets/core.mjs`, `assets/store.mjs`, `assets/base.css`, `assets/hajri.css` — application.
- `manifest.webmanifest`, `sw.js`, `assets/icon-*` — PWA and visual assets.
- `privacy.html`, `delete-data.html`, `help.html`, `terms.html`, `about.html`, `contact.html` — public support pages.
- `tests`, `scripts` — static and business-logic checks.

Suggested Android package: **`com.hajribanao.app`** (must match your Play Console listing, if already created).
