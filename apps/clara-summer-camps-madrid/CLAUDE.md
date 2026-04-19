# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this app is

A decision-support tool for choosing summer camps near **Peñagrande, Madrid** (Islas Hébridas 70) for Clara (born ~2020, age 5–6 in summer 2026). Covers two periods: **July 1–21** and **August 16–31**.

## Commands

```bash
npm run dev      # dev server at localhost:5173
npm run build    # production build → dist/
npm run preview  # preview production build
```

## Data model (`src/data/camps.js`)

All camp content lives in a single `camps` array. Each object:

```js
{
  id: "kebab-case-id",
  name: "...",
  type: "...",                          // short category label
  location: {
    address: "...",
    area: "...",                        // neighborhood name
    distanceFromPeñagrande: "...",      // must match a key in distanceOrder (App.jsx)
  },
  website: "https://...",
  contact: { phone: "...", email: "...", whatsapp: true/false },
  ages: { min: N, max: N },
  claraEligible: true/false,
  claraEligibleNote: "...",             // shown inline on the card
  dates: {
    start: "YYYY-MM-DD",
    end: "YYYY-MM-DD",
    note: "...",                        // human-readable summary
    weeks: ["..."],                     // optional list of specific weeks
  },
  schedule: {
    morning: "...", afternoon: "...",
    earlyCare: "...", extended: "...",
    options: ["..."], note: "...",
  },
  pricing: [{ duration: "...", price: 123, note: "..." }],  // empty [] = price unknown
  pricingNote: "...",                   // always shown; use for "consultar" or discounts
  activities: ["..."],                  // drives activity filter chips
  pros: ["..."],                        // 4–7 items
  cons: ["..."],                        // 4–7 items
  included: ["..."],
  signup: {
    deadline: "..." | null,             // non-null triggers red deadline-warning box
    requirements: ["..."],
    documents: ["..."],
  },
  tier: 1 | 2 | 3,                     // 1=Recomendado, 2=Buena opción, 3=Con reservas
}
```

**Tier guide:**
- **1** — Recommended: good mix of proximity, creative focus, price, and date coverage
- **2** — Good option: notable trade-off (distance, price, bilingual, limited dates)
- **3** — With reservations: significant drawback (too far, wrong dates, price unknown)

**`distanceFromPeñagrande`** must match a key in the `distanceOrder` map in `src/App.jsx` for distance sorting to work. Current keys: `"Montecarmelo (~7 min)"`, `"Tres Olivos (~8 min)"`, `"Fuencarral (~10 min)"`, `"Ciudad Universitaria (~12 min)"`, `"Francos Rodriguez (~12 min)"`, `"Salamanca (~20 min)"`, `"Valdebebas (~25 min)"`. Add a new key to both places when adding a camp in a new area.

**Activity filter matching** (`src/components/Filters.jsx`): activity strings in `activities[]` are matched case-insensitively against the `match` arrays. When adding a camp with new activity types, extend the relevant category's `match` array or add a new category.

## Key editorial decisions

- **Clara eligibility:** `claraEligible: false` when the age minimum is 6+ and Clara is still 5 in July 2026 (born Sept 2020). Mark as false and explain in `claraEligibleNote`.
- **Dates priority:** camps that cover *both* July 1–21 AND August 16–31 get a strong tier boost. Sonrisas is the only current option covering both.
- **Language:** Spanish-immersion is the goal. Bilingual camps (e.g. Alopeke) get a con and are kept at Tier 2 or lower.
- **MuPAI note:** 2026 convocatoria not yet published as of April 2026; dates/prices are from 2024. Update when official info is released.

## Urgency banner

The red banner in `App.jsx` is hardcoded for the MadridCamp municipal lottery (Apr 23–29 registration window). Remove or update it once that window passes.
