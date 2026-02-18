# Deploying to Cloud (Replit / Render)

Since this app saves data to JSON files (`config.json`, `promotions.json`), you need a hosting provider that keeps your files (Persistent Storage).

**We recommend Replit** as it is the easiest way to keep the CMS working without a database.

## Option A: Replit (Recommended)

1.  **Create a GitHub Repository**:
    - Push this code to a new repository on your GitHub.
2.  **Import to Replit**:
    - Go to [Replit.com](https://replit.com) -> **+ Create Repl** -> **Import from GitHub**.
    - Select your new repository.
3.  **Run**:
    - Replit will detect the settings (I added a `.replit` file for you).
    - Click **Run**.
4.  **Get the Link**:
    - A webview window will open. Example: `https://digit-signage.username.repl.co`.
    - Use this link on your Ubiquiti Display!

## Option B: Render / Railway (Advanced)
*Warning: Data will reset every time you deploy unless you configure a Disk.*

1.  Create a "Web Service" connected to your GitHub repo.
2.  Build Command: `npm install && npm run build`
3.  Start Command: `npm start`
4.  **Persistence**: You must add a "Disk" (Persistent Volume) mounted to `/opt/render/project/src/public/projects` to save your changes.

## Why not Vercel?
Vercel is "Serverless". It cannot save changes to `config.json` permanently. Use Vercel only if you don't need the CMS (read-only).
