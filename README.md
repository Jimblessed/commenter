# Commenter

A full-stack Twitter/X clone built with Next.js, TypeScript, Tailwind CSS, and SQLite.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)

## Features

- **Authentication** - Register and log in with secure password hashing (bcrypt)
- **Posts** - Create, view, and delete posts (280 character limit)
- **Comments** - Reply to any post with threaded comment views
- **Likes** - Like and unlike posts with real-time count updates
- **Follow System** - Follow/unfollow users and see a personalized "Following" feed
- **User Profiles** - View any user's profile, bio, post history, and follower counts
- **Search** - Search for users and posts across the platform
- **Live Feed** - Auto-polling every 5 seconds with a "Show new posts" banner
- **Dark Theme** - Twitter/X-inspired dark UI with responsive design

## Tech Stack

| Layer      | Technology                        |
| ---------- | --------------------------------- |
| Framework  | Next.js 14 (App Router)          |
| Language   | TypeScript                        |
| Styling    | Tailwind CSS                      |
| Database   | SQLite via better-sqlite3         |
| Auth       | Cookie-based sessions with bcrypt |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/commenter.git
cd commenter

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The SQLite database (`commenter.db`) is created automatically on first run.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Login, register, logout, session
│   │   ├── posts/         # CRUD, likes, comments
│   │   ├── search/        # Search users and posts
│   │   └── users/         # Profiles, follow/unfollow
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── post/[id]/         # Single post + comments view
│   ├── profile/[username]/ # User profile page
│   ├── search/            # Search results page
│   ├── layout.tsx         # Root layout with navbar
│   └── page.tsx           # Home feed
├── components/
│   ├── AuthProvider.tsx   # Auth context provider
│   ├── ComposeBox.tsx     # Post composition form
│   ├── Navbar.tsx         # Top navigation bar
│   └── PostCard.tsx       # Reusable post display card
└── lib/
    ├── auth.ts            # Session & cookie helpers
    └── db.ts              # Database connection & schema
```

## API Routes

| Method | Endpoint                          | Description              |
| ------ | --------------------------------- | ------------------------ |
| POST   | `/api/auth/register`              | Create a new account     |
| POST   | `/api/auth/login`                 | Log in                   |
| POST   | `/api/auth/logout`                | Log out                  |
| GET    | `/api/auth/me`                    | Get current user session |
| GET    | `/api/posts`                      | Fetch all posts (feed)   |
| POST   | `/api/posts`                      | Create a new post        |
| GET    | `/api/posts/[id]`                 | Get a single post        |
| DELETE | `/api/posts/[id]`                 | Delete a post            |
| POST   | `/api/posts/[id]/like`            | Like/unlike a post       |
| GET    | `/api/posts/[id]/comments`        | Get comments on a post   |
| POST   | `/api/posts/[id]/comments`        | Add a comment to a post  |
| GET    | `/api/users/[username]`           | Get user profile         |
| GET    | `/api/users/[username]/posts`     | Get user's posts         |
| POST   | `/api/users/[username]/follow`    | Follow/unfollow a user   |
| GET    | `/api/search?q=`                  | Search users and posts   |

## Deployment

### Railway (Recommended)

1. Push this repo to GitHub
2. Go to [railway.com](https://railway.com) and create a new project from your repo
3. Add a **Volume** mounted at `/app/data`
4. Set the environment variable: `DATABASE_PATH=/app/data/commenter.db`
5. Deploy - Railway provides a public URL automatically

### Environment Variables

| Variable        | Description                        | Default          |
| --------------- | ---------------------------------- | ---------------- |
| `DATABASE_PATH` | Custom path for the SQLite DB file | `./commenter.db` |

## License

ISC
