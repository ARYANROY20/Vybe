# Vybe

Vybe is a full-stack social media application with authentication, posts, stories, comments, likes, connections, real-time messaging, notifications, and profile management.

Live Demo: https://vybe-inky.vercel.app/

## Tech Stack

- React, Vite, Tailwind CSS
- Redux Toolkit
- Express.js
- MongoDB with Mongoose
- Clerk authentication
- ImageKit for media uploads
- Inngest for background jobs
- Nodemailer for email notifications

## Features

- User authentication with Clerk
- Create posts with text and images
- Like, comment, and share posts
- Stories with media support
- Discover users and manage connections
- Real-time chat with image messages
- Recent messages and message notifications
- Profile editing with profile and cover photos
- Email reminders and background jobs

## Project Structure

```text
Vybe/
  client/   React frontend
  server/   Express backend
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ARYANROY20/Vybe.git
cd Vybe
```

### 2. Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 3. Set up environment variables

Create `client/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=
VITE_BASEURL=
```

Create `server/.env`:

```env
FRONTEND_URL=
MONGODB_URL=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
SENDER_EMAIL=
SMTP_USER=
SMTP_PASS=
```

### 4. Run the app

Start the backend:

```bash
cd server
npm run server
```

Start the frontend:

```bash
cd client
npm run dev
```

## Available Scripts

### Client

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Server

```bash
npm run server
npm start
```

## API Routes

```text
/api/user
/api/post
/api/story
/api/message
/api/comment
/api/inngest
```

## Deployment

The project includes separate Vercel configuration files for the frontend and backend:

```text
client/vercel.json
server/vercel.json
```

Set the required environment variables in your deployment platform before deploying.

## License

ISC
