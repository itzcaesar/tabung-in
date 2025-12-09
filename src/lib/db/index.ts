import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Configure Neon with connection pooling for better performance
const sql = neon(process.env.DATABASE_URL!, {
  fetchOptions: {
    cache: 'no-store', // Ensure fresh data for mutations
  },
});

export const db = drizzle(sql, { schema });

export type DB = typeof db;
