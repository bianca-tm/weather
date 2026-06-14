# weather

A simple weather dashboard with a Node.js backend and a polished frontend experience.

## Run locally

The app is served by the backend at port 3000. You can start the backend and preview the frontend from the same URL, or run the frontend files separately with a simple static server.

### 1. Prerequisites

Install Node.js and npm from https://nodejs.org/.

The backend uses the National Weather Service API directly, so no API key is required.

### 2. Install dependencies

From the project root, install dependencies in both folders:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure environment variables

Create a file named `.env` inside the backend folder:

```env
HOST=0.0.0.0
PORT=3000
NWS_USER_AGENT=binkr-weather
```

### 4. Start the backend

Open one terminal and run:

```bash
cd backend
npm start
```

This starts the API server and serves the frontend at:

```text
http://localhost:3000
```

### 5. Start the frontend separately (optional)

If you want to preview the frontend files on their own, open a second terminal and run:

```bash
cd frontend
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

> The frontend can work as a static preview, but the weather data will only load if the backend is also running.

### 6. Open it in a browser

- Main app: http://localhost:3000
- Frontend preview: http://localhost:8080
- Backend API health check: http://localhost:3000/api/message
- Current weather for Dallas, Texas: http://localhost:3000/api/weather/current?city=Dallas&state=Texas
- 10-hour forecast for Dallas, Texas: http://localhost:3000/api/weather/forecast?city=Dallas&state=Texas

### 7. Access for others

If you want other people on the same network to view the frontend:
- Make sure port 3000 (or 8080 for the separate frontend preview) is allowed through your firewall
- Use your computer’s local IP address instead of localhost
- If needed, temporarily disable any VPN that may block local network access

To find your local IP address on Windows, run:

```powershell
ipconfig
```

Look for the IPv4 address under your active network adapter.

### 8. Stop the server

Press Ctrl+C in each terminal that is running a local server.

## Next ideas

- Add a more detailed forecast card layout
- Include icons and animated weather states
- Add a dark mode toggle



## Bugs
- still can view places that arent real


