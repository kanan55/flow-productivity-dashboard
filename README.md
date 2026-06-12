# Flow Productivity Dashboard

Flow is a full-stack productivity dashboard for tasks, habits, daily planning, analytics, and focus sessions. It has a React PWA frontend and an Express/MongoDB backend with JWT authentication.

Live frontend: https://flow-productivity-dashboard.vercel.app/

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Tailwind CSS, Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcrypt |
| Tests | Jest, Supertest, React Testing Library |

## Local Setup

### Backend

```bash
cd server
npm install
cp .env.example .env
npm start
```

The API runs at `http://localhost:5000`. Health check:

```bash
GET http://localhost:5000/api/health
```

### Frontend

```bash
cd client
npm install
cp .env.example .env
npm start
```

The React app runs at `http://localhost:3000`.

For production deploys, set `REACT_APP_API_URL` to the deployed API base URL, for example:

```env
REACT_APP_API_URL=https://your-api-host.example.com/api
```

If this value is missing on Vercel, login/register requests will go to `/api` on the frontend domain and will fail unless a backend is deployed there.

## Guest Mode

When MongoDB is unavailable, the API can continue in memory and the frontend can also use local browser state for guest usage. Guest Mode is useful for demos, but data resets when the server restarts or browser storage is cleared.

## Folder Structure

```text
flow-productivity-dashboard/
├── client/
│   ├── public/
│   │   ├── sounds/
│   │   └── wallpapers/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       └── utils/
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── tests/
├── .github/workflows/
├── LICENSE
└── README.md
```

## Theme Assets

Theme wallpapers live in `client/public/wallpapers/`.

Theme sounds live in `client/public/sounds/`.

Current theme asset names:

```text
midnight.png / midnight.mp3
sunset.png / sunset.mp3
forest.png / forest.mp3
glass.png / glass.mp3
aurora.png / aurora.mp3
cat.png / cat.mp3
```

## API Endpoints

### Auth

`POST /api/auth/register`

Request:

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "visualTheme": "midnight",
    "darkMode": true
  }
}
```

`POST /api/auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

`GET /api/auth/me`

Response:

```json
{
  "id": "user_id",
  "email": "user@example.com",
  "visualTheme": "midnight",
  "darkMode": true
}
```

### Tasks

`GET /api/tasks`

Response:

```json
[
  {
    "_id": "task_id",
    "title": "Write launch checklist",
    "category": "Work",
    "priority": "high",
    "status": "pending"
  }
]
```

`POST /api/tasks`

Request:

```json
{
  "title": "Write launch checklist",
  "description": "Prepare final deploy steps",
  "category": "Work",
  "priority": "high",
  "deadline": "2026-06-30T00:00:00.000Z"
}
```

Response:

```json
{
  "_id": "task_id",
  "title": "Write launch checklist",
  "status": "pending"
}
```

`PUT /api/tasks/:id`

Request:

```json
{
  "status": "completed"
}
```

Response:

```json
{
  "_id": "task_id",
  "title": "Write launch checklist",
  "status": "completed",
  "completedAt": "2026-06-12T12:00:00.000Z"
}
```

`DELETE /api/tasks/:id`

Response:

```json
{
  "message": "Task deleted successfully"
}
```

### Habits

`GET /api/habits`

Response:

```json
[
  {
    "_id": "habit_id",
    "name": "Morning workout",
    "frequency": "daily",
    "completions": []
  }
]
```

`POST /api/habits`

Request:

```json
{
  "name": "Morning workout",
  "icon": "dumbbell",
  "color": "#10b981",
  "frequency": "daily"
}
```

Response:

```json
{
  "_id": "habit_id",
  "name": "Morning workout",
  "isActive": true
}
```

`POST /api/habits/:id/checkin`

Response:

```json
{
  "_id": "habit_id",
  "name": "Morning workout",
  "completions": ["2026-06-12T00:00:00.000Z"]
}
```

### Focus Sessions

`GET /api/focus`

Response:

```json
[
  {
    "_id": "session_id",
    "duration": 25,
    "completed": true
  }
]
```

`POST /api/focus`

Request:

```json
{
  "duration": 25,
  "breakDuration": 5,
  "completed": false
}
```

Response:

```json
{
  "_id": "session_id",
  "duration": 25,
  "completed": false
}
```

`PUT /api/focus/:id`

Request:

```json
{
  "completed": true
}
```

Response:

```json
{
  "_id": "session_id",
  "duration": 25,
  "completed": true,
  "endedAt": "2026-06-12T12:00:00.000Z"
}
```

## Tests

Run backend tests:

```bash
cd server
npm test
```

Run frontend tests:

```bash
cd client
npm test
```

## Future Improvements

- Real AI integration for smarter recommendations
- Push notifications for reminders
- Collaborative task boards
- Calendar sync
- Data export
- Mobile app
