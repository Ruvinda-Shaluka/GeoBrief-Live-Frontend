# GeoBrief-Live Frontend Client 📱

This is the web client repository for the GeoBrief-Live platform. It is built using **React**, **Vite**, **TypeScript**, and **Tailwind CSS**. It incorporates **MapLibre GL JS** using a free, responsive CartoDB Dark Matter map layer to let users visualize, report, and collaborate on local incidents.

---

## 🚀 Key Features

* **Interactive Map Dashboard:** Real-time hazard location markers, camera viewport auto-focusing (lag-free when typing), and MapLibre popup info bubbles.
* **Map Location Search with Autocomplete:** A custom search bar positioned over the map utilizing the Nominatim geocoding API to dynamically load as-you-type autocomplete suggestions (debounced at 500ms to preserve API usage). Selecting an entry flies the viewport smoothly to the target coordinates and drops a coordinate selection pin.
* **Dual-Direction Coordinate Sync:** Syncs coordinates between the report form inputs and map click selections.
* **Device GPS Syncing:** Fetches current coordinate positions from the browser's Geolocation API.
* **Geo-Brief AI Summarizer:** Generates blistering-fast, AI-powered local alert briefings summarizing filtered page incidents (utilizing Groq llama3 on the backend), featuring pulsing skeleton loaders and premium glassmorphic cards.
* **Actionable Safety Advice Widget:** Fetches tailored, bystander-oriented safety advice for individual incidents. Displays tips in a high-contrast theme-adaptive notification card (`text-yellow-950 bg-yellow-500/10` in Light Mode, `text-yellow-200 bg-yellow-900/20` in Dark Mode) complete with dismiss/close controls.
* **Clickable Member Actions Popup:** Refactored inline list actions to a premium, centered Member Options modal. Clicking any member in a group accordion displays their profile and provides conditional controls based on credentials (Make Admin, Remove Member, Leave Group) with custom validation dialogs.
* **Client-Side Feed Pagination:** Restricts visible public feed cards to **12 items per page** with custom Previous/Next navigation controls.
* **Premium Theme system:** Beautiful Dark and Light Modes leveraging high-contrast pitch-black borders and text (`#000000`) for Light Mode.
* **Axios Auto-Logout Interceptor:** Automatically redirects to the `/login` page if local credentials expire (status 401).

---

## ⚙️ Installation & Setup

1. Navigate to the repository root directory:
   ```bash
   cd GeoBrief-Live-Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the repository:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

---

## 🚀 Running the Client

### Start the development server
```bash
npm run dev
```
*The client application will boot up at `http://localhost:5173` (or `http://localhost:5174` if port 5173 is in use)*

### Production Build compilation check
```bash
npm run build
```

---

## 📖 Specifications Reference
For the architectural design and database model guidelines, refer to the **[doc/implementation_and_specification.md](doc/implementation_and_specification.md)** file.
