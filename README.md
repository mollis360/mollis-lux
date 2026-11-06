# MOLLIS LUX

MOLLIS LUX is a single-hotel luxury hotel management and booking application. It is not a marketplace, multi-tenant platform, or hotel-owner SaaS.

## Stack

- Next.js App Router 16
- React and TypeScript
- Tailwind CSS v4
- PostgreSQL/Neon
- Drizzle ORM
- Better Auth
- Zod

## Project structure

```text
app/                 Next.js routes and layouts
src/components/      Reusable admin and public components
src/db/              Database connection and schemas
src/lib/             Authentication, queries, actions, and validation
drizzle/             Drizzle migrations
public/              Static assets
```

## Local development

Create `.env.local` with:

```text
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

`CLOUDINARY_API_SECRET` must remain server-only. The admin room-image manager uses a signed upload endpoint at `/api/cloudinary/signature`; it does not use an unsigned upload preset. Configure the Cloudinary account, copy the Cloud Name/API Key/API Secret into the server environment, and keep Cloudinary upload restrictions aligned with the application’s JPEG, PNG, WebP, AVIF, and 10 MB limits.

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

## Database

Schema changes use Drizzle migrations. Inspect generated SQL before applying it to a shared or production database:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

The database represents exactly one MOLLIS LUX hotel. The existing four room-category records are fixed product inventory: category creation and deletion are disabled in the UI and protected by a PostgreSQL trigger. Room categories are sellable room types; physical rooms are inventory assigned to categories and are always queried by their `roomCategoryId`. Physical room statuses are `available`, `maintenance`, and `inactive`. Occupancy will be derived from reservations rather than stored as a room status.

## Authentication and roles

Better Auth provides email/password authentication and PostgreSQL-backed sessions. The application roles are `admin`, `manager`, `staff`, and `customer`. Protected mutations must verify authorization on the server.

## Current implementation status

Implemented foundations include hotel administration, fixed four-category administration, physical-room administration, public hotel/category pages, room-category images as database records, reservation-aware availability, a signed-in customer booking/review/confirmation flow, pending reservation holds, customer-owned reservation history, reservation event history, paginated reservation operations, and server-validated operational status transitions. The admin shell and room-category workflows use a light luxury treatment with Lucide semantic icons; no hotel, marketplace, or multi-tenant concepts were introduced.

Cloudinary signed image storage is now connected for admin room-category uploads. New uploads persist the Cloudinary public ID, secure delivery URL, dimensions, format, and bytes after required alt-text confirmation. Legacy URL-only image rows remain supported. Payment provider/policy, transactional email, cancellation/refund policy, and production deployment configuration still require approved decisions. Pending reservation holds are implemented without payment confirmation and must not be represented as confirmed bookings.

## Cloudinary image workflow

- Uploads are authenticated and authorized for administrators on the server.
- The signing route only accepts short-lived timestamps and the exact room-category folder.
- The browser is limited to local image uploads in JPEG, PNG, WebP, or AVIF format up to 10 MB.
- A Cloudinary upload is not committed to the database until the administrator supplies meaningful alt text.
- Canceling an uncommitted upload requests provider cleanup. If a browser is closed after the provider upload and before metadata persistence, the asset requires periodic Cloudinary orphan review; the database never silently treats an uncommitted asset as a room image.
- Deletion destroys the Cloudinary asset before removing its database record. A provider failure leaves the database row intact so the operation can be retried.

Manual verification for the image workflow:

1. Sign in as an administrator and open an existing room category.
2. Upload a valid image and confirm the Cloudinary preview appears before metadata is saved.
3. Try an oversized or unsupported file and confirm it is rejected.
4. Save meaningful alt text and confirm the image row contains Cloudinary metadata.
5. Edit alt text, move the image, set a different cover, and delete it.
6. Confirm a legacy URL-only row still renders.
7. Confirm a manager, staff member, customer, or unauthenticated request cannot obtain a signing response or invoke image mutations.

## Validation

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Run the database concurrency fixture only against an explicitly approved disposable/local database:

```bash
RUN_DB_TESTS=1 npm test
```

The test suite covers date semantics, capacity validation, money snapshots, hold expiration semantics, reservation transitions, and PostgreSQL overlap protection. Accessibility audit and full end-to-end coverage remain before production release.
