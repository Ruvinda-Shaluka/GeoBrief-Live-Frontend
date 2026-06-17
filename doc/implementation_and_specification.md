# GeoBrief-Live Frontend: Implementation & Specification

This repository contains the client web application code for the GeoBrief-Live platform.

---

## 🛠️ Tech Stack & Architecture
* **React + Vite:** Powered by Vite's fast HMR (Hot Module Replacement) compiler.
* **TypeScript:** Strictly typed state hooks, store selectors, service methods, and component props.
* **Redux Toolkit:** Centralized state management for authentication tokens (`authSlice.ts`) and global user variables.
* **MapLibre GL JS:** Integrated maps using CartoDB Dark Matter vector style JSON, rendering glowing category markers.

---

## 💡 Frontend Features Detail

### 1. Dual-Direction Coordinates Bind
* The report form coordinates input box is bidirectional-linked to map selection coordinates.
* Viewport easing is wrapped in a focus guard to prevent keyboard typing lag:
```typescript
const activeEl = document.activeElement;
const isTyping = activeEl && (activeEl.id === "lat" || activeEl.id === "lng");
if (!isTyping) {
  map.easeTo({ center: selectedCoordinates });
}
```

### 2. Client-Side Pagination
* Restricts visible feed items in `Home.tsx` to **12 items per page** using simple `.slice()` pagination.
* Displays "Previous" / "Next" control selectors that dynamically show depending on total items count.
* Filter tags and search bars automatically reset page values to `1`.

### 3. Custom Confirmation Modal
* Built a custom `ConfirmModal` component to replace standard browser native dialogs.
* Adapts styles dynamically between info warning (for transferring group privileges) and danger (for account deletions, member exclusions, and group exits).
* Integrated into the members accordion list:
  - Admin users see a **Remove** button next to other group members to exclude them.
  - Regular members see a **Leave** button next to their own name to leave the group.
  - Both actions trigger a styled confirmation popup prior to execution.

### 4. Spacing & Theming Layouts
* Integrated Light Theme with pitch black text contrast (`#000000`) and borders for cards.
* Shuffled flex weights (`flex-[0.8]` on left logo, `flex-[1.2]` on controls) to shift navigation links slightly left, preventing navbar live clock cramping.
