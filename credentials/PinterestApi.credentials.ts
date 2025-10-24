import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

// Credentials are tested by the Pinterest node during execution
// since authentication requires browser-based login with Puppeteer
// eslint-disable-next-line @n8n/community-nodes/credential-test-required
export class PinterestApi implements ICredentialType {
	name = 'pinterestApi';
	displayName = 'Pinterest API';
	documentationUrl = 'https://github.com/Tartofraise/pinterest-js-client';
	icon = 'file:pinterest.svg' as const;
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
}
