# Data Journey — Deployment & Static Hosting Guide

Because **Data Journey** is a client-side, offline-first application with zero backend dependencies, it can be deployed to any static web host in seconds.

---

## 1. GitHub Pages (Free, Recommended)
1. Initialize a git repository and commit all files:
   ```bash
   git init
   git add .
   git commit -m "Initial release of Data Journey"
   ```
2. Create a GitHub repository and push your branch:
   ```bash
   git remote add origin https://github.com/your-username/data-journey.git
   git branch -M main
   git push -u origin main
   ```
3. Go to **Repository Settings** > **Pages**.
4. Under **Branch**, select `main` and root folder `/`, then click **Save**.
5. Your app is now live at `https://your-username.github.io/data-journey/` with full HTTPS and PWA installability!

---

## 2. Vercel (Free & Instant)
1. Install the Vercel CLI (or connect your GitHub repo via Vercel dashboard):
   ```bash
   npx vercel
   ```
2. Accept the default static deployment prompts.
3. The included `vercel.json` automatically disables aggressive `cleanUrls` redirects and sets `Service-Worker-Allowed: /` and `Cache-Control` headers for maximum offline PWA reliability.
4. Your app is live instantly on an HTTPS URL with full offline support!

---

## 3. Netlify (Free & Drag-and-Drop)
1. Log in to [Netlify](https://app.netlify.com/).
2. Drag and drop the entire `Progress Tracker` folder into the Netlify **Deploy** area.
3. Done! Netlify provisions an SSL certificate and deploys the site immediately.

---

## 4. HTTPS & PWA Requirements
Service Workers require either:
1. `http://localhost` (for local development and testing)
2. `https://` (for production web deployments)

Deploying to GitHub Pages, Vercel, or Netlify provides free automated SSL certificates, fulfilling all PWA criteria.
