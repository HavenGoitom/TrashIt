# TrashIt 

**TrashIt** is a community-driven marketplace for buying, selling, and repurposing materials � powered by AI. List what you have, find what you need, and let our AI match you with the right people or spark creative ways to upcycle your items.

> Built to reduce waste and connect communities through smarter resource sharing.

## Live Demo

**[trash-it-three.vercel.app](https://trash-it-three.vercel.app/)**

---

##  Tech Stack

<p align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

##  Screenshots

###  AI  "What Could I Make?"
> Tell the AI what material you have and it suggests creative ways to reuse, repurpose, or upcycle it � with step-by-step instructions.

![AI What Could I Make](./screenshots/image.png)

---

###  AI Post Matches
> The AI scans BUY and SELL posts and automatically connects you with the most relevant listings.

![AI Post Matches](./screenshots/image%20copy.png)

---

###  Create a Post
> Easily list what you're selling or what you're looking for in a clean two-step flow.

![Create a Post](./screenshots/image%20copy%202.png)

---

###  Browse Posts
> Explore community listings with filters by type, status, price range, and sort order.

![Browse Posts](./screenshots/image%20copy%203.png)

---

###  Live Messages
> Real-time chat powered by WebSockets � negotiate, ask questions, and close deals instantly.

![Live Messages](./screenshots/image%20copy%204.png)

---

###  Notifications
> Get instant alerts for AI matches and new messages � all in one place.

![Notifications](./screenshots/image%20copy%205.png)

---

##  Features

-  **Buy & Sell Listings**  Post items you have or materials you need
-  **AI Upcycle Ideas**  Get creative reuse suggestions for any material
-  **AI Match Engine**  Automatically pairs compatible buy/sell posts
-  **Real-time Messaging**  Live chat via WebSockets between buyers and sellers
-  **Smart Notifications**  Instant alerts for matches and messages
-  **Image Uploads**  Powered by Cloudinary
-  **Auth & Security**  JWT authentication with rate limiting and helmet
-  **Admin Panel**  Manage posts, users, and platform content

##  Getting Started

### Frontend

```bash
cd web
npm install
npm run dev
```

### Backend

```bash
cd Backend
npm install
npm run dev
```

### Admin

```bash
cd Admin
npm install
npm run dev
```

> Copy `.env` files and fill in your `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_*`, and frontend origin URLs.
