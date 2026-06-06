# Flow — Full-Stack PWA Productivity Ecosystem

**Flow** is a premium, high-performance productivity ecosystem engineered to elevate user focus, optimize daily scheduling, and track habits. Designed with a gorgeous, translucent glassmorphic interface, it offers a seamless UX optimized for both desktop and mobile screens.

---

## 🚀 Key Engineering & Architecture Highlights (Resume-Ready)

* **Global Lifecycle & Pomodoro Engine**: Engineered a global state context (`AppContext`) that encapsulates a background countdown timer, allowing focus sessions to tick seamlessly across client tab switches and page navigations.
* **Progressive Web App (PWA) Integration**: Implemented PWA specifications including custom Web App Manifests and a service-worker caching layer, enabling borderless, standalone installations on Windows, macOS, iOS, and Android.
* **Procedural Auditory Synthesis (Web Audio API)**: Authored custom, low-latency sound synthesis algorithms (e.g. swept bandpass filters for vocal formants, LFO amplitude-modulation for coziness rumbles, and multi-node gain controllers) to replace heavy sound files with lightweight code-synthesized chimes.
* **Translucent Glassmorphic Design System**: Authored an adaptive styling architecture using CSS variables to transition between 6 custom artistic themes (Midnight, Sunset, Forest, Glass, Aurora, and Cat). Employs automated typographic contrast matching to keep text readable against custom wallpapers.
* **Productivity Score Metrics Engine**: Designed a dynamic dashboard algorithm that calculates a daily Productivity Score based on a weighted average of completed tasks (40%), focus duration (40%), and habit compliance (20%).
* **Hybrid Storage & Auth Architecture**: Built a Node/Express backend using MongoDB/Mongoose with JSON Web Token (JWT) authorization, complemented by a resilient in-memory client storage fallback that ensures 100% functionality for guest or offline users.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend** | React 18, Tailwind CSS | Single Page Application framework with responsive utility styles |
| **Animations** | Framer Motion | Fluid card transitions, sidebar slides, and spring-based layouts |
| **Data Viz** | Recharts | Custom vector-based productivity graphs and interactive charts |
| **Icons** | Lucide React | High-contrast vector typography indicators |
| **Backend** | Node.js, Express | Modular REST API routing and token-based auth |
| **Database** | MongoDB (Mongoose) | Document-store schemas with database fallback |

## How to Open the Website

Follow these steps to start both the backend and frontend servers:

### 1. Prerequisites
- **Node.js**: Version 18+ installed on your computer.
- **MongoDB** (Optional): A local database or Atlas URL. The backend has an automatic in-memory fallback, so it runs perfectly even if MongoDB is not running!

### 2. Start the Backend Server
Open a terminal in the project directory, then navigate to the server and start it:
```bash
cd server
npm install
npm start
```
* The backend server will start listening at `http://localhost:5000`.
* You can check the health status of the backend at `http://localhost:5000/api/health`.

### 3. Start the Frontend Dev Server
Open a second terminal in the project directory, then navigate to the client and start it:
```bash
cd client
npm install
npm start
```
* The frontend server will start and automatically try to open **`http://localhost:3000`** in your browser. 
* If it doesn't open automatically, just type **`http://localhost:3000`** into your browser's address bar.

---

## How to Change Wallpapers for Themes

The dashboard has 6 visual themes: **Midnight**, **Sunset**, **Forest**, **Glass**, **Aurora**, and **Cat**. Each theme is bound to a specific background wallpaper image.

To change or customize the wallpaper for any of these themes:

1. **Prepare Your Image**: Ensure your new image is a `.png` file.
2. **Locate the Asset Folder**: Go to the public wallpapers directory:
   `client/public/wallpapers/`
3. **Overwrite the Corresponding File**: Rename your new `.png` file to match the theme name you want to update and replace it in the folder:
   - Midnight Theme ➔ `midnight.png`
   - Sunset Theme ➔ `sunset.png`
   - Forest Theme ➔ `forest.png`
   - Glass Theme ➔ `glass.png`
   - Aurora Theme ➔ `aurora.png`
   - Cat Theme ➔ `cat.png`
4. **Rebuild the Application**: To package the new assets, run the build command in the `client` folder:
   ```bash
   cd client
   npm run build
   ```
5. **Reload the Website**: Refresh `http://localhost:3000` in your browser. The theme will now load with your new wallpaper!

---

## Folder Structure

```
smart-productivity-dashboard/
├── client/          # React frontend
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Page-level views
│       ├── context/      # Global state (React Context)
│       ├── hooks/        # Custom hooks
│       └── utils/        # AI engine, helpers
├── server/          # Express backend
│   ├── models/      # Mongoose schemas
│   └── routes/      # API endpoints
└── README.md
```

## API Endpoints

| Method | Endpoint              | Description            |
| ------ | --------------------- | ---------------------- |
| GET    | /api/tasks            | Fetch all tasks        |
| POST   | /api/tasks            | Create a task          |
| PUT    | /api/tasks/:id        | Update a task          |
| DELETE | /api/tasks/:id        | Delete a task          |
| GET    | /api/habits           | Fetch all habits       |
| POST   | /api/habits           | Create a habit         |
| POST   | /api/habits/:id/checkin | Toggle daily check-in |
| GET    | /api/focus            | Fetch focus sessions   |
| POST   | /api/focus            | Start a session        |
| PUT    | /api/focus/:id        | End a session          |

## Future Improvements

- [ ] User authentication (JWT + bcrypt)
- [ ] Real AI integration (OpenAI API for smarter recommendations)
- [ ] Push notifications for reminders
- [ ] Collaborative task boards
- [ ] Calendar sync (Google Calendar integration)
- [ ] Data export (CSV, PDF)
- [ ] Mobile app (React Native)
- [ ] Widget support for home screen
