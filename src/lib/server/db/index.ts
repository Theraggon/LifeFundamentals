import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import postgres from 'postgres';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Detect if we're using Neon (production) or local PostgreSQL (development)
const isNeonDatabase = env.DATABASE_URL.includes('neon.tech') || env.DATABASE_URL.includes('neon.fl0.io');

let db;

if (isNeonDatabase) {
	// Production: Use Neon serverless
	const client = neon(env.DATABASE_URL);
	db = drizzleNeon(client, { schema });
} else {
	// Development: Use regular PostgreSQL
	const client = postgres(env.DATABASE_URL, {
		ssl: false // Disable SSL for local development
	});
	db = drizzle(client, { schema });
}

export { db };
