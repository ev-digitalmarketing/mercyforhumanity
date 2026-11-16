# Mercy for Humanity

Responsive charity website for the Ahmadiyya Muslim Elders Association. Built with dependency-free HTML/CSS/JavaScript and a Cloudflare Worker. Montserrat headings and Open Sans body text load through Google Fonts; system fallbacks are included.

## Commands

`node scripts/build.mjs` creates `dist/server/index.js` with the supplied logo embedded.

`node scripts/test.mjs` verifies the Worker API with an in-memory R2 implementation.

`node scripts/gallery-test.mjs` checks lightbox navigation, wrapping, keyboard controls, and script syntax.

`node scripts/preview.mjs` runs a loopback-only preview on port 4173. Local preview supplies a mock owner identity and stores data in ignored `.local-data/`. This preview authentication adapter is never included in the deployed Worker.

## Hosted content management

The hosting manifest requests an R2 bucket bound as `BUCKET`. Gallery photos and newsletters persist in R2. Each newsletter has a cover image, title, and plain-text body preserving paragraphs. The manager supports previews, publication, and deletion.

The `/login` page uses Sites' ChatGPT sign-in. Hosted write operations require authenticated identity and same-origin requests, and rely on the Site's **owner-only platform access policy**. Keep this Site private. Before making the charity website public, introduce an explicit server-side administrator allowlist or supported role integration; signed-in identity alone must not grant public visitors write access.

## Placeholders

Contact and volunteer forms are labelled preview forms and send/store no details. Donate uses an external destination; set `DONATION_URL` near the top of the script in `web/index.html`. Until the destination is supplied, it shows a link-coming-soon notice. There is no payment processing UI. Contact information, event dates, locations, partners, and registration details are placeholders. Unsplash photos are illustrative and replaced in the gallery when real photos are uploaded. The supplied logo is unchanged.

## Environment limitation

The supplied Vinext starter could not install dependencies because this machine lacks npm. This site therefore uses a dependency-free Worker build. Source synchronization still requires a working Git executable and network access.

## Motion and gallery

Blue is the primary palette; red appears only in secondary accents. Shared easing coordinates scroll reveals, staggered entrances, page fades, hover feedback, drifting hero photography, floating icons, and animated blue backgrounds. A footer control pauses motion, and OS reduced-motion preferences are respected.

Gallery photos have no visible captions or description fields. The lightbox has previous/next buttons, left/right keyboard navigation, a position counter, and wraparound. Escape and the close button dismiss it.
