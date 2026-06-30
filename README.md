# Min-Max Tracker

An installable (offline-capable) tracker for Jeff Nippard's Min-Max Program (5x/Week) — workout logging, progress charts, weekly check-ins, and the full 12-week schedule.

## 1. Push this to GitHub

1. Create a new repository on GitHub (e.g. `min-max-tracker`). Don't initialize it with a README.
2. From inside this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

## 2. Turn on GitHub Pages

1. On GitHub, go to your repo → **Settings → Pages**.
2. Under "Build and deployment", set **Source** to **GitHub Actions**.
3. That's it — the included workflow (`.github/workflows/deploy.yml`) will build and deploy automatically every time you push to `main`. Check the **Actions** tab to watch it run (~1 minute).
4. Once it finishes, your app is live at:
   `https://YOUR_USERNAME.github.io/YOUR_REPO/`

## 3. Install it on your phone

**iPhone (Safari):** open the link above → tap the Share icon → **Add to Home Screen**.

**Android (Chrome):** open the link above → tap the **⋮** menu → **Install app** (or you'll see an automatic "Add to Home Screen" prompt).

The app icon will appear on your home screen and open full-screen, like a native app. Your workout logs, check-ins, and program start date are saved on-device and work fully offline after the first load.

## Local development (optional)

```bash
npm install
npm run dev
```

Then open the printed local URL. To produce a production build manually:

```bash
npm run build
npm run preview
```

## Notes

- Data is stored in the browser's local storage on your device. It is **not** synced across devices — if you reinstall the app or switch phones, your history won't carry over. (Worth keeping in mind; an export/backup feature could be added later if useful.)
- To update the app after editing the code, just commit and push to `main` — the GitHub Action redeploys automatically.
