# Selu383.SP26.Api

ASP.NET Core 10 Web API for the Caffeinated Lions coffee-shop app. Provides authentication, menu, ordering, reservations, payments, loyalty, and admin endpoints for the React Native mobile app and the React web app.

## Stack

- **.NET 10** Web API
- **Entity Framework Core 10** (SQL Server provider)
- **ASP.NET Core Identity** with cookie auth
- **Stripe.net 50.x** — payments + webhooks
- **Azure.Storage.Blobs** — menu images and receipt PDFs
- **QuestPDF** — receipt PDF generation
- **Swashbuckle (Swagger)** — API browser in development

## Prerequisites

- .NET 10 SDK
- SQL Server LocalDB (or update the connection string in `appsettings.Development.json`)
- A Stripe account in test mode (publishable + secret key + a webhook secret)
- Optional: Stripe CLI for local webhook forwarding

## Run

```powershell
cd Selu383.SP26.Api
dotnet watch
```

The app listens on the URL configured in `Properties/launchSettings.json`. Migrations and seed data run automatically at startup via `SeedHelper.MigrateAndSeed`. Swagger is available at `/swagger` in development.

To forward Stripe webhooks to your local instance:

```powershell
stripe listen --forward-to localhost:5249/api/payments/webhook
```

## Configuration

Settings live in `appsettings.json` and are overridden by `appsettings.Development.json` locally and by App Service configuration in production.

| Key | Purpose |
|---|---|
| `ConnectionStrings:DataContext` | SQL Server connection string |
| `Stripe:PublishableKey` | Sent to clients |
| `Stripe:SecretKey` | Server-side Stripe API |
| `Stripe:WebhookSecret` | Verifies webhook signatures |
| `AzureBlob:ConnectionString` | Menu images + receipt PDFs |
| `AzureBlob:Container` | Default container name |

## Project layout

```
Selu383.SP26.Api/
├── Program.cs                  # service registration + middleware pipeline
├── Controllers/                # HTTP entry points (one per feature)
├── Features/                   # domain logic grouped by capability
│   ├── Auth/                   # User, Role, RoleNames, auth DTOs
│   ├── Locations/              # Location + LocationAccessService
│   ├── Menu/                   # categories, items, per-location overrides
│   ├── Orders/                 # Order, OrderItem, OrderConstants, Receipt
│   ├── Payments/               # Payment, PaymentMethod, StripePaymentService
│   ├── Reservations/           # Reservation entity + DTOs
│   ├── Loyalty/                # LoyaltyLedger, Reward, redemption
│   ├── Tables/                 # physical tables per location
│   └── Receipts/               # ReceiptPdfService, BlobStorageService
├── Data/
│   ├── DataContext.cs          # IdentityDbContext<User, Role, int>
│   └── SeedHelper.cs           # demo data on first run
├── Migrations/                 # EF migrations
├── Extensions/                 # ClaimsPrincipal helpers
└── wwwroot/
    └── checkout/               # Stripe redirect success/cancel pages
```

## Endpoints (overview)

All endpoints are JSON. Auth is cookie-based (`Selu383.Auth`). Unauthorized requests receive `401`/`403` (no redirects).

| Area | Endpoint(s) |
|---|---|
| Auth | `POST /api/authentication/login`, `/logout`, `/register`; `GET /me` |
| Users | CRUD `/api/users` (Admin) |
| Locations | `GET /api/locations` (anon); CRUD (Admin) |
| Menu | `GET /api/menu/categories`, `/api/menu/items` (anon); CRUD (Admin/Manager); `PATCH /availability` (Manager/Staff) |
| Tables | CRUD `/api/tables` (Admin/Manager) |
| Orders | `POST /api/orders` (incl. guest); `GET /api/orders[/{id}]`; `PATCH /api/orders/{id}/status` (Staff/Manager) |
| Reservations | `POST /api/reservations`; `GET`; `DELETE /api/reservations/{id}` |
| Payments | `POST /api/payments/checkout-session`; CRUD `/api/payments/methods` |
| Stripe | `POST /api/payments/webhook` (signed) |
| Loyalty | `GET /api/loyalty/me`, `/rewards`; `POST /redeem` |

A full Swagger document is served at `/swagger` in development.

## Authentication & roles

- **Cookie:** `Selu383.Auth` (HttpOnly). `SameSite=Lax` in dev, `None+Secure` in production for cross-origin mobile/web access.
- **Roles:** `Admin`, `Manager`, `Staff`, `User`.
- **Location access** is centralized in `Features/Locations/LocationAccessService`:
  - Admin → all locations
  - Manager → locations they manage (`Location.ManagerId`)
  - Staff → the single location in `User.LocationId`
  - User → no staff-side access

## Stripe payments

Two client paths share the same backend endpoint:

- **PaymentSheet** (native iOS/Android) — preferred
- **Hosted Checkout URL** — fallback for environments without PaymentSheet

`POST /api/payments/checkout-session` returns both a `clientSecret` and a hosted `url`. After the customer pays, Stripe sends a signed event to `/api/payments/webhook`, which:

1. Verifies the signature against `Stripe:WebhookSecret`
2. Looks up the local `Order` from event metadata
3. Marks it `Paid`, creates a `Payment` row, generates a `Receipt` PDF
4. Awards loyalty points

No card number is stored locally — only Stripe payment-method IDs and masked metadata.

## Database & migrations

Add a migration after model or `IEntityTypeConfiguration<T>` changes:

```powershell
dotnet ef migrations add <DescriptiveName>
dotnet ef database update
```

In production, the same migrations run automatically at startup.

## Tests

```powershell
cd ../Selu383.SP26.Tests
dotnet test
```

The test project covers controllers and the data context.

## Deployment

The API is deployed to Azure App Service. Azure SQL hosts the database; Azure Blob Storage holds menu images and receipt PDFs. App Service Configuration provides `Stripe:*`, `AzureBlob:*`, and the connection string.
