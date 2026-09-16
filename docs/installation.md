# Data Journey — Installation & Local Setup Guide

## 1. Prerequisites
- Any modern web browser: **Google Chrome**, **Microsoft Edge**, **Mozilla Firefox**, or **Safari** (macOS/iOS).
- No Node.js, Python, or database installation required!

---

## 2. 1-Click Launch on Windows
1. Open the project folder:
   ```
   C:\Users\ICT\Desktop\Progress Tracker\
   ```
2. Double-click **`start-app.bat`**.
3. This will launch a lightweight background static web server using built-in PowerShell (`server.ps1`) and open **`http://localhost:8080`** in your default browser.

---

## 3. Alternative Local Servers
If you prefer running via command line or other tools:

### Using Python (if installed):
```bash
python -m http.server 8080
```

### Using Node.js / npx (if installed):
```bash
npx serve . -p 8080
```

### Using VS Code Live Server:
Right-click `index.html` and select **"Open with Live Server"**.

---

## 4. Progressive Web App (PWA) Installation

### On Desktop (Chrome / Edge / Brave):
1. Navigate to `http://localhost:8080` (or your deployed HTTPS URL).
2. Look at the right side of the browser URL address bar for the **Install** icon (a computer monitor with a down arrow).
3. Click **Install Data Journey**.
4. The application will launch in its own standalone, distraction-free app window, pinned to your taskbar and start menu!

### On Mobile (Android / Chrome):
1. Open the website in Chrome.
2. Tap the three-dot menu icon in the top right.
3. Select **"Install App"** or **"Add to Home screen"**.
4. Launch Data Journey from your home screen like any native Android app.

### On iOS (Safari):
1. Open the URL in Safari.
2. Tap the **Share** button (box with an upward arrow).
3. Scroll down and tap **"Add to Home Screen"**.

---

## 5. Offline Operation
Once you have loaded the application in your browser at least once, all core assets (HTML, CSS, JS, SVG icons) are automatically cached via the Cache API and Service Worker (`service-worker.js`). You can completely disconnect your internet, restart your computer, open the PWA or browser, and use Data Journey with 100% functionality.
