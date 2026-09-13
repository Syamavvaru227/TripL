# TripL — Demo Recording Script

A 3-minute screen recording that shows the full product, plus the SIH pitch
outline for the slides.

---

## Before you hit record

The two things that ruin a take: a cold server and an empty state.

1. **Start both servers** (or open the deployed URL and click through once).
2. **Warm the demo city.** Search your city in Explore and let it finish loading,
   then go back to the landing page. The first query hits live sources and takes
   13–22 s; warmed, it is ~1 s. **Do this every time you restart the backend.**
3. **Register your demo account beforehand** so the login beat is smooth, or keep
   the registration beat and accept the typing.
4. **Set the window to 1440×900 or 1920×1080**, zoom at 100%, browser at full
   screen with bookmarks bar hidden. The layout is designed for desktop.
5. **Close notification popups** (Slack, Windows notifications, email).
6. **Silence your phone.**

Pick the demo city based on what you want to showcase. **Guntur** works well
(Jinnah Tower, Kondaveedu Fort, Amararama, Uppalapadu Bird Sanctuary). If you
want a visually richer map, **Visakhapatnam** has coastal beaches plus hilltop
viewpoints.

---

## The run of show

Timings are a target, not a cage. Speak slightly slower than feels natural.

### 0:00 – 0:25 · Landing page

**Clicks:** none. Let the hero sit for two seconds before speaking.

> "Every Indian city is full of places worth seeing — but travellers don't know
> what's within reach, and planning a day out means juggling five apps. TripL
> answers one question: *I'm here for six hours. What should I actually do?*"

Scroll slowly once so the hero divider and the section below come into view.

### 0:25 – 0:45 · Search and discovery

**Clicks:** click the search box → type `Guntur` → click **Explore Nearby**.

> "I pick any location in India — not a fixed list. TripL discovers real tourist
> places within 30 km, live, from open geographic and encyclopaedic sources."

The map flies to the city and markers populate. **Pause here.** Let the viewer
watch clustering and category colour-coded markers appear — this is the moment
that reads as "Google Maps–level".

### 0:45 – 1:15 · Explore dashboard

**Clicks:** hover a filter category (🏛️ Heritage) → drag the **max distance**
slider → click a **map marker** → then open a **place card** from the right panel.

> "Every result is filterable by category, distance, rating, and whether it's open
> right now. Each card carries distance, travel time, opening hours, and a short
> cultural note — so I can decide before I move."

If the viewer can't read a card, that's fine — the goal is density. Keep moving.

### 1:15 – 1:50 · Destination detail + Know India

**Clicks:** open **Jinnah Tower** (or another heritage site) → scroll through
Overview → click the **🏛️ Know India** tab.

> "This is where TripL stops being a directory. Every destination carries its own
> history, significance and local context — pulled live, not hardcoded. Know India
> is the difference between a listing and a guide."

Scroll the Know India content slowly. Give it three seconds of screen time; it is
your strongest differentiator.

### 1:50 – 2:10 · Travel options

**Clicks:** click the **🚗 Get There** tab.

> "Getting there is part of the plan. TripL compares car, bike, bus, auto and
> walking — real road distances, real travel time, and estimated cost in rupees,
> so a budget traveller and a family get different answers."

Hover the cheapest mode so the highlight is visible.

### 2:10 – 2:45 · Plan Journey wizard → AI itinerary

**Clicks:** click **Plan** in the nav → walk the 5 steps quickly:
location → budget & time → interests → **place types** → transport → **Create My Journey**.

At the Place Types step, dwell for a beat:

> "This is the part judges should look at. I tell TripL *how* I want to travel —
> top-rated, must-visit, hidden gems, off-beat, seasonal, photo-worthy — and the
> engine reweights its scoring around that."

Then land on the itinerary and scroll the timeline:

> "Six hours, four stops, real distances, real costs — and an explanation of *why*
> each stop was chosen. It fits my budget, fits my time, respects opening hours,
> and minimises backtracking."

### 2:45 – 3:00 · Close

**Clicks:** click **Save Itinerary** so the saved state is visible.

> "TripL: modern India meets intelligent travel. Built on open data, so it scales
> to every city in the country — and it sends travellers to the places and
> businesses that need them."

Stop recording. Do not add a logo outro.

---

## Recording tips

- **One continuous take is better than cuts** for a hackathon demo — it proves the
  thing works. If you must cut, cut between whole beats, never mid-animation.
- **Move the cursor deliberately.** Slow, purposeful movements read as confidence;
  fast darting reads as nerves.
- **Narrate the *why*, not the *what*.** Don't say "this is the map." Say why the
  map matters.
- **If a network call stalls, keep talking.** Silence is the only real failure.
- **Record the voice separately if you fumble.** Screen recording plus a clean
  voiceover is standard practice and looks more professional.

## Fallbacks

| If this breaks | Do this |
|---|---|
| Backend is slow / first query hangs | It is the cold cache. Restart and warm the city first. |
| The deployed URL is asleep | Load it once, wait ~60 s, then record. Or record from localhost. |
| No places for your city | Try Guntur or Visakhapatnam — cities with the richest place coverage. |
| Internet drops mid-take | The app caches per city in-process; a warmed demo survives a brief outage. |
| Map tiles don't render | Check your connection; tiles come from OpenStreetMap. |

---

## SIH pitch outline (slides)

Six slides, matching the SIH idea-submission template. One line each, spoken in
about 40 seconds total.

**1. Problem** — Travellers and locals in Indian cities don't know what is within
reach, and planning a single day out takes five apps and an hour of guesswork.
Tier-2 and tier-3 towns lose tourism revenue because they are invisible online.

**2. Solution** — Enter any location. TripL finds real tourist places within
30 km, compares travel modes on real road distances and costs, and generates a
personalised itinerary that respects your budget, your time, and opening hours.

**3. Technical approach** — React + Vite + Tailwind + Leaflet on the front, FastAPI
+ SQLAlchemy on the back, live data from Wikipedia, OpenStreetMap, Nominatim and
OSRM. A weighted scoring engine ranks and schedules stops; no API keys required
for core functionality.

**4. Feasibility** — Open data sources mean zero per-query cost. Scoring weights
are tunable per city. What's needed is coverage depth, which grows with the open
datasets rather than our budget.

**5. Impact** — Better distribution of tourist footfall beyond the famous
landmarks, revenue to local artisans, homestays and eateries, and a
responsible-tourism layer that signals eco-friendly and community-supported
places.

**6. Differentiation** — Not a directory and not a generic AI dashboard. A
cultural guide: every destination carries its history, its local context, and a
reason for being in your plan.

**The single sentence to land:** *TripL turns one location into a complete Indian
journey — and sends travellers to the places that need them.*
