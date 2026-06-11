# AI Agent Guide: Andalucía Scouting System (AGENTS.md)

Welcome, AI Agent. This codebase is a React + Vite application designed to coordinate a 4-day real-estate scouting trip in Southern Spain. Below are the structural rules and constraints you must respect when making updates.

---

## 1. System Rules & Constraints

### 💸 Financial & Budget Constraints
*   **Property Price Cap:** Absolutely all properties featured in `obraNueva` or `resaleClusters` must be under **€380,000**.
*   **Target Property Typology:** Focus on **Condos & Apartments** (3-bed preferred) with underground garages. Townhouses and detached villas are secondary but acceptable if under budget.
*   **No Bilingual School Bias:** Do not suggest private bilingual schools as a priority; the user does not require them. Focus instead on local lifestyle and parking scores.

### 🚗 Navigation & Car Logistics
*   **Vehicle profile:** The scouting group travels in a **Mercedes V-Class 7-seater van**.
*   **Historic Centers Warning:** Cascos históricos (historical cores) in Andalusian towns are extremely narrow. Do not route the van into town centers (e.g., Granada old town, Coín old town, central Seville). Always route to peripheral parking lots or park-and-ride metro stations.
*   **Commuting Strategy:** Commuting to Granada or Seville must utilize park-and-ride metro terminals (e.g., Nevada Mall for Granada, Ciudad Expo for Seville).

---

## 2. Codebase Architecture

### 📂 File Structure
*   `src/data/content.js` — **Single Source of Truth** for all itinerary details, lists, and metadata.
*   `src/App.jsx` — Core UI shell. Renders tabs, itinerary lists, and section views. Do not hardcode specific day details here.
*   `src/App.css` — Global styling. Uses a warm orange/citrus gradient theme representing southern Spain. Must remain responsive and mobile-friendly.

### 🛠️ Data Schema in `content.js`
When editing `content.js`, ensure you preserve these structures:
*   `tripMeta`: Title, dates, and vehicle settings.
*   `overview.clusters`: Core target regions with `nights` and `base`.
*   `days`: 4-day timeline. Individual stop kinds must be one of:
    `departure` | `drive` | `checkin` | `supermarket` | `scout` | `lunch` | `dinner` | `showhome` | `rest` | `arrival`
*   `parkingInfo`: Rationale, score, and notes about car ease of use.
*   `obraNueva`: Newly constructed condo/townhouse developments.
*   `resaleClusters`: Table entries for resale prices by neighborhood.
*   `questions`: Guidance for developer/agent meetings.

---

## 3. Deployment & Validation
*   Before completing your turn, always validate that the app compiles cleanly by running `npm run build`.
*   Ensure all new links to Google Maps use the standard `https://www.google.com/maps/search/?api=1&query=` format and are URL-encoded.
