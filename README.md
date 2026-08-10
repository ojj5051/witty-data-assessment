# Project README

## 1. Setup Instructions

### Prerequisites

Make sure the following are installed:

* Node.js 20+
* npm
* PostgreSQL 14+
* Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-folder>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root: refer to `.env-sample` for the URL.

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

Update the values according to the local PostgreSQL configuration.

### 4. Set Up the Database

Create the PostgreSQL database and run the required SQL scripts/migrations.

Run db_scehema.sql and db_seed.sql provided in the google drive

### 5. Start the Development Server

```bash
npm run dev
```

The application should then be available at:

```text
http://localhost:3000
```

### 6. Production Build

To create a production build:

```bash
npm run build
```

Start the production server with:

```bash
npm start
```

---

## 2. Assumptions Made

The following assumptions were made during development:

### Invoice Management

* An invoice belongs to a participant and provider.
* Invoice items are associated with support items from the configured rate set.
* The invoice amount is calculated based on the selected support item and applicable pricing.
* The expected amount and calculated amount should match before an invoice can be finalized.

### Rate Sets

* Support Item Number is treated as the primary business identifier for a support item.
* Pricing is determined based on the applicable pricing region and rate-set date range.
* A rate set cannot have overlapping effective date ranges where the database constraints prohibit overlap.

### Excel Import

* The uploaded Excel file follows the expected column structure.

* Dates in the Excel file can appear in formats such as `YYYYMMDD`.

* Pricing region columns correspond to the supported regions:

  * ACT
  * NSW
  * NT
  * QLD
  * SA
  * TAS
  * VIC
  * WA
  * Remote
  * Very Remote

* Re-importing the same data should not create duplicate records.

---

## 3. Trade-offs

### Backend Business Logic

Business rules are implemented primarily in the API/backend layer rather than relying on frontend validation.

**Benefit:**

* Keeps the backend as the single source of truth.
* Prevents clients from bypassing important business rules.
* Makes the rules reusable by other clients.

**Trade-off:**

* Some validation may happen both on the frontend and backend to provide immediate user feedback.
* This can result in some duplicated validation logic.

### PostgreSQL Constraints

Database constraints are used to enforce important data integrity rules.

**Benefit:**

* Invalid data cannot easily bypass application logic.
* Prevents issues such as overlapping rate-set periods and duplicate records.

**Trade-off:**

* Database errors need to be translated into user-friendly API responses.
* Changes to business rules may require database migrations.

### Frontend Filtering

Some filtering is performed on the frontend using React state and memoization.

**Benefit:**

* Provides fast filtering once the data is already loaded.
* Reduces API calls for simple filtering operations.

**Trade-off:**

* Large datasets can increase browser memory usage.
* Very large datasets should eventually use server-side filtering and pagination.

### Excel Import

The Excel file is processed by the application and mapped into the database structure.

**Benefit:**

* Provides a convenient way to import large pricing datasets.
* Allows existing records to be updated rather than blindly inserting duplicates.

**Trade-off:**

* The importer depends on the expected Excel structure.
* Significant changes to the source Excel format may require changes to the importer.

### API Architecture

REST-style API endpoints are used for communication between the frontend and backend.

**Benefit:**

* Simple and familiar structure.
* Easy to debug and integrate with other clients.

**Trade-off:**

* Some screens may require multiple API requests.
* More complex data requirements may require additional aggregation endpoints.

---

## 4. What Is Incomplete

The following areas may require additional implementation depending on the final project requirements:

* Audit Logging
* RBAC (Despite the system able to create, update and delete the role of the user, but it has no effect on the system)
* AI-based PDF Invoice

---

## 5. Known Limitations / Future Improvements

### Performance

Large datasets may cause increased frontend memory usage because some filtering and processing currently happens client-side.

**Future improvement:**

* Move filtering, sorting, and pagination to the API.
* Return only the records required by the current page.

### API Requests

Some dependent dropdowns and invoice-related data may require multiple API requests.

**Future improvement:**

* Combine related data into dedicated API endpoints where appropriate.
* Add caching for relatively static data such as providers, categories, and rate-set information.
* Use request deduplication where multiple components request the same data.

### Error Handling

The API returns structured errors, but additional standardization could improve consistency across all endpoints.

**Future improvement:**

Use a consistent error format such as:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": []
  }
}
```
---

## 6. Project Structure

A simplified project structure is:

```text
project/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── auth-sessions/
│   │   ├── dropdown/
│   │   ├── invoices/
│   │   ├── providers/
│   │   ├── participants/
│   │   ├── rate-sets/
│   │   ├── user-roles/
│   │   └── users/
│   ├── dashboard/
│   │   ├── invoices/
│   │   ├── participants/
│   │   ├── providers/
│   │   ├── rate-sets/
│   │   ├── settings/
│   │   │   ├── auth-sessions/
│   │   │   ├── user-roles/
│   │   │   └── users/
│   └── page.tsx
│
├── components/
│   ├── Form-drawer-invoice/
│   ├── Form-drawer-rate-sets/
│   ├── Form-drawer-user-roles/
│   ├── Form-drawer/
│   └── Sidebar/
│
├── lib/
│   ├── db/
│   ├── auth/
│   └── axios/
│
├── services/
│   ├── auth-service/
│   ├── auth-sessions-service/
│   ├── dropdown-service/
│   ├── invoices-service/
│   ├── participants-service/
│   ├── providers-service/
│   ├── rate-sets-service/
│   ├── user-roles-service/
│   └── users-service/
│
├── public/
├── .env.local
├── package.json
└── README.md
```

The exact structure may differ depending on the final implementation.

---

## 7. Summary

The application is designed around a Next.js frontend, API/backend layer, and PostgreSQL database.

The backend/API layer is treated as the **single source of truth for business logic and data validation**, while the frontend focuses primarily on presentation, user interaction, and client-side usability.

The main areas for future improvement are automated testing, scalability for large datasets, production security, API optimization, and more robust Excel import validation.
