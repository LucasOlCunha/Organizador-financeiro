// This file used to provide a pg Pool. The project has been migrated to Prisma.
// Keep this stub to avoid accidental imports; prefer importing the centralized
// Prisma client from `src/lib/prisma.js`.

export default function deprecatedDb() {
  throw new Error(
    "src/db.js is deprecated. Use the Prisma client from './lib/prisma.js' instead."
  );
}
