# ZoomHopr Frontend

A React/Vite frontend inspired by the self-drive + carpool mobility model of Zoomcar and Hopr, built to connect to the existing ZoomHopr Spring Boot backend.

## Backend assumed

API Gateway:
http://localhost:8080

Auth:
POST /api/auth/login

User:
GET /api/users/{userId}
PUT /api/users/{userId}

The Vite dev server proxies `/api/*` to `http://localhost:8080`, so the browser does not need a separate CORS configuration during local development.

## Run

1. Install Node.js 20+.
2. Open this folder in VS Code.
3. Run:

```bash
npm install
npm run dev
```

4. Open:

http://localhost:5173

## Test account

The login screen is prefilled for the test account used during backend testing:

Email: testuser@example.com
Password: Test@123

Do not use this test password in production.

## Current UI

- Sign-in page
- Mobility dashboard
- Car discovery cards
- Profile page connected to User Service
- Trips page
- Vehicle browsing UI
- JWT stored locally after login
- API proxy to the existing Spring Cloud Gateway

The visual language is original and only inspired by common self-drive/car-pooling UX patterns; it does not copy proprietary assets or branding.
