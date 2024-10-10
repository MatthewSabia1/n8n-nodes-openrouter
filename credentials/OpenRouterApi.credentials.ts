import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class OpenRouterApi implements ICredentialType {
	name = 'openRouterApi';
	displayName = 'OpenRouter API';
	documentationUrl = 'https://openrouter.ai/docs#authentication';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The OpenRouter API key',
		},
	];
}
