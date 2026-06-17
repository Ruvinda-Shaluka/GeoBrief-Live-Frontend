# GeoBrief-Live Frontend Client 📱

This is the web client repository for the GeoBrief-Live platform. It is built using **React**, **Vite**, **TypeScript**, and **Tailwind CSS**. It incorporates **MapLibre GL JS** using a free, responsive CartoDB Dark Matter map layer to let users visualize, report, and collaborate on local incidents.

---

## 🚀 Key Features

* **Interactive Map Dashboard:** Real-time hazard location markers, camera viewport auto-focusing (lag-free when typing), and MapLibre popup info bubbles.
* **Dual-Direction Coordinate Sync:** Syncs coordinates between the report form inputs and map click selections.
* **Device GPS Syncing:** Fetches current coordinate positions from the browser's Geolocation API.
* **Client-Side Feed Pagination:** Restricts visible public feed cards to **12 items per page** with custom Previous/Next navigation controls.
* **Premium Theme system:** Beautiful Dark and Light Modes leveraging high-contrast pitch-black borders and text (`#000000`) for Light Mode.
* **Group Collaboration Accordion:** Collapsible lists of group members with admin transfer buttons.
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
