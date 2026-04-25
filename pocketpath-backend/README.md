# PocketPath — Backend API

MERN stack REST API for the PocketPath personal finance tracker.

## Stack
- **Node.js + Express** — server & routing
- **MongoDB + Mongoose** — database & ODM
- **JWT** — stateless auth
- **bcryptjs** — password hashing

## Setup

```bash
cd pocketpath-backend
npm install

# Copy env and fill in your values
cp .env.example .env

npm run dev   # development (nodemon)
npm start     # production
```

## Environment Variables

| Variable     | Description                        |
|--------------|------------------------------------|
| `PORT`       | Server port (default 5000)         |
| `MONGO_URI`  | MongoDB connection string          |
| `JWT_SECRET` | Secret key for signing JWT tokens  |
| `JWT_EXPIRE` | Token expiry e.g. `7d`             |

## API Reference

### Auth
| Method | Endpoint             | Description          |
|--------|----------------------|----------------------|
| POST   | /api/auth/register   | Register new user    |
| POST   | /api/auth/login      | Login                |
| GET    | /api/auth/me         | Get current user     |

### Dashboard (Home Screen)
| Method | Endpoint          | Description                                          |
|--------|-------------------|------------------------------------------------------|
| GET    | /api/dashboard    | Balance, income, spent, savings rate, streak, tips   |

### Transactions (Activity)
| Method | Endpoint                | Description                     |
|--------|-------------------------|---------------------------------|
| GET    | /api/transactions       | List all (filter: type/category/date/page) |
| POST   | /api/transactions       | Add expense or income           |
| GET    | /api/transactions/:id   | Get single transaction          |
| PUT    | /api/transactions/:id   | Update transaction              |
| DELETE | /api/transactions/:id   | Delete transaction              |

### Goals
| Method | Endpoint          | Description         |
|--------|-------------------|---------------------|
| GET    | /api/goals        | List all goals      |
| POST   | /api/goals        | Create a goal       |
| PUT    | /api/goals/:id    | Update / add savings|
| DELETE | /api/goals/:id    | Delete a goal       |

### Insights
| Method | Endpoint                   | Description                  |
|--------|----------------------------|------------------------------|
| GET    | /api/insights/trend        | 6-month income vs spend trend|
| GET    | /api/insights/categories   | Category breakdown + limits  |
| GET    | /api/insights/budgets      | Get all category budgets     |
| POST   | /api/insights/budgets      | Set/update a category budget |

### Reflect (Journal)
| Method | Endpoint           | Description            |
|--------|--------------------|------------------------|
| GET    | /api/reflect       | List reflections       |
| POST   | /api/reflect       | Add a reflection entry |
| PUT    | /api/reflect/:id   | Edit a reflection      |
| DELETE | /api/reflect/:id   | Delete a reflection    |

### Profile
| Method | Endpoint               | Description           |
|--------|------------------------|-----------------------|
| GET    | /api/profile           | Get profile           |
| PUT    | /api/profile           | Update profile        |
| PUT    | /api/profile/password  | Change password       |

## Auth Header

All protected routes require:
```
Authorization: Bearer <token>
```

## Project Structure

```
pocketpath-backend/
├── server.js
├── config/
│   └── db.js
├── models/
│   ├── User.model.js
│   ├── Transaction.model.js
│   ├── Goal.model.js
│   ├── Reflect.model.js
│   └── Budget.model.js
├── controllers/
│   ├── auth.controller.js
│   ├── dashboard.controller.js
│   ├── transaction.controller.js
│   ├── goal.controller.js
│   ├── insight.controller.js
│   ├── reflect.controller.js
│   └── profile.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── dashboard.routes.js
│   ├── transaction.routes.js
│   ├── goal.routes.js
│   ├── insight.routes.js
│   ├── reflect.routes.js
│   └── profile.routes.js
├── middleware/
│   └── auth.middleware.js
└── utils/
    ├── generateToken.js
    └── updateStreak.js
```
