# Shree Steel website (React + Vite)

## Run
    npm install
    npm run dev        # open the URL shown in terminal (http://localhost:5173)
    npm run build      # production build -> dist/

IMPORTANT: do NOT open index.html with VS Code "Go Live". React must run through `npm run dev`.
Routing uses HashRouter (URLs look like /#/about), so refresh and any static hosting work without extra setup.

## Admin panel
Open `/#/admin` (footer has an "Admin login" link). In mock mode the default password is `admin123` -> change it in Admin > Settings.
Manage: projects (with photo), enquiries (status), job openings, contact details, and the TEXT/IMAGE of every page.

### Website pages (admin sidebar > Website pages)
Home, About, Services, Projects, Manufacturing, Quality & Safety, Careers, Contact and Logo & footer each have an editor.
Change the text, add/remove list items, press **Save changes** - the public site updates immediately.
**Restore original** brings back the text written in `src/content/defaults.js`.
(Projects, job openings and contact details have their own list screens, linked from the matching page editor.)


### Road map on the About page (new)
Admin > Website pages > About > **Road map milestones**: add a milestone (year, title, details, optional photo), edit, move up/down, or delete.
The public About page shows them on a winding road, alternately left and right; the road lights up as the visitor scrolls.
No milestones = the section is hidden. Division admins (Admin > Divisions > About page) can set a separate road map per division.
Default sample milestones are in `src/content/defaults.js` (about.journey). Component: `src/components/RoadMap.jsx`.

## Configuration (.env)
Copy `.env.example` to `.env` (a ready-to-use `.env` is included). Restart `npm run dev` after editing.

| Variable | Meaning |
| --- | --- |
| `VITE_USE_MOCK` | `true` = built-in browser mock API (no backend needed, data kept in localStorage). `false` = real backend |
| `VITE_API_BASE_URL` | Django REST base URL, e.g. `http://127.0.0.1:8000/api` |
| `VITE_API_TIMEOUT_MS` | Request timeout (default 15000) |
| `VITE_AUTH_SCHEME` | `Bearer` (SimpleJWT) or `Token` (DRF TokenAuthentication) |
| `VITE_MOCK_DELAY_MS` | Optional fake latency for the mock, to preview loading states |

## Code structure
    src/config/env.js        reads .env in one place
    src/api/client.js        the single Axios instance (base URL, timeout, auth header, 401 handling, error normalising)
    src/api/endpoints.js     every backend URL
    src/api/mappers.js       API field names <-> UI field names (change here if your serializers differ)
    src/api/services/        authService, projectsService, enquiriesService, openingsService, contactService
    src/hooks/               useAsync (load data), useAction (save/delete with busy + error)
    src/context/             ContactContext (contact details shared by footer, Contact page, admin Settings)
    src/components/          AsyncState (loading / error + retry box)
    src/mocks/               MOCK API + MOCK DATA - delete this folder when the backend is live
    src/data.js              static website text/lists (not backend data)
    src/pages.jsx, admin.jsx, App.jsx   UI - they only call services/hooks, never Axios or localStorage

Rule: components never call Axios directly. Add or change backend calls only in `src/api/services`.

## Connecting a Django REST API
1. Set `VITE_USE_MOCK=false` and `VITE_API_BASE_URL=...` in `.env`.
2. Enable CORS for the frontend origin (`django-cors-headers`, `CORS_ALLOWED_ORIGINS`).
3. Provide these endpoints (JSON; a list may be a plain array or DRF-paginated `{results: [...]}`; only the first page is read):

| Method + URL | Auth | Request / response |
| --- | --- | --- |
| `POST /auth/login/` | no | `{password}` -> `{token}` (or SimpleJWT `{access}`); wrong password -> 400/401 |
| `POST /auth/change-password/` | yes | `{old_password, new_password}`; wrong old password -> 400 `{"old_password": [...]}` |
| `GET /projects/` | no | `[{id, category, name, location, client, scope, area, structural_system, status, image}]` (`image` = URL or null) |
| `POST /projects/`, `PATCH /projects/{id}/`, `DELETE /projects/{id}/` | yes | same fields; JSON, or `multipart/form-data` when a photo (`image` file) is uploaded |
| `POST /enquiries/` | no | `{name, company, mobile, email, location, project_type, approx_area, message}` (+ optional `file` as multipart) |
| `GET /enquiries/` | yes | same fields plus `{id, status, created_at}`; `status` is `New`, `Contacted`, `Quoted` or `Closed` (default `New`) |
| `PATCH /enquiries/{id}/`, `DELETE /enquiries/{id}/` | yes | `{status}` / - |
| `GET /openings/` (`?is_active=true`) | no (filter) | `[{id, title, is_active}]`; create/patch/delete need auth |
| `GET /contact-details/` | no | `[{label, value}]` in display order - labels used: Head Office, Manufacturing Facility, Phone, Email, Google Maps |
| `PUT /contact-details/` | yes | full array -> saved array |
| `GET /site-content/` | no | ONE JSON object with the editable page text, e.g. `{"home": {...}, "about": {...}}` (`{}` when nothing saved). Store it in a singleton model with a `JSONField` |
| `PUT /site-content/` | yes | the full JSON object -> the saved object. Keys the admin never edited are missing; the site falls back to `src/content/defaults.js` |

Errors: 400 with DRF field errors (`{"email": ["Enter a valid email address."]}`) or `{"detail": "..."}` is shown to the user. A 401 on an admin call logs the admin out. Do not return 401 for a wrong password on login/change-password (use 400).

Different field names or URLs? Edit only `src/api/mappers.js` / `src/api/endpoints.js` / the service file.
Dashboard counts and the sidebar "new enquiries" badge currently use the list endpoints; a dedicated stats endpoint can be swapped in inside `enquiriesService` / the Dashboard loader later.

## Edit content
Page text: edit from Admin > Website pages (defaults live in src/content/defaults.js) - page layout: src/pages.jsx - admin editors: src/adminPages.jsx - styles: src/index.css
