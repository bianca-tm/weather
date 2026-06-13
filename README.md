# weather

A simple weather app with a Node.js backend and a Lit-based frontend.

## Run locally

The frontend is served by the backend, so the main app is started from the backend. The frontend itself does not need a separate server for normal use.

### 1. Prerequisites

Install Node.js and npm from https://nodejs.org/.

You will also need a Weatherstack API key:
- Create an account at https://weatherstack.com/
- Copy your API key

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
WEATHERSTACK_API_KEY=your_api_key_here
HOST=0.0.0.0
PORT=3000
```

### 4. Start the app

Start the backend:

```bash
cd backend
npm run start
```

This starts the server and serves the frontend at:

```text
http://localhost:3000
```

### 5. Open it in a browser

- Frontend: open http://localhost:3000
- Backend API: open http://localhost:3000/api/message
- From another device on the same network: open http://<your-computer-ip>:3000

If you want to preview just the frontend files without the backend, you can also open [frontend/index.html](frontend/index.html) directly in a browser, but the weather data API will not work unless the backend is running.

To find your local IP address on Windows, run:

```powershell
ipconfig
```

Look for the IPv4 address under your active network adapter.

### 6. Access for others

If you want other people on the same network to view the frontend:
- Make sure port 3000 is allowed through your firewall
- Use your computer’s local IP address instead of localhost
- If needed, temporarily disable any VPN that may block local network access

### 7. Stop the server

Press Ctrl+C in the terminal running the server.


