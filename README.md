# 🏠 LocalSaathi — Full-Stack Local Service Booking Platform

> A production-style platform where customers can find and book trusted local service providers — electricians, plumbers, cleaners, AC repair experts, carpenters, painters, and more.

![LocalSaathi](https://img.shields.io/badge/LocalSaathi-v1.0.0-6366f1?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb)

---

## ✨ Features

### For Customers
- 🔍 Search and filter services by category and location
- 📅 Book services with date, time, and address selection
- 📊 Track booking status in real-time (Socket.io)
- 🔔 SMS & WhatsApp notifications for booking updates
- ⭐ Rate and review service providers
- 🏠 User dashboard with booking history

### For Service Providers
- 📋 Manage your service listings
- ✅ Accept or reject booking requests
- 💰 Track earnings and completed jobs
- 🌟 View customer reviews and ratings
- 👤 Editable professional profile

### For Admins
- 📊 Platform analytics dashboard
- 👥 Manage users and providers
- ✅ Provider approval workflow
- 📋 Monitor all bookings
- 📈 Revenue and performance reports

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js + Vite | UI framework + build tool |
| Tailwind CSS v3 | Styling |
| React Router DOM | Client-side routing |
| Framer Motion | Animations |
| Axios | HTTP client |
| Socket.io Client | Real-time updates |
| React Hot Toast | Notifications |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | Server framework |
| MongoDB + Mongoose | Database |
| JWT + bcryptjs | Authentication |
| Socket.io | Real-time events |
| Twilio | SMS notifications |
| Helmet + CORS | Security |
| Morgan | HTTP logging |

---

## 📁 Project Structure

```
local service/
├── client/                   # React + Vite Frontend
│   ├── src/
│   │   ├── api/              # Axios API utility layer
│   │   ├── components/       # Reusable UI components
│   │   │   ├── common/       # Navbar, Footer, Cards, etc.
│   │   │   ├── home/         # Hero, Services, Testimonials, etc.
│   │   │   └── dashboard/    # Sidebar, StatCard, Layout
│   │   ├── context/          # AuthContext, SocketContext
│   │   ├── pages/
│   │   │   ├── public/       # Home, Services, ServiceDetail
│   │   │   ├── auth/         # Login, Signup pages
│   │   │   ├── user/         # User dashboard pages
│   │   │   ├── provider/     # Provider dashboard pages
│   │   │   └── admin/        # Admin dashboard pages
│   │   └── App.jsx           # Main app with all routes
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── server/                   # Node.js + Express Backend
    ├── config/               # DB and Socket.io config
    ├── controllers/          # Business logic
    ├── middleware/           # Auth, roles, error handler
    ├── models/               # Mongoose schemas
    ├── routes/               # Express routes
    ├── services/             # Twilio, WhatsApp, Notifications
    ├── seed/                 # Sample data seeder
    └── server.js             # Entry point
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone and Navigate
```bash
cd "c:\local service"
```

### 2. Setup the Backend Server

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and fill in your values:
```bash
copy .env.example .env
```

Edit `server\.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/localsaathi
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Optional: Twilio SMS
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Seed the Database (Optional but Recommended)
```bash
npm run seed
```

This creates:
- 1 Admin account
- 1 Sample user account
- 7 Approved providers (one per category)
- 10 Sample services
- Sample bookings and reviews

**Demo Credentials:**
| Role | Email | Password |
|---|---|---|
| Admin | admin@localsaathi.com | Admin@123 |
| User | anjali@example.com | User@123 |
| Provider | rajesh@localsaathi.com | Provider@123 |
| Provider | priya@localsaathi.com | Provider@123 |

### 4. Start the Backend Server
```bash
npm run dev
```
Server runs on: `http://localhost:5000`

### 5. Setup the Frontend Client

Open a new terminal:
```bash
cd client
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/register          # User registration
POST /api/auth/provider/register # Provider registration
POST /api/auth/login             # Login (all roles)
GET  /api/auth/me                # Get current user
```

### Services
```
GET    /api/services             # List all services
GET    /api/services/:id         # Service details
POST   /api/services             # Create service (Provider)
PUT    /api/services/:id         # Update service (Provider)
DELETE /api/services/:id         # Delete service (Provider)
GET    /api/services/my-services # Provider's own services
```

### Bookings
```
POST /api/bookings               # Create booking (User)
GET  /api/bookings/user          # User's bookings
GET  /api/bookings/provider      # Provider's bookings
GET  /api/bookings/admin         # All bookings (Admin)
PUT  /api/bookings/:id/status    # Update status (Provider)
PUT  /api/bookings/:id/cancel    # Cancel booking (User)
GET  /api/bookings/:id           # Single booking
```

### Providers
```
GET /api/providers               # List approved providers
GET /api/providers/:id           # Provider profile + reviews
PUT /api/providers/profile       # Update profile (Provider)
GET /api/providers/admin/all     # All providers (Admin)
PUT /api/providers/:id/approve   # Approve/reject (Admin)
```

### Admin
```
GET /api/admin/analytics         # Platform stats
GET /api/admin/bookings/recent   # Recent bookings
GET /api/admin/providers/top     # Top performers
```

---

## ⚡ Socket.io Events

| Event | Direction | Trigger |
|---|---|---|
| `join` | Client → Server | User/Provider login |
| `booking:new` | Server → Provider | New booking created |
| `booking:statusUpdate` | Server → User | Provider accepts/rejects |
| `booking:cancelled` | Server → Provider | User cancels |
| `notification:new` | Server → Client | New notification |

---

## 📱 SMS & WhatsApp Notifications

SMS notifications are sent via **Twilio** for:
- Booking created (to user + provider)
- Booking accepted/rejected (to user)
- Booking completed (to user)

WhatsApp notifications are sent via **Twilio WhatsApp API** for:
- Booking confirmation (to user)
- Booking status updates (to user)

> **Note:** If Twilio credentials are not configured, the app works in mock mode (notifications are logged to console).

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary | Indigo `#6366f1` |
| Secondary | Violet `#7c3aed` |
| Accent | Emerald `#10b981` |
| Dark BG | `#0f172a` |
| Card BG | `rgba(17,24,39,0.8)` |
| Font | Inter (Google Fonts) |

### Custom CSS Classes
- `.btn-primary` — Gradient CTA button with hover glow
- `.btn-secondary` — Dark ghost button
- `.btn-outline` — Border-only button
- `.glass-card` — Glassmorphism card
- `.glass-card-hover` — Glassmorphism with hover animation
- `.input-field` — Dark input with focus ring
- `.gradient-text` — Indigo-to-violet gradient text
- `.badge` — Status badge pill

---

## 🔒 Security Features

- JWT tokens with 7-day expiry
- bcryptjs password hashing (salt rounds: 12)
- Role-based route protection (user/provider/admin)
- Helmet.js security headers
- CORS configuration
- MongoDB injection protection via Mongoose

---

## 🌐 Deployment

### Backend (Railway / Render)
1. Set all env variables in your hosting platform
2. Set `NODE_ENV=production`
3. `npm start`

### Frontend (Vercel / Netlify)
1. Build: `npm run build`
2. Set `VITE_API_URL` if not using proxy

---

## 📋 Service Categories

- ⚡ Electrician (wiring, panel repair, fan installation)
- 🔧 Plumber (leak fix, pipe fitting, faucets)
- 🧹 Cleaner (home deep cleaning, sofa cleaning)
- ❄️ AC Repair (service, gas refill, PCB repair)
- 🪚 Carpenter (furniture repair, custom work)
- 🎨 Painter (interior, exterior, texture paint)
- 🔌 Appliance Repair (washing machine, fridge, TV)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — Built with ❤️ in India

---

*LocalSaathi — Connecting homes to trusted professionals across India* 🇮🇳
# local-sathi-
