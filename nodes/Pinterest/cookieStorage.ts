// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import * as path from 'path';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import * as os from 'os';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import * as fs from 'fs';

/**
 * Interface for cookie storage entry
 */
interface CookieEntry {
	email: string;
	cookies: unknown[];
	updatedAt: number;
}

/**
 * JSON file-based cookie storage for n8n Pinterest node
 * Provides persistent cookie storage across all workflow executions
 * No native dependencies required - works on all platforms
 */
export class CookieStorage {
	private storageDir: string;
	private indexPath: string;
	private index: Map<string, CookieEntry>;

	constructor() {
		// Store cookies in the user's home directory to ensure persistence
		// across n8n updates and restarts
		this.storageDir = path.join(os.homedir(), '.n8n', 'pinterest-cookies');
		this.indexPath = path.join(this.storageDir, 'index.json');

		// Ensure directory exists
		if (!fs.existsSync(this.storageDir)) {
			fs.mkdirSync(this.storageDir, { recursive: true });
		}

		console.log(`[CookieStorage] Storage directory: ${this.storageDir}`);

		// Load index
		this.index = new Map();
		this.loadIndex();
	}

	/**
	 * Load the index from disk
	 */
	private loadIndex(): void {
		try {
			if (fs.existsSync(this.indexPath)) {
				const data = fs.readFileSync(this.indexPath, 'utf-8');
				const entries = JSON.parse(data) as CookieEntry[];
				this.index = new Map(entries.map(entry => [entry.email, entry]));
				console.log(`[CookieStorage] ✓ Loaded index with ${this.index.size} entries`);
			} else {
				console.log(`[CookieStorage] ℹ No index found, starting fresh`);
			}
		} catch (error) {
			console.log(`[CookieStorage] ✗ Failed to load index:`, error);
			this.index = new Map();
		}
	}

	/**
	 * Save the index to disk
	 */
	private saveIndex(): void {
		try {
			const entries = Array.from(this.index.values());
			fs.writeFileSync(this.indexPath, JSON.stringify(entries, null, 2), 'utf-8');
		} catch (error) {
			console.log(`[CookieStorage] ✗ Failed to save index:`, error);
		}
	}

	/**
	 * Get the file path for a specific email's cookies
	 */
	private getCookieFilePath(email: string): string {
		// Use a safe filename based on email
		const safeEmail = email.replace(/[^a-zA-Z0-9@._-]/g, '_');
		return path.join(this.storageDir, `${safeEmail}.json`);
	}

	/**
	 * Save cookies for a specific email
	 */
	saveCookies(email: string, cookies: unknown[]): void {
		const timestamp = Date.now();
		const entry: CookieEntry = {
			email,
			cookies,
			updatedAt: timestamp,
		};

		// Save cookie file
		const filePath = this.getCookieFilePath(email);
		try {
			fs.writeFileSync(filePath, JSON.stringify(cookies, null, 2), 'utf-8');
			
			// Update index
			this.index.set(email, entry);
			this.saveIndex();

			console.log(`[CookieStorage] ✓ Saved ${cookies.length} cookies for ${email}`);
		} catch (error) {
			console.log(`[CookieStorage] ✗ Failed to save cookies for ${email}:`, error);
		}
	}

	/**
	 * Load cookies for a specific email
	 */
	loadCookies(email: string): unknown[] {
		const filePath = this.getCookieFilePath(email);

		try {
			if (fs.existsSync(filePath)) {
				const data = fs.readFileSync(filePath, 'utf-8');
				const cookies = JSON.parse(data) as unknown[];
				
				// Get age from index
				const entry = this.index.get(email);
				if (entry) {
					const ageMinutes = Math.floor((Date.now() - entry.updatedAt) / 60000);
					console.log(`[CookieStorage] ✓ Loaded ${cookies.length} cookies for ${email} (age: ${ageMinutes} minutes)`);
				} else {
					console.log(`[CookieStorage] ✓ Loaded ${cookies.length} cookies for ${email}`);
				}
				
				return cookies;
			}
		} catch (error) {
			console.log(`[CookieStorage] ✗ Failed to load cookies for ${email}:`, error);
		}

		console.log(`[CookieStorage] ℹ No cookies found for ${email}`);
		return [];
	}

	/**
	 * Delete cookies for a specific email
	 */
	deleteCookies(email: string): void {
		const filePath = this.getCookieFilePath(email);

		try {
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
				this.index.delete(email);
				this.saveIndex();
				console.log(`[CookieStorage] ✓ Deleted cookies for ${email}`);
			} else {
				console.log(`[CookieStorage] ℹ No cookies to delete for ${email}`);
			}
		} catch (error) {
			console.log(`[CookieStorage] ✗ Failed to delete cookies for ${email}:`, error);
		}
	}

	/**
	 * Get all stored emails
	 */
	getAllEmails(): string[] {
		return Array.from(this.index.keys());
	}

	/**
	 * Clean up old cookies (older than specified days)
	 */
	cleanupOldCookies(daysOld: number = 30): void {
		const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
		let cleanedCount = 0;

		for (const [email, entry] of this.index.entries()) {
			if (entry.updatedAt < cutoffTime) {
				this.deleteCookies(email);
				cleanedCount++;
			}
		}

		if (cleanedCount > 0) {
			console.log(`[CookieStorage] ✓ Cleaned up ${cleanedCount} old cookie entries`);
		}
	}

	/**
	 * Get storage stats
	 */
	getStats(): { totalEntries: number; storageSizeKB: number } {
		let totalSize = 0;

		try {
			// Get size of all cookie files
			for (const email of this.index.keys()) {
				const filePath = this.getCookieFilePath(email);
				if (fs.existsSync(filePath)) {
					const stats = fs.statSync(filePath);
					totalSize += stats.size;
				}
			}

			// Add index file size
			if (fs.existsSync(this.indexPath)) {
				const indexStats = fs.statSync(this.indexPath);
				totalSize += indexStats.size;
			}
		} catch {
			// Ignore errors getting file sizes
		}

		return {
			totalEntries: this.index.size,
			storageSizeKB: Math.round(totalSize / 1024),
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
