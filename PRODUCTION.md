# Deploying to a Monitor (Kiosk Mode)

To display your digital signage on a TV or Monitor, follow these steps:

## 1. Build & Start the Server
First, build the production version of the frontend and start the backend server.

```bash
# Install dependencies (if not already done)
npm install

# Build the frontend (creates dist folder)
npm run build

# Start the server (runs on port 3000)
npm run start
```

## 2. Open on Monitor
On the computer connected to the display screen:

1. Open Chrome (or any modern browser).
2. Navigate to: `http://localhost:3000/`
   (Replace `localhost` with the server's IP address if the monitor is on a different machine).

## 3. Enter Fullscreen (Kiosk Mode)
- **Mac**: `Cmd + Shift + F` (or View > Enter Full Screen)
- **Windows**: `F11`

### Auto-Launch (Optional)
To launch Chrome directly in Kiosk mode without address bar:

**Mac:**
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --kiosk "http://localhost:3000"
```

**Windows:**
```bash
chrome.exe --kiosk "http://localhost:3000" --fullscreen
```

## Troubleshooting
- **Pairing Screen?**: If you see a pairing code, go to `http://localhost:3000/admin` on another device to "Assign" that screen to a project.
- **Wrong Project?**: Force a specific project by adding `?project=YOUR_PROJECT_ID` to the URL.
  Example: `http://localhost:3000/?project=nutrition-nest`
