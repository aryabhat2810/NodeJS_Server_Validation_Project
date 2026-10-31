# Server-Side Validation Application using Node.js

## Requirements
- Node.js 18 or later
- npm (bundled with Node.js)

## Run locally
1. Extract the ZIP and open the project folder in VS Code.
2. Open a terminal in this folder.
3. Run `npm start`.
4. Open `http://localhost:3000` in your browser.

No third-party npm packages are required. The application uses Node.js core modules.

## API endpoints
- `GET /` — API overview
- `GET /api/health` — health check
- `POST /api/register` — validates name, email and age
- `GET /api/logs` — reads accepted-registration audit events from a file stream

### Valid request
```bash
curl -i -X POST http://localhost:3000/api/register -H "Content-Type: application/json" -d "{\"name\":\"Arya Bhat\",\"email\":\"aryabhat28@example.com\",\"age\":21}"
```

### Invalid request
```bash
curl -i -X POST http://localhost:3000/api/register -H "Content-Type: application/json" -d "{\"name\":\"A\",\"email\":\"not-an-email\",\"age\":15}"
```
A valid registration returns HTTP 201. Validation errors return HTTP 422; malformed JSON returns HTTP 400; unknown routes return HTTP 404.

## Node.js concepts demonstrated
- **HTTP:** built-in `http` module and GET/POST handling.
- **Custom module:** `src/validator.js` exports `validateRegistration`.
- **Events:** `EventEmitter` emits `registration:accepted` after valid data.
- **File system:** accepted registration audit events are stored in `data/requests.log`.
- **Streams:** `fs.createWriteStream` appends logs and `fs.createReadStream` reads them.

## Deployment (Render)
1. Push this folder to your own GitHub repository.
2. In Render, create a **Web Service** and connect that repository.
3. Set **Build Command** to `npm install` (no external dependencies are needed; it is acceptable if this finishes quickly).
4. Set **Start Command** to `npm start`.
5. Deploy and copy the public URL into your report/submission.
6. Test `YOUR_RENDER_URL/api/health` and the valid/invalid POST requests.

**Note:** deployment is not performed automatically by this project. Add your actual deployed URL and GitHub repository URL after you deploy.

## Screenshots for report
Capture screenshots from your own running server:
- Valid POST request showing HTTP 201.
- Invalid POST request showing HTTP 422 and field errors.
- `GET /api/health` showing HTTP 200.
- Browser demo page after a valid submission.

## AI use declaration
If AI assistance was used, describe the tool/prompt, one output you checked and how, and one correction/rejection. Edit the declaration in your report to accurately reflect your own use.
