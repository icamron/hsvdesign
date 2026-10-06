# HsvDesign: Vercel + Supabase

Prepared for https://hsvdesigns.com and https://github.com/icamron/hsvdesign.
Preserves the homepage, ten city pages, themes, shared portfolio, client-logo strip, contact form, and camron/password dashboard.

## 1. Supabase

Open https://supabase.com/dashboard/project/kaphryyszxopjtqpkbba.
In SQL Editor, paste and run supabase/01-setup.sql. Then run supabase/02-import-portfolio.sql in a second query.
The import adds 38 current portfolio/client-logo records, including order and featured flags. Rerunning does not overwrite existing records. Separate hsv_ tables avoid other applications' tables.

Tables have row-level security enabled and no browser grants. Vercel verifies admin sessions for changes. This implementation uses a server-only Supabase secret key; the supplied publishable key is not needed by the browser and cannot create tables or administer this dashboard.

## 2. GitHub

Unzip the package. Upload the CONTENTS of hsvdesign-vercel to the root of the private icamron/hsvdesign repository. package.json and vercel.json must be at the root. Include the folders and lockfile. Do not upload dist, .env files or node_modules. No actual passwords or privileged API keys are included.

## 3. Vercel

Import icamron/hsvdesign. Framework Preset: Other. Build: npm run build. Output: dist. Node.js: 22.
The supplied vercel.json configures routes and build settings.

Add these Environment Variables before deploying:

| Name | Value |
| --- | --- |
| SUPABASE_URL | https://kaphryyszxopjtqpkbba.supabase.co |
| SUPABASE_SECRET_KEY | Your sb_secret_ key from Supabase Settings > API Keys |
| PASSWORD_PEPPER | New random secret of at least 32 characters; keep stable |
| ADMIN_SETUP_TOKEN | Different random secret of at least 32 characters; used once |

Generate the two random secrets with a password manager. Enter them directly in Vercel, never in GitHub or frontend code. Use Production variables. Preview variables allow that preview to access the same data, so enable them only for trusted testing branches.

Deploy, open /admin on the Vercel URL, enter the setup token and choose a password of 12–256 characters for camron. You may choose your old password again. Old password hashes and sessions are not exported. After setup remove ADMIN_SETUP_TOKEN and redeploy. Keep PASSWORD_PEPPER unchanged so your password continues to verify.

New JPG, PNG, WebP and GIF uploads up to 8 MB go directly to Supabase using signed upload URLs, avoiding Vercel's request limit. Existing uploaded images are bundled under public/media and need no image import. Video entries continue using external links. The public storage bucket is intended for website images, not confidential files.

## 4. Check the temporary Vercel site

- Check homepage, all city links, dark/light mode and mobile layouts.
- Verify the portfolio and logo strip against the 38-record snapshot.
- Log in, create a draft, upload an image, save, reopen, edit and delete that test draft.
- Check a published edit appears across pages, then restore your content.
- Log out and confirm changes require login.
- Submit a test form and verify delivery to huntsvilledesigns@gmail.com. Approve any FormSubmit activation email for the new domain. Delivery on the new domain has not been tested.

## 5. Domain

Add hsvdesigns.com and www.hsvdesigns.com in Vercel Settings > Domains. Use hsvdesigns.com as primary, redirect www to it. In Namecheap use the exact DNS records Vercel provides. Preserve email records. Change DNS only after the temporary site works.

Canonical URLs, schema, sitemap and robots build with https://hsvdesigns.com. Keep previews protected from indexing. Once public, check HTTPS and submit /sitemap.xml to Google Search Console.

## Status

Prepared locally, not deployed to Vercel or written to Supabase. No DNS changes. Account access is needed to run SQL, add secrets and deploy. Snapshot dated October 6, 2026; later old-site edits do not sync automatically. Referenced uploaded images are included; orphaned uploads are not. The old site is intact.

npm test runs local tests with mocked Supabase responses. npm run build creates static output. Live login, storage and email delivery still need the checks above.
