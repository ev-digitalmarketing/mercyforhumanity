# Mercy for Humanity

Canadian charity website for the Ahmadiyya Muslim Elders Association. Blue and navy are the primary colours, red is secondary, headings use Montserrat, and body text uses Open Sans. The three supplied community photographs are local assets. The homepage has an accessible slideshow, regional runs, and newsletter highlights.

All files stay inside `/Users/h/sites/mercyforhumanity/`. Generated archives belong in ignored `outputs/`; `preview.html` is a standalone design preview.

## Hostinger deployment

The production upload artifact is **`outputs/mercy-for-humanity-hostinger.zip`**. The generic `outputs/mercy-for-humanity.zip` is now a copy of this Hostinger deployment ZIP, rather than the previous source archive. The ZIP contains `index.php` at its root and only files required by the PHP website. No Node.js install, Cloudflare service, ChatGPT sign-in, or separate database import is required.

1. Choose a **Custom PHP/HTML** website on Hostinger with PHP 8.3 or newer.
2. Upload and extract the ZIP directly into `public_html` using File Manager. Use manual setup rather than the AI backup importer. Keep `.htaccess` and `.user.ini` from the ZIP. Rename any default hosting `index.html` or `default.php` so `index.php` is the entry point.
3. Open the generated `config.php` with File Manager's editor and copy `installation_key`. This key is private; do not publish the file as text or share the ZIP publicly before setup.
4. Open `/login` on your HTTPS website. Enter the key, choose your admin email and a password of at least 12 characters, and create the account. Setup locks after the first account exists. There is no default username or password.

The backend automatically creates **`mercyforhumanity-data` alongside `public_html`**, outside the public website. It holds the password hash, uploaded images, newsletter records, subscribers, volunteer enquiries, and contact messages. PHP must be able to create and write this directory. If permissions prevent automatic creation, create that private directory with File Manager and grant your hosting user write access. Never move it inside `public_html`. Back it up regularly and preserve it during future code updates. The ZIP includes no live records or credentials for an existing installation.

## Working features

- Public pages, hero slideshow, reduced-motion support, and keyboard-accessible gallery navigation.
- Admin login using PHP sessions, hashed passwords, CSRF checks, and login rate limits.
- Gallery uploads and deletion, with server-side image validation and random filenames.
- Newsletter publishing with cover image, title, and plain-text paragraphs. An explicitly labelled example appears until the first real publication.
- Newsletter signup with consent, normalized email deduplication, and an authenticated paginated subscriber list.
- Volunteer submissions with Email / phone and Canadian location, saved to the Volunteers admin inbox.
- Contact messages saved to the Messages admin inbox.

File-backed records use advisory locks and atomic replacement. All private data stays outside the public directory. Public API responses do not expose admin credentials, subscribers, or inbox submissions. The bundled PHP configuration includes an optional `donation_url` for the external Donate button; it remains a placeholder until supplied. Payment processing is external. Newsletter signup collects the list and newsletters are published on the website; automatic bulk email delivery and email notifications are not configured. Unconfirmed event dates, routes, partners, and contact details remain placeholders.

## Build and check

Use Node 24 for the development scripts:

```sh
node scripts/build-hostinger.mjs
node scripts/check.mjs
node scripts/hostinger-check.mjs
node scripts/package-hostinger.mjs
```

The package script verifies ZIP integrity and required root files. The Hostinger check verifies the compiled frontend, API routing, CSRF/session handoff, and package structure. If PHP is installed it also runs PHP lint and `scripts/test-hostinger.php`; otherwise it explicitly reports those runtime checks as not run. This development Mac currently has no PHP executable, so native PHP execution and browser/server QA on the hosting account remain unverified.

Source is in `web/` and `hostinger/`. A unique installation key is cached only in ignored `.local-data/` and written to the generated ZIP's PHP configuration. Regenerating a ZIP preserves that local installation key. Never commit generated keys, runtime records, or uploads.

The earlier Cloudflare Worker, D1 migration, and Node preview adapter remain in the repository as legacy development artifacts. They are excluded from the Hostinger upload ZIP. Their API tests remain useful regression checks; they do not constitute native PHP runtime verification.

The homepage regional-run slider uses fixed 285px desktop cards and a one-card-plus-peek mobile layout. It supports native swiping/scrolling, previous/next controls and pausable automatic movement. Reduced-motion settings, focus, hover, hidden tabs, and offscreen viewing stop autoplay. Seven cards link directly to the supplied run websites. Airdrie intentionally uses the same supplied photo as Guelph. The dedicated runs page displays the same seven simplified cards as a responsive grid, without dates, location labels, descriptions, or enquiry links.

Regional slider controls are centred beneath the cards with SVG icons geometrically centred in each circular button. The progress bar is removed.

Premium depth and motion are implemented in `web/premium.css` and `web/premium.js`: layered blue/red spheres and dimensional rings, framed hero photography, soft multi-layer shadows, pointer-driven card tilt and light reflections, and small magnetic button movement. Decorations are hidden from assistive technology and never intercept input. Pointer effects are limited to fine pointers, and all motion respects reduced-motion settings and the automatic reduced-motion setting. Ambient effects pause offscreen and when the tab is hidden; pointer updates are batched with requestAnimationFrame.

The updated transparent wide logo is preserved exactly as supplied in `web/logo.png`. Header/footer containers crop the empty top/bottom canvas with CSS; no artwork is regenerated. Navigation follows About, Charity Runs, Humanitarian Projects (dropdown only), Our Impact, Volunteer, Newsletters, Gallery, Contact. Model Village, Water for Life, and Our Impact have empty page bodies awaiting content. The logo links to the homepage.

Home is the first navigation item. The footer credit is an explicitly underlined external link to elevateviral.com. The visible motion control has been removed at the user’s request; OS reduced-motion preferences remain automatic. Coordinated reveals cover headings, paragraphs, navigation, form labels, supporting notes, footer links, and existing visual components, with shared easing and short stagger intervals.
