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

		// Get workflow static data for persistent cookie storage per workflow
		const workflowStaticData = this.getWorkflowStaticData('node');
		const credentialId = `${credentials.email}`;

		// Load cookies from workflow static data if available
		let storedCookies: unknown[] = [];
		if (workflowStaticData[credentialId]) {
			try {
				storedCookies = JSON.parse(workflowStaticData[credentialId] as string);
			} catch {
				// Invalid cookie data, start fresh
				storedCookies = [];
			}
		}

		// Initialize Pinterest client with cookie management
		const client = new PinterestClient({
			email: credentials.email as string,
			password: credentials.password as string,
			headless: credentials.headless as boolean,
			useFingerprintSuite: credentials.useFingerprintSuite as boolean,
			cookies: storedCookies,
			disableFileCookies: true,  // Don't use file-based storage
			onCookiesUpdate: async (cookies: unknown[]) => {
				// Save cookies to workflow static data
				workflowStaticData[credentialId] = JSON.stringify(cookies);
			},
			proxy: credentials.proxyServer
				? {
					server: credentials.proxyServer as string,
					username: credentials.proxyUsername as string,
					password: credentials.proxyPassword as string,
				}
				: undefined,
			slowMo: 100,                  // Slow down actions by 100ms for more human-like behavior
			timeout: 30000,               // Default timeout of 30 seconds
			viewport: {
				width: 1920,
				height: 1080,
			},
			logLevel: LogLevel.DEBUG,
		});

		try {
			// Initialize and login
			const isLoggedIn = await client.init();
			if (!isLoggedIn) {
				await client.login();
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
							responseData = {
								success: pinUrl !== null,
								pinUrl: pinUrl,
								message: pinUrl ? 'Pin created successfully' : 'Failed to create pin or could not retrieve URL'
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
						this.helpers.returnJsonArray({ success: true, data: responseData as never }),
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

