import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { LogLevel, PinterestClient } from 'pinterest-js-client';

export class Pinterest implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pinterest',
		name: 'pinterest',
		icon: 'file:pinterest.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Pinterest API using pinterest-js-client',
		defaults: {
			name: 'Pinterest',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'pinterestApi',
				required: true,
			},
		],
		properties: [
			// Resource Selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Pin',
						value: 'pin',
					},
					{
						name: 'Board',
						value: 'board',
					},
					{
						name: 'User',
						value: 'user',
					},
					{
						name: 'Search',
						value: 'search',
					},
				],
				default: 'pin',
			},

			// ===================================
			// BROWSER OPTIONS
			// ===================================
			{
				displayName: 'Slowmo (Ms)',
				name: 'slowMo',
				type: 'number',
				typeOptions: {
					minValue: 0,
				},
				default: 0,
				description: 'Slows down browser actions by specified milliseconds for more human-like behavior. 0 = fast typing (default).',
			},
			{
				displayName: 'Timeout (Ms)',
				name: 'timeout',
				type: 'number',
				typeOptions: {
					minValue: 1000,
				},
				default: 30000,
				description: 'Maximum time in milliseconds to wait for browser operations',
			},
			{
				displayName: 'Viewport Width',
				name: 'viewportWidth',
				type: 'number',
				typeOptions: {
					minValue: 800,
				},
				default: 1920,
				description: 'Browser viewport width in pixels',
			},
			{
				displayName: 'Viewport Height',
				name: 'viewportHeight',
				type: 'number',
				typeOptions: {
					minValue: 600,
				},
				default: 1080,
				description: 'Browser viewport height in pixels',
			},

			// ===================================
			// PIN OPERATIONS
			// ===================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['pin'],
					},
				},
				options: [
					{
						name: 'Comment',
						value: 'comment',
						description: 'Comment on a pin',
						action: 'Comment on a pin',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new pin',
						action: 'Create a pin',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a pin',
						action: 'Delete a pin',
					},
					{
						name: 'Like',
						value: 'like',
						description: 'Like a pin',
						action: 'Like a pin',
					},
					{
						name: 'Repin',
						value: 'repin',
						description: 'Save/repin a pin to a board',
						action: 'Repin a pin',
					},
				],
				default: 'create',
			},

			// Pin: Create
			{
				displayName: 'Image Source',
				name: 'imageSource',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['create'],
					},
				},
				options: [
					{
						name: 'URL',
						value: 'url',
					},
					{
						name: 'File Path',
						value: 'file',
					},
				],
				default: 'url',
				description: 'Whether to use image URL or local file path',
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['create'],
						imageSource: ['url'],
					},
				},
				default: '',
				required: true,
				description: 'URL of the image to pin',
			},
			{
				displayName: 'Image File Path',
				name: 'imageFile',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['create'],
						imageSource: ['file'],
					},
				},
				default: '',
				required: true,
				description: 'Local path to the image file',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['create'],
					},
				},
				default: '',
				required: true,
				description: 'Title of the pin',
			},
			{
				displayName: 'Board Name',
				name: 'boardName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['create', 'repin'],
					},
				},
				default: '',
				description: 'Name of the board to pin to',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Description of the pin',
			},
			{
				displayName: 'Link',
				name: 'link',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Destination link for the pin',
			},
			{
				displayName: 'Alt Text',
				name: 'altText',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Alternative text for the image',
			},

			// Pin: Repin, Like, Comment, Delete
			{
				displayName: 'Pin URL',
				name: 'pinUrl',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['repin', 'like', 'comment', 'delete'],
					},
				},
				default: '',
				required: true,
				description: 'URL of the pin',
			},
			{
				displayName: 'Comment Text',
				name: 'commentText',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['comment'],
					},
				},
				default: '',
				required: true,
				description: 'Comment to post on the pin',
			},

			// ===================================
			// BOARD OPERATIONS
			// ===================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['board'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new board',
						action: 'Create a board',
					},
					{
						name: 'Get Pins',
						value: 'getPins',
						description: 'Get pins from a board',
						action: 'Get pins from a board',
					},
					{
						name: 'Get User Boards',
						value: 'getUserBoards',
						description: "Get a user's boards",
						action: 'Get a user s boards',
					},
					{
						name: 'Follow',
						value: 'follow',
						description: 'Follow a board',
						action: 'Follow a board',
					},
				],
				default: 'create',
			},

			// Board: Create
			{
				displayName: 'Board Name',
				name: 'boardName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['board'],
						operation: ['create'],
					},
				},
				default: '',
				required: true,
				description: 'Name of the board',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				displayOptions: {
					show: {
						resource: ['board'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Description of the board',
			},
			{
				displayName: 'Privacy',
				name: 'privacy',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['board'],
						operation: ['create'],
					},
				},
				options: [
					{
						name: 'Public',
						value: 'public',
					},
					{
						name: 'Private',
						value: 'private',
					},
					{
						name: 'Protected',
						value: 'protected',
					},
				],
				default: 'public',
				description: 'Privacy setting for the board',
			},

			// Board: Get Pins
			{
				displayName: 'Board URL',
				name: 'boardUrl',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['board'],
						operation: ['getPins', 'follow'],
					},
				},
				default: '',
				required: true,
				description: 'URL of the board',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				displayOptions: {
					show: {
						resource: ['board'],
						operation: ['getPins'],
					},
				},
				default: 50,
				description: 'Max number of results to return',
			},

			// Board: Get User Boards
			{
				displayName: 'Username',
				name: 'username',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['board'],
						operation: ['getUserBoards'],
					},
				},
				default: '',
				required: true,
				description: 'Pinterest username',
			},

			// ===================================
			// USER OPERATIONS
			// ===================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['user'],
					},
				},
				options: [
					{
						name: 'Follow',
						value: 'follow',
						description: 'Follow a user',
						action: 'Follow a user',
					},
					{
						name: 'Unfollow',
						value: 'unfollow',
						description: 'Unfollow a user',
						action: 'Unfollow a user',
					},
					{
						name: 'Get Profile',
						value: 'getProfile',
						description: 'Get user profile information',
						action: 'Get user profile',
					},
				],
				default: 'follow',
			},

			// User: All Operations
			{
				displayName: 'Username',
				name: 'username',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['user'],
					},
				},
				default: '',
				required: true,
				description: 'Pinterest username',
			},

			// ===================================
			// SEARCH OPERATIONS
			// ===================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['search'],
					},
				},
				options: [
					{
						name: 'Search',
						value: 'search',
						description: 'Search for pins, boards, or users',
						action: 'Search pinterest',
					},
				],
				default: 'search',
			},

			// Search: Query
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['search'],
					},
				},
				default: '',
				required: true,
				description: 'Search query',
			},
			{
				displayName: 'Scope',
				name: 'scope',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['search'],
					},
				},
				options: [
					{
						name: 'Pins',
						value: 'pins',
					},
					{
						name: 'Boards',
						value: 'boards',
					},
					{
						name: 'People',
						value: 'people',
					},
				],
				default: 'pins',
				description: 'What to search for',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['search'],
					},
				},
				default: 50,
				description: 'Max number of results to return',
			},
		],
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('pinterestApi');

		// Get workflow static data for persistent cookie storage
		// Using 'global' scope allows cookies to be shared across ALL workflows and nodes
		// that use the same credentials, avoiding redundant logins across the entire n8n instance
		// Key by email to ensure different credential sets remain isolated
		const workflowStaticData = this.getWorkflowStaticData('global');
		const cookieStorageKey = `pinterest_cookies_${credentials.email}`;

		// Load cookies from workflow static data if available
		let storedCookies: unknown[] = [];
		if (workflowStaticData[cookieStorageKey]) {
			try {
				storedCookies = JSON.parse(workflowStaticData[cookieStorageKey] as string);
				console.log(`[Pinterest n8n] ✓ Loaded ${storedCookies.length} cookies from global storage (key: ${cookieStorageKey})`);
			} catch (error) {
				// Invalid cookie data, start fresh
				console.log(`[Pinterest n8n] ✗ Failed to parse stored cookies (key: ${cookieStorageKey}), starting fresh`);
				storedCookies = [];
			}
		} else {
			console.log(`[Pinterest n8n] ℹ No stored cookies found (key: ${cookieStorageKey}), will need to login`);
		}

		// Handle n8n's special blank value placeholder for password field
		// n8n uses this placeholder when a password field is cleared
		const password = credentials.password as string;
		const isPasswordBlank = password?.startsWith('__n8n_BLANK_VALUE_');
		const actualPassword = isPasswordBlank ? '' : password;

		// Log password status (without logging the actual password for security)
		if (isPasswordBlank) {
			console.log('[Pinterest] Password field contains n8n blank placeholder - converting to empty string');
		} else if (actualPassword && actualPassword.length > 0) {
			console.log(`[Pinterest] Password provided (length: ${actualPassword.length} chars) - will be used for login if needed`);
		} else {
			console.log('[Pinterest] No password provided - will rely on cookies only');
		}

		// Get browser configuration parameters (using first item as they're node-level settings)
		const slowMo = this.getNodeParameter('slowMo', 0, 0) as number;
		const timeout = this.getNodeParameter('timeout', 0, 30000) as number;
		const viewportWidth = this.getNodeParameter('viewportWidth', 0, 1920) as number;
		const viewportHeight = this.getNodeParameter('viewportHeight', 0, 1080) as number;

		// Initialize Pinterest client with cookie management
		const client = new PinterestClient({
			email: credentials.email as string,
			password: actualPassword,
			headless: credentials.headless as boolean,
			useFingerprintSuite: credentials.useFingerprintSuite as boolean,
			cookies: storedCookies,
			disableFileCookies: true,  // Don't use file-based storage
			onCookiesUpdate: async (cookies: unknown[]) => {
				// Save cookies to workflow static data keyed by credential email
				// This allows nodes with the same credentials to share the session
				// while keeping different credential sets isolated
				console.log(`[Pinterest n8n] 💾 Saving ${cookies.length} cookies to global storage (key: ${cookieStorageKey})`);
				workflowStaticData[cookieStorageKey] = JSON.stringify(cookies);
				console.log(`[Pinterest n8n] ✓ Cookies saved successfully to global storage`);
			},
			proxy: credentials.proxyServer
				? {
					server: credentials.proxyServer as string,
					username: credentials.proxyUsername as string,
					password: credentials.proxyPassword as string,
				}
				: undefined,
			slowMo,
			timeout,
			viewport: {
				width: viewportWidth,
				height: viewportHeight,
			},
			logLevel: LogLevel.DEBUG,
		});

		try {
			// Initialize and login
			console.log(`[Pinterest n8n] 🔄 Initializing Pinterest client with ${storedCookies.length} cookies...`);
			const isLoggedIn = await client.init();
			if (!isLoggedIn) {
				console.log(`[Pinterest n8n] 🔐 Stored cookies didn't work, performing fresh login...`);
				const loginSuccess = await client.login();
				if (!loginSuccess) {
					throw new NodeOperationError(
						this.getNode(),
						'Failed to login to Pinterest. Please check your credentials.',
					);
				}
				console.log(`[Pinterest n8n] ✓ Fresh login successful`);
			} else {
				console.log(`[Pinterest n8n] ✓ Successfully authenticated using stored cookies`);
			}

			for (let i = 0; i < items.length; i++) {
				try {
					const resource = this.getNodeParameter('resource', i) as string;
					const operation = this.getNodeParameter('operation', i) as string;

					let responseData: unknown;

					if (resource === 'pin') {
						if (operation === 'create') {
							const imageSource = this.getNodeParameter('imageSource', i) as string;
							const title = this.getNodeParameter('title', i) as string;
							const boardName = this.getNodeParameter('boardName', i, '') as string;
							const description = this.getNodeParameter('description', i, '') as string;
							const link = this.getNodeParameter('link', i, '') as string;
							const altText = this.getNodeParameter('altText', i, '') as string;

							const pinData: Record<string, string> = {
								title,
								description,
								link,
								boardName,
								altText,
							};

							if (imageSource === 'url') {
								pinData.imageUrl = this.getNodeParameter('imageUrl', i) as string;
							} else {
								pinData.imageFile = this.getNodeParameter('imageFile', i) as string;
							}

							const pinUrl = await client.createPin(pinData as never);
							if (!pinUrl) {
								throw new Error('Failed to create pin or could not retrieve URL');
							}
							responseData = {
								pinUrl: pinUrl,
								message: 'Pin created successfully'
							};
						} else if (operation === 'repin') {
							const pinUrl = this.getNodeParameter('pinUrl', i) as string;
							const boardName = this.getNodeParameter('boardName', i, '') as string;
							responseData = await client.repin(pinUrl, boardName);
						} else if (operation === 'like') {
							const pinUrl = this.getNodeParameter('pinUrl', i) as string;
							responseData = await client.likePin(pinUrl);
						} else if (operation === 'comment') {
							const pinUrl = this.getNodeParameter('pinUrl', i) as string;
							const commentText = this.getNodeParameter('commentText', i) as string;
							responseData = await client.commentOnPin(pinUrl, commentText);
						} else if (operation === 'delete') {
							const pinUrl = this.getNodeParameter('pinUrl', i) as string;
							responseData = await client.deletePin(pinUrl);
						}
					} else if (resource === 'board') {
						if (operation === 'create') {
							const boardName = this.getNodeParameter('boardName', i) as string;
							const description = this.getNodeParameter('description', i, '') as string;
							const privacy = this.getNodeParameter('privacy', i) as
								| 'public'
								| 'private'
								| 'protected';

							responseData = await client.createBoard({
								name: boardName,
								description,
								privacy,
							});
						} else if (operation === 'getPins') {
							const boardUrl = this.getNodeParameter('boardUrl', i) as string;
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = await client.getBoardPins(boardUrl, limit);
						} else if (operation === 'getUserBoards') {
							const username = this.getNodeParameter('username', i) as string;
							responseData = await client.getUserBoards(username);
						} else if (operation === 'follow') {
							const boardUrl = this.getNodeParameter('boardUrl', i) as string;
							responseData = await client.followBoard(boardUrl);
						}
					} else if (resource === 'user') {
						const username = this.getNodeParameter('username', i) as string;

						if (operation === 'follow') {
							responseData = await client.followUser(username);
						} else if (operation === 'unfollow') {
							responseData = await client.unfollowUser(username);
						} else if (operation === 'getProfile') {
							responseData = await client.getUserProfile(username);
						}
					} else if (resource === 'search') {
						if (operation === 'search') {
							const query = this.getNodeParameter('query', i) as string;
							const scope = this.getNodeParameter('scope', i) as 'pins' | 'boards' | 'people';
							const limit = this.getNodeParameter('limit', i) as number;

							responseData = await client.search({
								query,
								scope,
								limit,
							});
						}
					}

					// Format the response
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray(responseData as never),
						{ itemData: { item: i } },
					);

					returnData.push(...executionData);
				} catch (error) {
					if (this.continueOnFail()) {
						const errorMessage = error instanceof Error ? error.message : 'Unknown error';
						const executionData = this.helpers.constructExecutionMetaData(
							this.helpers.returnJsonArray({ success: false, error: errorMessage }),
							{ itemData: { item: i } },
						);
						returnData.push(...executionData);
						continue;
					}
					throw error;
				}
			}

			// Close the browser
			await client.close();

			return [returnData];
		} catch (error) {
			await client.close();
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			throw new NodeOperationError(
				this.getNode(),
				`Pinterest operation failed: ${errorMessage}`,
			);
		}
	}
}

