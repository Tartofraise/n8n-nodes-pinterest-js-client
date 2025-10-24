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
		'n8n-nodes-base/node-param-display-name-miscased': 'error',
		'n8n-nodes-base/node-param-description-miscased': 'error',
		'n8n-nodes-base/node-param-default-missing': 'error',
		'n8n-nodes-base/node-param-placeholder-miscased': 'error',
		'n8n-nodes-base/node-param-description-missing-final-period': 'error',
		'n8n-nodes-base/node-param-description-wrong-for-dynamic-options': 'error',
	},
};


