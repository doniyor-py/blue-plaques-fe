# London Blue Plaques Explorer

A web app for exploring London's commemorative plaques: who lived where, when, and what visitors think of them today.

Built with **Angular** and **Bootstrap**, on top of the [Blue Plaques Explorer API](https://github.com/doniyor-py/blue-plaques-api) (Python Flask and MongoDB) with 3,375 real plaques.

---

## Features

- **Browse** all plaques with pagination, or get a **random plaque** from the home page
- **Search and filters**: free text, borough, category, colour and year erected
- **Shareable URLs**: the page number and filters live in the address bar (for example `/plaques?borough=Camden&category=literature&page=2`), so the browser Back button, bookmarks and shared links all work
- **Plaque details**: inscription, address, borough, organisation, and the people on the plaque with their dates and roles
- **Accounts**: log in and log out with JWT; logging out also invalidates the token on the server
- **Protected pages**: "My profile" needs a login, and the user management page needs an admin account
- **Visits**: check in at a plaque with ratings for history, condition and accessibility and an optional note, then edit or delete it later. Admins can moderate any visit
- **Accessible forms**: every field has a label, errors are announced to screen readers, and everything works with the keyboard

---

## Tech stack

| Area | Technology |
|---|---|
| Framework | Angular 20 (standalone components, `@if` / `@for` control flow) |
| Language | TypeScript |
| Styling | Bootstrap 5 |
| HTTP | Angular `HttpClient`, RxJS, a functional HTTP interceptor |
| Forms | Angular reactive forms with validation |
| Testing | Jasmine and Karma |

---

## How it works

- **API calls** go through services (`plaque-service`, `visit-service`, `user-service`, `auth-service`). The base URL is set in `src/app/api.ts`.
- **Login** sends the username and password with Basic Auth to `GET /login`. The returned JWT is stored in `localStorage`.
- **The interceptor** (`auth-interceptor.ts`) adds the token as an `x-access-token` header to every request sent to the API, and only to the API. If the API answers `401`, it removes the token and opens the login page.
- **Route guards** (`authGuard`, `adminGuard`) keep users away from pages they can't use. The API still checks every request itself; the guards only improve the experience.
- **Forms** send `multipart/form-data`, which is what the API reads.

---

## Project structure

```
src/app/
├── api.ts                    base URL of the API
├── app.config.ts             HttpClient and interceptor setup
├── app.routes.ts             routes and guards
├── components/
│   ├── navigation/           navigation bar
│   ├── home/                 home page and random plaque
│   ├── plaques/              list, search, filters, pagination
│   ├── plaque/               plaque details and visits
│   ├── login/                login form
│   ├── profile/              the logged-in user's profile
│   └── admin-users/          user list for admins
└── services/
    ├── plaque-service.ts     plaque requests
    ├── visit-service.ts      add, edit and delete visits
    ├── user-service.ts       profile and user list
    ├── auth-service.ts       login, logout, token handling
    ├── auth-interceptor.ts   adds the token, handles 401
    └── auth-guards.ts        authGuard and adminGuard
```

---

## Setup

You need **Node.js** 20.19+, 22.12+ or 24, and the **Blue Plaques Explorer API** running locally.

### 1. Start the API

Follow the setup steps in the [API repository](https://github.com/doniyor-py/blue-plaques-api). It runs at **http://127.0.0.1:5001**.

### 2. Install and run the front end

```bash
git clone https://github.com/doniyor-py/blue-plaques-fe.git
cd blue-plaques-fe
npm install
npm start
```

Open **http://localhost:4200**.

### 3. Run the tests

```bash
npm test
```

---

## Test accounts

These accounts are created by the API's `create_users.py`:

| Username | Password | Role |
|---|---|---|
| `admin1` | `AdminPass123` | admin |
| `user0` … `user9` | `UserPass123` | user |

---

## API endpoints used

| Method | URL | Used for |
|---|---|---|
| GET | `/plaques/search` | List, search and filters |
| GET | `/plaques/random` | Random plaque on the home page |
| GET | `/plaques/<id>` | Plaque details |
| GET | `/plaques/<id>/visits` | Refresh the visits list |
| POST | `/plaques/<id>/visits` | Add a visit |
| PUT | `/plaques/<id>/visits/<vid>` | Edit a visit |
| DELETE | `/plaques/<id>/visits/<vid>` | Delete a visit |
| GET | `/login` | Log in (Basic Auth) |
| GET | `/logout` | Log out |
| GET | `/users/me` | Profile |
| GET | `/users` | User list (admin) |

All URLs start with `/api/v1.0`.

---

## Roadmap

- Sign-up with a human check and an emailed 6-digit code
- Favourites and problem reports
- Admin tools for plaques, reports and users
- Map of nearby plaques
- Personal statistics, progress and analytics charts
- Plaque photos

---

## Author

**Doniyor Mekhmonov** · [github.com/doniyor-py](https://github.com/doniyor-py)

Plaque data © [Open Plaques](https://openplaques.org) contributors, public domain.
