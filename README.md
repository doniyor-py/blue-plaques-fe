# Blue Plaques Explorer

A web app for discovering London's commemorative plaques: find the ones near you, walk to them and keep track of the ones you've visited.

Built with **Angular 20** and **Bootstrap 5**, on top of the [Blue Plaques Explorer API](https://github.com/doniyor-py/blue-plaques-api) (Flask + MongoDB) with 3,375 real plaques.

## Features

- **Browse and search**: filter by name, borough, category, colour and year. Filters live in the URL, so links can be shared and bookmarked
- **Map**: plaques near you on an interactive map, with walking directions and arrival time
- **Visits and reviews**: press "I've visited" at a plaque, then optionally rate it, add a note or upload a photo
- **Profile**: your visits and reviews, borough progress, favourites and personal stats
- **Insights**: charts of plaques by borough, decade and profession, plus the best-rated plaques
- **Accounts**: sign up with an emailed code, log in with email, username or Google, and reset a forgotten password
- **Admin tools**: add, edit and delete plaques, manage users and handle problem reports
- **Accessible**: keyboard-friendly, with a skip link, labelled forms and screen-reader announcements

## Tech stack

Angular 20 (standalone components, reactive forms, lazy-loaded routes) · TypeScript · Bootstrap 5 · Leaflet · RxJS · Jasmine/Karma · ESLint

## Getting started

You need **Node.js 20.19+** and the **[API](https://github.com/doniyor-py/blue-plaques-api)** running at `http://127.0.0.1:5001`.

```bash
git clone https://github.com/doniyor-py/blue-plaques-fe.git
cd blue-plaques-fe
npm install
npm start
```

Then open **http://localhost:4200**.

Settings such as the API address and the Google client ID are in `src/app/api.ts`.

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Runs the app locally |
| `npm run build` | Builds the app for production |
| `npm test` | Runs the unit tests |
| `ng lint` | Checks the code and templates |

## Test accounts

Created by the API's `create_users.py`:

| Username | Password | Role |
|---|---|---|
| `admin1` | `AdminPass123` | admin |
| `user0` … `user9` | `UserPass123` | user |

## Credits

Built by **Doniyor Mekhmonov** · [github.com/doniyor-py](https://github.com/doniyor-py)

Plaque data from [Open Plaques](https://openplaques.org) (public domain). Maps © [Stadia Maps](https://stadiamaps.com) and © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
