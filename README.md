# Blue Plaques Explorer - Front End

Angular front end for the Blue Plaques Explorer, a web app for browsing London's
commemorative plaques (blue plaques and the other colours) and recording visits to them.

COM661 Full-stack Strategies and Development - Coursework 2.

The back end (Flask + MongoDB REST API) was built in Coursework 1 and lives in a
separate repository: `blue-plaques-api`. This app talks to it over HTTP at
`http://127.0.0.1:5001/api/v1.0`.

## Technologies

- Angular 20 (standalone components, `@if` / `@for` control flow)
- TypeScript
- Bootstrap 5
- RxJS and Angular `HttpClient`
- Reactive forms
- Jasmine / Karma for unit tests

## Current progress

Done:

- Home page with a "Surprise me" random plaque
- Plaques list with pagination
- Search and filters (text, borough, category, colour, year range)
- Page number and filters kept in the URL, e.g. `/plaques?borough=Camden&role=literature&page=2`,
  so the browser Back button, bookmarks and shared links all work
- Plaque details page (people, roles, views)
- Log in / log out with JWT (token sent in the `x-access-token` header by an HTTP interceptor;
  logging out also blacklists the token on the server)
- Route guards: "My profile" needs a login, the admin "Users" page needs an admin account
- Visits: add, edit and delete a visit with ratings and a note (GET, POST, PUT, DELETE)

To do:

- Sign up with email code (OTP)
- Favourites and reporting a plaque
- Admin tools (create / edit / delete plaques, handle reports, delete users)
- Nearby plaques map
- Profile statistics and admin analytics
- Plaque photos
- Final styling and accessibility review
- Unit tests and Compodoc documentation

## How to run

You need Node.js (20.19+, 22.12+ or 24) and the back-end API running first.

1. Start MongoDB and the Flask API from the `blue-plaques-api` repository
   (it runs on port 5001).
2. In this folder:

```bash
npm install
npm start
```

3. Open http://localhost:4200

Test accounts (from the back end's seed data):

| Username | Password | Role |
|---|---|---|
| user0 ... user9 | UserPass123 | normal user |
| admin1 | AdminPass123 | admin |

## Project structure

```
src/app/
  api.ts                    base URL of the API
  app.routes.ts             page routes and guards
  app.config.ts             HttpClient + interceptor setup
  components/
    navigation/             top navbar
    home/                   home page and random plaque
    plaques/                list, search, filters, pagination
    plaque/                 plaque details and visits
    login/                  login form
    profile/                logged-in user's profile
    admin-users/            admin list of users
  services/
    plaque-service.ts       plaque requests
    visit-service.ts        visit requests (add / edit / delete)
    auth-service.ts         login, logout, token handling
    user-service.ts         profile and users requests
    auth-interceptor.ts     adds the token to API requests, handles 401
    auth-guards.ts          authGuard and adminGuard
```

## API endpoints used so far

| Method | Endpoint | Used for |
|---|---|---|
| GET | /plaques/search | list, search and filters |
| GET | /plaques/random | "Surprise me" |
| GET | /plaques/:id | plaque details |
| GET | /plaques/:id/visits | reload visits |
| POST | /plaques/:id/visits | add a visit |
| PUT | /plaques/:id/visits/:vid | edit a visit |
| DELETE | /plaques/:id/visits/:vid | delete a visit |
| GET | /login | log in (Basic Auth) |
| GET | /logout | log out |
| GET | /users/me | my profile |
| GET | /users | admin: list users |

## Author

Doniyorbek Mekhmonov - Ulster University London
