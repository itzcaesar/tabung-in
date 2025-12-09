import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Configure Neon with connection pooling for better performance
// Note: cache: 'no-store' ensures we always get fresh data from the database
// This is important for maintaining data consistency in the application
// For read-heavy operations, consider implementing application-level caching
const sql = neon(process.env.DATABASE_URL!, {
  fetchOptions: {
    cache: 'no-store', // Ensure fresh data for mutations and consistent reads
  },
});

export const db = drizzle(sql, { schema });

export type DB = typeof db;
