// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import Database from 'better-sqlite3';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import * as path from 'path';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import * as os from 'os';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import * as fs from 'fs';

/**
 * SQLite-based cookie storage for n8n Pinterest node
 * Provides persistent cookie storage across all workflow executions
 */
export class CookieStorage {
	private db: Database.Database;
	private dbPath: string;

	constructor() {
		// Store the database in the user's home directory to ensure persistence
		// across n8n updates and restarts
		const dbDir = path.join(os.homedir(), '.n8n', 'pinterest-cookies');
		
		// Ensure directory exists
		if (!fs.existsSync(dbDir)) {
			fs.mkdirSync(dbDir, { recursive: true });
		}

		this.dbPath = path.join(dbDir, 'cookies.db');
		console.log(`[CookieStorage] Database path: ${this.dbPath}`);

		// Initialize database
		this.db = new Database(this.dbPath);
		this.initializeDatabase();
	}

	/**
	 * Initialize database schema
	 */
	private initializeDatabase(): void {
		// Create table if it doesn't exist
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS cookies (
				email TEXT PRIMARY KEY,
				cookies TEXT NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);

		console.log(`[CookieStorage] ✓ Database initialized`);
	}

	/**
	 * Save cookies for a specific email
	 */
	saveCookies(email: string, cookies: unknown[]): void {
		const cookiesJson = JSON.stringify(cookies);
		const timestamp = Date.now();

		const stmt = this.db.prepare(`
			INSERT OR REPLACE INTO cookies (email, cookies, updated_at)
			VALUES (?, ?, ?)
		`);

		stmt.run(email, cookiesJson, timestamp);

		console.log(`[CookieStorage] ✓ Saved ${cookies.length} cookies for ${email}`);
	}

	/**
	 * Load cookies for a specific email
	 */
	loadCookies(email: string): unknown[] {
		const stmt = this.db.prepare(`
			SELECT cookies, updated_at FROM cookies WHERE email = ?
		`);

		const row = stmt.get(email) as { cookies: string; updated_at: number } | undefined;

		if (row) {
			try {
				const cookies = JSON.parse(row.cookies) as unknown[];
				const ageMinutes = Math.floor((Date.now() - row.updated_at) / 60000);
				console.log(`[CookieStorage] ✓ Loaded ${cookies.length} cookies for ${email} (age: ${ageMinutes} minutes)`);
				return cookies;
			} catch (error) {
				console.log(`[CookieStorage] ✗ Failed to parse cookies for ${email}:`, error);
				return [];
			}
		}

		console.log(`[CookieStorage] ℹ No cookies found for ${email}`);
		return [];
	}

	/**
	 * Delete cookies for a specific email
	 */
	deleteCookies(email: string): void {
		const stmt = this.db.prepare(`
			DELETE FROM cookies WHERE email = ?
		`);

		const result = stmt.run(email);
		
		if (result.changes > 0) {
			console.log(`[CookieStorage] ✓ Deleted cookies for ${email}`);
		} else {
			console.log(`[CookieStorage] ℹ No cookies to delete for ${email}`);
		}
	}

	/**
	 * Get all stored emails
	 */
	getAllEmails(): string[] {
		const stmt = this.db.prepare(`
			SELECT email FROM cookies ORDER BY updated_at DESC
		`);

		const rows = stmt.all() as { email: string }[];
		return rows.map(row => row.email);
	}

	/**
	 * Clean up old cookies (older than specified days)
	 */
	cleanupOldCookies(daysOld: number = 30): void {
		const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

		const stmt = this.db.prepare(`
			DELETE FROM cookies WHERE updated_at < ?
		`);

		const result = stmt.run(cutoffTime);

		if (result.changes > 0) {
			console.log(`[CookieStorage] ✓ Cleaned up ${result.changes} old cookie entries`);
		}
	}

	/**
	 * Close database connection
	 */
	close(): void {
		this.db.close();
		console.log(`[CookieStorage] ✓ Database connection closed`);
	}

	/**
	 * Get database stats
	 */
	getStats(): { totalEntries: number; dbSizeKB: number } {
		const countStmt = this.db.prepare(`SELECT COUNT(*) as count FROM cookies`);
		const countRow = countStmt.get() as { count: number };

		let dbSizeKB = 0;
		try {
			const stats = fs.statSync(this.dbPath);
			dbSizeKB = Math.round(stats.size / 1024);
		} catch {
			// Ignore errors getting file size
		}

		return {
			totalEntries: countRow.count,
			dbSizeKB,
		};
	}
}

// Singleton instance
let cookieStorageInstance: CookieStorage | null = null;

/**
 * Get the singleton instance of CookieStorage
 */
export function getCookieStorage(): CookieStorage {
	if (!cookieStorageInstance) {
		cookieStorageInstance = new CookieStorage();
	}
	return cookieStorageInstance;
}

/**
 * Close the singleton instance (call during cleanup)
 */
export function closeCookieStorage(): void {
	if (cookieStorageInstance) {
		cookieStorageInstance.close();
		cookieStorageInstance = null;
	}
}

