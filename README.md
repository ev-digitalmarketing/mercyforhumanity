# Mercy for Humanity

All project files live in `/Users/h/sites/mercyforhumanity/`. Open `preview.html` for the standalone design preview. Downloadable archives belong in the ignored `outputs/` folder; compiled Worker files and an additional preview are in `dist/`.

Responsive charity website for the Ahmadiyya Muslim Elders Association. Built with dependency-free HTML/CSS/JavaScript and a Cloudflare Worker. Montserrat headings and Open Sans body text load through Google Fonts; system fallbacks are included.

## Commands

`node scripts/build.mjs` creates `dist/server/index.js` with the supplied logo embedded.

`node scripts/test.mjs` verifies the Worker API with an in-memory R2 implementation.

`node scripts/gallery-test.mjs` checks lightbox navigation, wrapping, keyboard controls, and script syntax.

`node scripts/check.mjs` builds the site and runs all API, gallery, subscriber, and homepage checks. Subscriber tests use real SQLite through Node's built-in `node:sqlite` module (Node 24 recommended).

`node scripts/preview.mjs` runs a loopback-only preview on port 4173. Local preview supplies a mock owner identity and stores data in ignored `.local-data/`. This preview authentication adapter is never included in the deployed Worker.

## Hosted content management

The hosting manifest requests an R2 bucket bound as `BUCKET`. Gallery photos and newsletters persist in R2. Each newsletter has a cover image, title, and plain-text body preserving paragraphs. The manager supports previews, publication, and deletion.

The footer newsletter signup saves an optional name, normalized email address, signup timestamp, and consent version in D1 bound as `DB`. Duplicate emails retain their original signup. The admin's **Subscribers** tab shows names, email addresses, and dates, with pagination through the entire list. Subscriber records are never included in public content responses. The signup endpoint requires explicit consent and same-origin JSON submissions, validates input, and includes a honeypot field. This collects a mailing list; automatic email delivery is not connected.

The schema is in `db/schema.sql`; `node scripts/generate-migrations.mjs` generates the initial schema-only migration and Sites-compatible journal in `drizzle/`. Existing migration files must not be rewritten. The deployment archive includes these migrations; Sites applies them during publication. Local preview applies migrations to `.local-data/subscribers.sqlite` at startup. Local and hosted databases are separate. The standalone HTML design preview does not save signups or contain actual subscriber data.

The `/login` page uses Sites' ChatGPT sign-in. Hosted write operations require authenticated identity and same-origin requests, and rely on the Site's **owner-only platform access policy**. Keep this Site private. Before making the charity website public, introduce an explicit server-side administrator allowlist or supported role integration; signed-in identity alone must not grant public visitors write access.

## Placeholders

Contact and volunteer forms are labelled preview forms and send/store no details. Donate uses an external destination; set `DONATION_URL` near the top of the script in `web/index.html`. Until the destination is supplied, it shows a link-coming-soon notice. There is no payment processing UI. Contact information, event dates, locations, partners, and registration details are placeholders. The three supplied community-run photos are stored in `web/images/`, reused across the website, and embedded in the Worker and standalone preview. No stock-photo URLs remain. The gallery shows these three photos until uploads replace them. The supplied logo is unchanged.

## Environment limitation

The supplied Vinext starter could not install dependencies because this machine lacks npm. This site therefore uses a dependency-free Worker build. Source synchronization still requires a working Git executable and network access.

## Motion and gallery

Blue is the primary palette; red is the secondary colour on the Donate button, service ribbon icons, newsletter highlights, and signup action. The homepage introduces the Islamic inspiration for the work and highlights the three most recent published newsletters. The bundled example issue in `web/example-newsletter.json` appears on the homepage and newsletter page until a real newsletter is published. It is marked as an example and does not claim completed events or confirmed dates. The admin identifies it as an example rather than offering a delete action on the bundled fallback. Shared easing coordinates scroll reveals, staggered entrances, page fades, hover feedback, drifting hero photography, floating icons, and animated blue backgrounds. A footer control pauses motion, and OS reduced-motion preferences are respected.

Gallery photos have no visible captions or description fields. The lightbox has previous/next buttons, left/right keyboard navigation, a position counter, and wraparound. Escape and the close button dismiss it.

Regional charity runs are listed by city, including Windsor, Guelph, Hamilton, and Edmonton. There are no cycling/hiking categories or activity filters. Dates, venues, routes, partners, and registration remain to be confirmed.

Volunteer form: the required **Email / phone** text field accepts either contact method. **Location** asks for a Canadian city, province, or territory rather than an area of interest. The form remains a clearly labelled preview and does not submit or store volunteer details. Public copy uses Canadian English and centres Canadian communities and regional charity runs; addresses and other unconfirmed details remain placeholders.

The homepage hero cycles through the three bundled community photographs every six seconds with a crossfade. It includes previous/next arrows, slide dots, and a pause/play control. Playback pauses on hover, keyboard focus, hidden tabs, and offscreen viewing; reduced-motion settings and the global Pause motion control disable automatic playback. Manual navigation remains available.
