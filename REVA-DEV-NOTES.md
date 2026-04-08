# Reva CRM – Frontend / Backend Notes

Date: April 2026

This document was used during development to align frontend and backend decisions.  
It reflects what has been completed and what remains out of scope for the current version.

---

## General approach

- Business logic lives in the backend where possible
- Frontend focuses on UX, state, and displaying data
- Backend defines structure, validation, and rules
- Frontend adapts to backend responses instead of duplicating logic

---

## What is fully working

### Auth
- Login flow is stable
- Session verification works
- Protected routes are implemented on frontend
- Auth contract is consistent (`/auth/*`)

---

### Bookings (core functionality)
- Create booking (modal flow)
- View booking details
- Check-in / Check-out actions
- Status-based action guards (no invalid UI actions)
- Bookings table with:
  - filters (date + status)
  - pagination (client + server compatible)
- Property-scoped bookings view

---

### Rooms
- Room list per property
- Timeline view + card view
- Room status updates (Available / Occupied / Dirty / Maintenance)
- Operational filters (Ready, Dirty, Occupied, etc.)
- Search functionality
- Room sorting based on operational priority

---

### Properties dashboard
- Portfolio overview page
- Property cards with:
  - operational metrics (ready, dirty, arrivals, etc.)
  - financial indicators (outstanding, overdue)
- Smart sorting (attention-based)
- Navigation into property-level views

---

### Guests
- Guest creation via booking flow
- Guest linkage to bookings
- Basic guest data handling works correctly

---

### Billing (MVP level)
- Invoice list and detail structure in place
- Payment tracking UI exists
- Backend is partially mocked / partially implemented

---

### UI / UX
- Consistent layout across pages
- Loading / empty / error states handled
- No blocking UI during async actions
- Row-level feedback for actions (check-in/out, etc.)
- Clean, minimal visual system

---

## What is intentionally NOT fully implemented

These were considered but are out of scope for the final project:

### Backend rules (advanced)
- No strict anti-overbooking validation
- No hard room capacity enforcement
- Booking state transitions are controlled in UI but not strictly enforced server-side

---

### Auth extensions
- No refresh token flow
- No logout endpoint (frontend handles session reset)
- No `/auth/me`

---

### API structure
- No versioning (`/api/v1`)
- No Swagger/OpenAPI documentation
- No strict contract freeze process

---

### System-wide standards
- Timezone handled but not strictly enforced everywhere (assumed UTC)
- Currency formatting handled on frontend (EUR)
- Enums are consistent but not formally documented

---

### Security / production concerns
- No rate limiting
- CORS not fully environment-restricted
- JWT expiration strategy is basic

---

### Billing (full system)
- Backend billing system is not fully complete
- Some data is simulated for UI purposes

---

## Notes

- The application is fully functional for demonstration purposes
- All core flows (auth, bookings, rooms, properties) work end-to-end
- The focus was on building a realistic operational dashboard rather than a fully production-hardened backend

---

## Status

✔ Ready for final project submission  
✔ Core features complete  
✔ UI polished and consistent  
✔ End-to-end flows working  

---

## Summary

This project represents a working hotel operations dashboard with:

- property-level management
- booking lifecycle handling
- room state management
- basic financial tracking

The system is designed to feel like a real internal tool, prioritizing usability and clarity over full backend completeness.