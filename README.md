# twilight-docs-site

The user-facing documentation at docs.twilight.org, built with Docusaurus.

    npm install
    npm start          # http://localhost:3000
    npm run build      # static site in build/

Pages are Markdown in `docs/`, ordered by `sidebars.js`. The technical
documents for agents and developers (`twilight.md`, `search-router.md`,
`skill.md`, `llms.txt`, `manifest.json`, `reference.html`, `search-router.html`)
are copied into `static/` from the `twilight-docs` repository, which builds them.

## Deploy (Cloudflare Pages)

| Setting | Value |
|---|---|
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `build` |
| Node version | 20 or newer (`NODE_VERSION` environment variable) |

`static/_headers` and `static/_redirects` are Cloudflare's.
