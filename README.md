# {{BRAND}} — Static Website v1

GitHub-Pages-ready static site. No build step, no CDN, no backend — pure HTML/CSS/JS. All tools run client-side in the visitor's browser.

## Pages (11 total)

- `index.html` — homepage
- `calculators/50-30-20-budget-calculator.html`
- `calculators/loan-emi-calculator.html`
- `tools/ai-prompt-generator.html`
- `tools/word-counter.html`
- `tools/password-generator.html`
- `about.html`, `contact.html`, `privacy-policy.html`, `terms.html`, `disclaimer.html`
- `sitemap.xml`, `robots.txt`, `favicon.svg`
- `assets/style.css`, `assets/site.js` (shared)

## Deploy to GitHub Pages

Option A — custom domain (recommended for AdSense approval):
1. Buy the domain (registrar of your choice), then create a GitHub repo, e.g. `site`.
2. Upload this folder's contents to the repo root (keep `calculators/` and `tools/` subfolders as-is).
3. Repo → Settings → Pages → Deploy from branch → `main` / root (`/`).
4. In Pages settings add the custom domain, enable **Enforce HTTPS**.
5. Add the 4 GitHub Pages A records + CNAME at your registrar (GitHub docs list them), or use your registrar's DNS template.
6. Add a `CNAME` file at repo root containing only your domain (GitHub usually creates it automatically).

Option B — free GitHub subdomain (quick preview only):
- Same steps 1–3; the site will be live at `https://<username>.github.io/<repo>/`.
- Note: AdSense strongly prefers a custom domain. Use this only for previewing before buying the domain.

## Replace the placeholders (do this before going live)

1. `{{BRAND}}` — the chosen site name. Replace literally everywhere:
   ```bash
   cd /path/to/site
   grep -rl '{{BRAND}}' . | xargs sed -i 's/{{BRAND}}/YourName/g'
   ```
2. `YOURDOMAIN.com` — the real domain, no protocol:
   ```bash
   grep -rl 'YOURDOMAIN.com' . | xargs sed -i 's/YOURDOMAIN.com/yourdomain.com/g'
   ```
3. `hello@YOURDOMAIN.com` — replace with the real contact email (it becomes `hello@yourdomain.com` automatically in step 2 if you use that address).
4. Check: after replacing, `grep -r '{{BRAND}}' .` and `grep -r 'YOURDOMAIN' .` should return nothing.

## Add a new tool page

1. Copy the closest existing tool page (e.g. `tools/word-counter.html`).
2. Update: `<title>` (long-tail keyword), meta description, canonical URL, OG tags, `<h1>`, the tool UI, and write a **500+ word original guide** under `#guide`.
3. Add the FAQ section with an FAQPage `application/ld+json` block (copy the pattern).
4. Add internal links: homepage grid + "More free tools" cards on all tool pages + the new page's own related cards.
5. Add the page URL to `sitemap.xml`.
6. Run the checks in `SEO-DAILY-SYSTEM.md` (Search Console → request indexing).

## Local preview

```bash
cd ~/workspace/adsense-website/site
python3 -m http.server 8000
# open http://localhost:8000
```

## Verification done on build (2026-10-15)

- All 11 HTML pages parsed with Python `html.parser` — no unclosed-tag errors.
- `Core.budget503020`, `Core.loanEmi`, `Core.analyzeText`, `Core.passwordEntropy`/`strengthLabel` unit-tested in Node 24 (see test section in the handoff/verification log).
- Each tool guide section verified ≥ 500 words by script.
