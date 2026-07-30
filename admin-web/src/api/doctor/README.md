# Doctor API modules

This directory is reserved for Axios-backed doctor portal APIs as those features are connected to the backend.

The invitation signup endpoints stay in `src/api/authApi.js` because the backend owns them under `/auth/doctor-invite/:token`.

Future modules here can cover the authenticated doctor profile, appointments, schedules, leaves, and patient-facing doctor data.
