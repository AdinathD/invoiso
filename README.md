# Invoiso.ai

Invoiso.ai is a decoupled billing client and invoice management application built with a modern React frontend and a robust Node.js/Express backend running on Prisma ORM and PostgreSQL.

---

## Key Features

1. **Traditional Invoice Ledger**: Edit and manage GST-inclusive billing records with quick product additions and fully flexible column selectors.
2. **Wholesale POS Terminal**: Designed for high-speed counter operations, utilizing custom keyboard traversals (arrow keys, focus transitions) for hands-on-keyboard execution.
3. **Analytics Dashboard**: Dynamic daywise, monthwise, and yearwise sales tracking, complete with interactive SVG graphs, asset holding category distributions, and best-seller lists.
4. **Flexible Invoice Print Engine**: Render and print invoice documents instantly in classic, thermal, or ledger layouts.

---

## Project Structure

* `/frontend`: React + TypeScript frontend application built with Vite and Vanilla CSS.
* `/backend`: Node.js + Express backend service using Prisma ORM.
* `technical_documentation.md`: Exhaustive developer reference manual describing architectures, data flows, types, constraints, and business logic.

---

## Quick Start (Development)

### 1. Database Setup
Ensure you have a PostgreSQL database running, and configure your connection string in `backend/.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/neondb?sslmode=require"
```

### 2. Run the Backend
Navigate to the `/backend` folder:
```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start development server (nodemon)
npm run dev
```
The backend server runs on `http://localhost:5000`.

### 3. Run the Frontend
Navigate to the `/frontend` folder:
```bash
# Install dependencies
npm install

# Start Vite server
npm run dev
```
The frontend application opens on `http://localhost:5173`.

---

## Reference Manuals
* For backend API schemas and schemas details, refer to [api_documentation.md](./api_documentation.md) (or checkout the integrated sections in [technical_documentation.md](./technical_documentation.md)).
* For internal database constraints, business logics, calculation formulas, and component layouts, refer to [technical_documentation.md](./technical_documentation.md).
