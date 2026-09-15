# TrashIt

TrashIt is a waste-exchange platform. People post items they want to get rid of and items they need, so useful things get reused instead of thrown away.

## What you can do

- Create an account and log in
- Post items you want to give away or buy
- Browse and search posts
- Set a price range and filter posts
- Get AI-generated ideas for what you could make from an item
- Optionally explore “what you could make” suggestions

The app has a backend API and a frontend web app.

## Tech stack

- **Frontend:** React (TypeScript/Vite)
- **Backend:** Node.js + Express
- **Database:** MongoDB (via Mongoose)
- **Image uploads:** Cloudinary
- **Real-time:** Socket.io (for messaging/notifications)

## Getting started

### Prerequisites

- Node.js
- MongoDB running and reachable
- Cloudinary account and credentials (for image uploads)

### Setup

1. Clone the repository and install dependencies.

```bash
cd TrashIt
cd Backend
npm install
cd ../Frontend
npm install
```

2. Configure environment variables.

Create a `.env` file in the backend folder. At minimum you will need something like:

```
PORT=5000
MONGO_URI=<your mongodb connection string>

# Optional: image uploads
CLOUDINARY_CLOUD_NAME=<your cloud name>
CLOUDINARY_API_KEY=<your api key>
CLOUDINARY_API_SECRET=<your api secret>
```

The frontend reads `VITE_API_URL` to know where the backend is. If you do not set it, it defaults to `http://localhost:5000`.

3. Start the backend.

```bash
cd Backend
npm run dev
```

The backend runs on port 5000 by default.

4. Start the frontend.

```bash
cd Frontend
npm run dev
```

Open the URL printed in the terminal.

### Seed users or test data

If the project uses seed scripts or test fixtures, run them only in a development environment and never with real production credentials.

## Features

### Posts

Posts are the main content in the app. A post describes an item someone is offering or looking for. Depending on the implementation, posts may support:

- title and description
- price information
- quantity
- images
- status such as active, sold, or closed

### Matching

Matching connects posts together. For example, an item someone is offering might pair with an item someone is looking for. The matching logic is based on the backend implementation and may use item name similarity or other criteria.

### AI features

The app can suggest reuse or creation ideas for items. These features call an external AI provider through the backend. They are optional and depend on the configured API keys.

## Environment variables

Backend example:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/trashit

# Image uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# AI features (optional)
GEMINI_API_KEY=
OPENROUTER_API_KEY=
GROK_API_KEY=
GROK_BASE_URL=https://api.x.ai/v1

# AI provider settings (optional)
GEMINI_MODEL=
OPENROUTER_MODEL=
GROK_MODEL=
AI_REQUEST_TIMEOUT_MS=30000
```

The exact keys depend on the features you want to enable. AI and image upload variables are optional.

## API

The backend exposes a REST API under `/api`. Common areas include authentication, posts, favorites, messages, notifications, reports, profile, admin endpoints, AI features, and matches.

WebSocket events are also used for real-time updates such as messages and notifications.

For the exact request shapes, see the Postman collection in the backend folder if one is provided.

## Folder layout

```text
TrashIt/
├── Backend/
│   ├── app.js
│   ├── controller/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── socket/
├── Frontend/
│   ├── src/
│   ├── public/
│   └── ...
└── README.md
```

## Security notes

- Do not commit `.env` files or API keys.
- Use strong passwords and rotate keys if they are exposed.
- Verify CORS, cookie, and token settings before exposing the backend publicly.

## License

This project is provided as-is for learning and reuse.
