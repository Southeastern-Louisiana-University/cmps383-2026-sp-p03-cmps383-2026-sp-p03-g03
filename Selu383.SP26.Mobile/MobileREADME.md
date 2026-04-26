# Selu383.SP26.Mobile

React Native mobile app for the Caffeinated Lions coffee-shop project, built with Expo. Customers browse a per-location menu, place orders, pay through Stripe, book table reservations, and earn loyalty points. Staff and managers fulfill orders and manage reservations for their assigned locations.

## Stack

- **Expo SDK 54** (React Native)
- **TypeScript**
- **expo-router** — file-based routing
- **@stripe/stripe-react-native** — PaymentSheet + hosted checkout fallback
- **AsyncStorage** — light client-side caching
- **React Navigation** — bottom tabs + stack
- **Custom hooks + Context API** for auth, cart, and theme

## Prerequisites

- Node.js 20+ and npm
- Expo Go on a physical device (iOS or Android) — or an iOS simulator / Android emulator
- A running backend (see `../Selu383.SP26.Api/README.md`) reachable at the URL set in `.env`

## Run

```powershell
cd Selu383.SP26.Mobile
npm install
npm run start
```

Then either:
- Scan the QR code with Expo Go
- Press `i` for the iOS simulator
- Press `a` for the Android emulator
- Press `w` for web

## Configuration

The API base URL is read from `.env`:

```
EXPO_PUBLIC_API_URL=https://selu383-sp26-p03-g03.azurewebsites.net
```

Override locally to point at your dev backend, or edit the fallback in `services/api-core.ts`. The cookie auth flow uses `credentials: 'include'`, so HTTPS is required when targeting a deployed backend.

## Project layout

```
Selu383.SP26.Mobile/
├── app/                        # routes (file-based via expo-router)
│   ├── _layout.tsx             # providers, fonts, root stack
│   ├── splash.tsx              # marketing splash + auth-aware redirect
│   ├── login.tsx               # sign in / sign up
│   ├── checkout.tsx            # cart → payment flow
│   ├── team.tsx                # manager team view
│   ├── portal.tsx              # staff dashboard entry
│   ├── modal.tsx               # generic modal route
│   └── (tabs)/                 # bottom tab group
│       ├── index.tsx           # Home
│       ├── menu.tsx            # browse + add to cart
│       ├── cart.tsx            # cart review
│       ├── orders.tsx          # my orders / staff queue
│       ├── reservations.tsx    # My / Book / Manage
│       └── account.tsx         # profile, payments, loyalty
├── components/                 # reusable UI
│   ├── account/                # profile card, payment list, loyalty card
│   ├── menu/                   # location selector, item modal
│   ├── reservations/           # My, Book, Manage sections
│   └── ui/                     # icons, dialogs, banners
├── contexts/
│   ├── AuthContext.tsx         # current user + login/logout/register
│   ├── CartContext.tsx         # cart items + active location
│   └── ThemeContext.tsx        # light/dark + palette
├── services/
│   ├── api-core.ts             # fetch wrapper + ApiError
│   ├── api.ts                  # one helper per backend endpoint
│   └── api-types.ts            # TS interfaces matching backend DTOs
├── hooks/                      # useAuth, useCart, theme hooks
├── utils/                      # date, role, checkout helpers
├── constants/                  # styles, theme, image map
├── styles/                     # global stylesheets
└── assets/                     # fonts, splash, icons
```

## State

Three contexts compose under the root layout:

- **`AuthContext`** — current user, role flags, `login` / `logout` / `register`. The auth cookie is the persistence layer; the context just caches the response.
- **`CartContext`** — cart items + the location they belong to. `addItem(item, qty, notes?, expectedLocationId?)` clears + re-anchors the cart if the user switched locations.
- **`ThemeContext`** — light/dark mode and the green/coffee palette tokens.

## Networking

All HTTP traffic goes through `services/api.ts`. Each endpoint has a typed wrapper, so screens never call `fetch` directly. `services/api-core.ts` handles:

- Base URL resolution (`EXPO_PUBLIC_API_URL` → fallback)
- Cookie passthrough (`credentials: 'include'`)
- JSON parsing
- Error normalization into a typed `ApiError { status, message, payload }`

## Payments

Two paths, picked at runtime:

1. **Stripe PaymentSheet** — native iOS/Android sheet (preferred)
2. **Hosted Checkout** — opens the Stripe-hosted URL in a browser; used in Expo Go and simulators where PaymentSheet isn't available

Both start from the same backend call (`POST /api/payments/checkout-session`). Order confirmation is asynchronous — once Stripe fires its webhook to the backend, the next refresh of the Orders tab will show the order as Paid.

## Reservations

Booking requires:

- Date + hour within business hours
- ≥2 hours of lead time (UX-checked here, authoritatively enforced server-side)
- Party size 2–6
- An available table at the chosen time

If the customer has no qualifying purchase at that location today, the backend returns HTTP 402 with a Stripe checkout URL for a cover charge. The app opens it, then retries the reservation.

## Demo accounts

These are seeded by the backend on first run.

| Username | Role | Password |
|---|---|---|
| `manager1` | Manager | `Password123!` |
| `staff1` | Staff | `Password123!` |

Sign up a new account from the Login screen to get the customer experience.

## Scripts

| Command | What it does |
|---|---|
| `npm run start` | Expo dev server |
| `npm run ios` | Open in iOS simulator |
| `npm run android` | Open in Android emulator |
| `npm run web` | Run in a browser |
| `npm run lint` | ESLint via `expo lint` |
| `npm run reset-project` | Clear Metro / build caches |

## Common pitfalls

- **Login fails on the deployed backend** — the app must be served over HTTPS to share the auth cookie cross-origin. Use `EXPO_PUBLIC_API_URL=https://...` and a tunneled Expo session.
- **PaymentSheet error in Expo Go** — expected. The app falls back to hosted checkout automatically.
- **Cart unexpectedly empty** — switching locations clears it on purpose; this is the cart-location guarantee, not a bug.

## Related

- `../Selu383.SP26.Api/README.md` — backend setup
- `../README.md` — repo overview
