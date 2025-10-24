import {
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
	IAuthenticateGeneric,
} from 'n8n-workflow';

export class PinterestApi implements ICredentialType {
	name = 'pinterestApi';
	displayName = 'Pinterest API';
	documentationUrl = 'https://github.com/Tartofraise/pinterest-js-client';
	icon = 'file:pinterest.svg' as const;
	
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://www.pinterest.com',
			url: '/',
		},
	};
	
	properties: INodeProperties[] = [
		{
			displayName: 'Email',
			name: 'email',
			type: 'string',
			placeholder: 'name@email.com',
			default: '',
			required: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
		{
			displayName: 'Cookies (Internal)',
			name: 'cookies',
			type: 'hidden',
			default: '',
			description: 'Session cookies stored automatically (do not edit manually)',
		},
		{
			displayName: 'Headless Mode',
			name: 'headless',
			type: 'boolean',
			default: true,
			description: 'Whether to run the browser in headless mode',
		},
		{
			displayName: 'Use Fingerprint Suite',
			name: 'useFingerprintSuite',
			type: 'boolean',
			default: true,
			description: 'Whether to use fingerprint suite for stealth browsing',
		},
		{
			displayName: 'Proxy Server',
			name: 'proxyServer',
			type: 'string',
			default: '',
			placeholder: 'http://proxy.example.com:8080',
			description: 'Optional: Proxy server URL',
		},
		{
			displayName: 'Proxy Username',
			name: 'proxyUsername',
			type: 'string',
			default: '',
			description: 'Optional: Proxy authentication username',
		},
		{
			displayName: 'Proxy Password',
			name: 'proxyPassword',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Optional: Proxy authentication password',
		},
	];

	// Optional: Test credentials
	// authenticate: IAuthenticateGeneric = {
	// 	type: 'generic',
	// 	properties: {},
	// };

	// test: ICredentialTestRequest = {
	// 	request: {
	// 		baseURL: 'https://www.pinterest.com',
	// 		url: '/',
	// 	},
	// };
}

