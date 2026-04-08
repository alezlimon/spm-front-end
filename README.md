# Reva — Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

## Overview
This is the frontend for Reva, a hotel operations dashboard built with React and Vite. It is designed to support daily property operations through a clear interface for rooms, bookings, guests, billing, and property-level overview pages. The frontend is connected to the Reva backend and focuses on workflow, navigation, and operational clarity.

## Main Features
- Properties dashboard
- Property overview pages
- Rooms page with timeline and card views
- Bookings page with filters and operational actions
- Guests page
- Billing page
- Login and protected routes
- Clean, connected UI across all sections

## Tech Stack
- React
- Vite
- React Router

## Run Locally
```bash
npm install
npm run dev
```

## Environment Variable
Create a `.env` file with:

VITE_API_URL=http://localhost:5005/api

## Notes
- This frontend is designed to work with the Reva backend
- Property logic supports both hotel-style and villa-style behavior
- Main workflows are connected across sections rather than isolated into simple CRUD pages

## Credits
- Luana Aguilo
- Alejandro Perez

## Related
- [Reva Backend](https://github.com/alezlimon/spm-back-end)

## License
This project is licensed under the MIT License.