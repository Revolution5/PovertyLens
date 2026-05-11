# PovertyLens

PovertyLens is a full-stack web application designed to educate, inform, and empower users to take action against global poverty. It combines real-world data, community storytelling, interactive tools, and donation capabilities into a single platform.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [For Graders](#for-graders)
- [API Routes](#api-routes)
- [Contributors](#contributors)

---

## Features

### Public (No Login Required)
- **Landing Page** — Mission statement, daily poverty fact, and public pledge wall preview
- **Global Poverty Statistics** — Interactive Leaflet map with national and international poverty rate data by country
- **Educational Resources** — Curated links, articles, and guides on poverty and inequality
- **Poverty Timeline** — Horizontal scrolling timeline of major historical poverty events with flip cards and expandable descriptions
- **Poverty Glossary** — Searchable A–Z glossary with flip cards (term on front, definition on hover), bookmarks, learned tracking, and personal notes
- **Pledge Wall (Public View)** — Browse community pledges without an account
- **Donations Page** — Donate via Stripe with animated real-time impact counters pulled from Stripe's API
- **Contact Us** — Contact form with event submission for the Awareness Calendar
- **FAQ** — Frequently asked questions
- **About Us** — Team and mission information
- **Backend Offline / Offline pages** — Graceful fallback when backend is unreachable

### Logged-In Users
- **Dashboard** — Personalized welcome, action cards, awareness calendar, and quick stats
- **Upload Story** — Share personal experiences or insights about poverty
- **View Stories** — Browse, archive, and delete your own stories; read community stories
- **FreeRice** — Answer trivia to donate rice grains with leaderboard and recent activity tracking
- **Pledge Wall (User View)** — Make public pledges, mark pledges as completed, filter by category
- **Currency Calculator** — Convert between world currencies in real time
- **Awareness Calendar** — Browse verified upcoming volunteering events, awareness days, fundraisers, and campaigns
- **Inbox** — In-app messaging and inbox drawer
- **Groups** — Community groups feature
- **Notifications** — In-app notifications for account activity
- **Rewards Shop** — Earn and spend rewards points
- **Map Timeline** — Combined map and timeline view
- **Profile** — Update profile details, upload avatar, manage account
- **Account Activity** — View login and activity history
- **Forgot Password** — Password reset flow
- **Search** — Site-wide search

### Admin
- **Admin Dashboard** — Manage users, events, and content
- Approve or reject user-submitted events for the Awareness Calendar
- All user event submissions start as `pending` until approved

---

## Tech Stack

### Frontend
- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** — utility styling
- **GSAP** — dashboard entrance animations
- **Leaflet / React Leaflet** — interactive poverty statistics map
- **Stripe.js / React Stripe.js** — payment UI
- **Lucide React** — icons
- **CSS Variables** — theming (light/dark/high-contrast mode, brand colors)

### Backend
- **Node.js + Express**
- **MongoDB** (via native driver) — all collections: users, stories, donations, pledges, timeline, glossary, events, freerice, groups, messages, notifications, rewards, activity logs
- **Stripe** — payment processing and donation stats
- **Resend** — newsletter and email notifications

---

## Project Structure

```
PovertyLens/
│
├── backend/
│   ├── app.js                      # Entry point, route mounts
│   ├── database.js                 # MongoDB connection
│   ├── helpers/
│   │   ├── dailyfactshelper.js
│   │   ├── inboxHelper.js
│   │   ├── messagesHelper.js
│   │   ├── newsletterhelper.js
│   │   └── notificationshelper.js
│   ├── models/                     # MongoDB schema models
│   └── routes/
│       ├── activitylog.js
│       ├── admin.js
│       ├── auth.js
│       ├── chat.js
│       ├── contact.js
│       ├── currency.js
│       ├── dailyfacts.js
│       ├── donations.js
│       ├── event.js
│       ├── freerice.js
│       ├── glossaryRoutes.js
│       ├── groups.js
│       ├── messages.js
│       ├── newsletter.js
│       ├── notifications.js
│       ├── pledges.js
│       ├── povertystats.js
│       ├── profile.js
│       ├── rewards.js
│       ├── stories.js
│       └── timeline.js
│
└── frontend/
    ├── app/
    │   ├── page.tsx                # Homepage / Dashboard
    │   ├── AboutUs/
    │   ├── accessibility/
    │   ├── accountActivity/
    │   ├── admin-dashboard/
    │   ├── api/
    │   ├── backend-offline/
    │   ├── ContactUs/
    │   ├── currencycalculator/
    │   ├── donationfailed/
    │   ├── donationpages/
    │   ├── donationsuccess/
    │   ├── eduresource/
    │   ├── FAQ/
    │   ├── forgot-password/
    │   ├── freerice/
    │   ├── glossary/
    │   ├── groups/
    │   ├── inbox/
    │   ├── map-timeline/
    │   ├── nonuserpledgewall/
    │   ├── notifications/
    │   ├── offline/
    │   ├── PLdonation/
    │   ├── pledgewalluser/
    │   ├── profile/
    │   ├── rewards-shop/
    │   ├── search/
    │   ├── signin/
    │   ├── statistics/
    │   ├── SubmitEventForm/
    │   ├── timeline/
    │   ├── uploadstory/
    │   └── viewstories/
    ├── favicon.ico
    ├── globals.css
    ├── layout.tsx
    ├── page.tsx
    └── components/
        ├── addCard.tsx
        ├── AIchatBot.tsx
        ├── AppTour.tsx
        ├── AwarenessCalendar.tsx
        ├── BackendStatus.tsx
        ├── colorblindPalette.ts
        ├── ColorblindProvider.tsx
        ├── currencycalculator.tsx
        ├── FreeRiceLeaderboard.tsx
        ├── FreeRiceRecent.tsx
        ├── ImageUpload.tsx
        ├── InboxDrawer.tsx
        ├── mapfilters.tsx
        ├── Navbar.tsx
        ├── navigationSupport.tsx
        ├── NotificationBell.tsx
        ├── PledgeWallPublic.tsx
        ├── PoiFilters.tsx
        ├── PovertyStorySearch.tsx
        ├── RewardsShop.tsx
        ├── SimpleUIToggle.tsx
        ├── StatisticsMap.tsx
        ├── StatisticsMapClient.tsx
        ├── StatisticsMapLeaflet.tsx
        ├── ThemeProvider.tsx
        ├── ThemeToggle.tsx
        └── UserAppTour.tsx
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Stripe account (sandbox/test keys for development)
- Resend account (for email/newsletter features)

### 1. Clone the repository
```bash
git clone https://github.com/Revolution5/PovertyLens.git
cd PovertyLens
```

### 2. Install backend dependencies
```bash
cd backend
npm init
npm install
npm install express
npm install mongodb
npm install cors
npm install dotenv
npm install stripe
npm install @stripe/stripe-js @stripe/react-stripe-js
npm install @google/generative-ai
npm install recharts
npm install resend
npm install i18n-iso-countries
```

### 3. Install frontend dependencies
```bash
cd ../frontend
npm install react
npm install react-leaflet leaflet
npm install leaflet.markercluster
npm install -D @types/leaflet.markercluster
npm install lucide-react
npm install gsap
npm install multer
npm install tesseract.js
```

### 4. Add environment variable files
See [For Graders](#for-graders) or [Environment Variables](#environment-variables) below.

### 5. Run the backend
```bash
cd backend
node app.js
# or with nodemon for auto-restart:
nodemon app.js
```
Backend runs on **http://localhost:4000**

### 6. Run the frontend
```bash
cd frontend
npm run dev
```
Frontend runs on **http://localhost:3000**

---

## Environment Variables
## For Graders

The .env and .env.local are **not included in this repository** for security reasons. They have been sent to you separately by uploading it to the Canvas Final Submissions Box.

Before running the project, place the files as follows:

```
backend/
└── .env

frontend/
└── .env.local
```

Then follow the Getting Started steps above. You do not need to create any accounts — the provided keys give access to the test Stripe environment and the shared MongoDB database.

---

## API Routes 

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/signup` | Register a new user |
| POST | `/api/login` | Log in |
| POST | `/api/logout` | Log out |
| POST | `/api/forgot-password` | Password reset |
| GET/PATCH/DELETE | `/api/profile` | User profile management |
| GET/POST | `/api/stories` | Fetch / upload stories |
| PATCH | `/api/stories/:id/archive` | Archive a story |
| DELETE | `/api/stories/:id` | Delete a story |
| GET/POST | `/api/donations` | Log donations |
| POST | `/api/donations/create-payment-intent` | Create Stripe PaymentIntent |
| GET | `/api/donations/stats` | Real donation stats from Stripe |
| GET/POST | `/api/pledges` | Fetch / create pledges |
| GET | `/api/pledges/presets` | Preset pledge options |
| PATCH | `/api/pledges/:id/complete` | Mark pledge as completed |
| GET/POST | `/api/timeline` | Fetch / add timeline events |
| DELETE | `/api/timeline/:id` | Delete a timeline event |
| GET/POST | `/api/glossary` | Fetch / add glossary terms |
| PATCH | `/api/glossary/:id/userdata` | Save bookmark / learned / note |
| GET | `/api/glossary/userdata/:email` | Fetch user's glossary data |
| GET/POST | `/api/events` | Fetch / submit awareness calendar events |
| PATCH | `/api/events/:id/approve` | Admin: approve a submitted event |
| PATCH | `/api/events/:id/reject` | Admin: reject a submitted event |
| GET | `/api/freerice/user-total` | Get user's total rice grains |
| GET | `/api/freerice/leaderboard` | FreeRice leaderboard |
| GET | `/api/poverty` | Poverty statistics data |
| GET | `/api/notifications` | User notifications |
| GET | `/api/daily-facts` | Daily poverty fact |
| GET/POST | `/api/messages` | Inbox messages |
| GET/POST | `/api/groups` | Community groups |
| GET | `/api/rewards` | Rewards / points |
| GET | `/api/activity` | Account activity log |
| GET | `/api/currency` | Currency conversion rates |
| POST | `/api/contact` | Contact form submission |
| GET/POST | `/api/newsletter` | Newsletter subscription |
| GET | `/api/admin` | Admin dashboard data |

---

## Contributors

Damon Boone, Marisol Morales, Reymes Olide, Daniel Jose Quizon, & Christella Marie Perez Taguicana