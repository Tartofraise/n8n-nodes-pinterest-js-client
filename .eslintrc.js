module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	extends: [
		'plugin:n8n-nodes-base/community',
	],
	rules: {
		'n8n-nodes-base/node-param-display-name-miscased': 'warn',
		'n8n-nodes-base/node-param-description-miscased': 'warn',
		'n8n-nodes-base/node-param-default-missing': 'warn',
		'n8n-nodes-base/node-param-placeholder-miscased': 'warn',
	},
};


