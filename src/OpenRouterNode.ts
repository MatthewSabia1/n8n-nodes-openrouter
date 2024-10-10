import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	IHttpRequestOptions,
} from 'n8n-workflow';

export class OpenRouterNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OpenRouter',
		name: 'openRouterNode',
		icon: 'file:openrouter.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with OpenRouter API',
		defaults: {
			name: 'OpenRouter',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'openRouterApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{
						name: 'Chat Completion',
						value: 'chatCompletion',
						description: 'Create a chat completion',
					},
				],
				default: 'chatCompletion',
				noDataExpression: true,
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: 'openai/gpt-3.5-turbo',
				description: 'The model to use for the completion',
				required: true,
			},
			{
				displayName: 'Messages',
				name: 'messages',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'messagesValues',
						displayName: 'Messages',
						values: [
							{
								displayName: 'Role',
								name: 'role',
								type: 'options',
								options: [
									{
										name: 'System',
										value: 'system',
									},
									{
										name: 'User',
										value: 'user',
									},
									{
										name: 'Assistant',
										value: 'assistant',
									},
								],
								default: 'user',
							},
							{
								displayName: 'Content',
								name: 'content',
								type: 'string',
								default: '',
							},
						],
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const operation = this.getNodeParameter('operation', i) as string;
			const model = this.getNodeParameter('model', i) as string;
			const messagesInput = this.getNodeParameter('messages.messagesValues', i, []) as Array<{
				role: string;
				content: string;
			}>;

			if (operation === 'chatCompletion') {
				const credentials = await this.getCredentials('openRouterApi');
				
				const options: IHttpRequestOptions = {
					method: 'POST',
					url: 'https://openrouter.ai/api/v1/chat/completions',
					headers: {
						'Authorization': `Bearer ${credentials.apiKey}`,
						'Content-Type': 'application/json',
					},
					body: {
						model,
						messages: messagesInput,
					},
					json: true,
				};

				try {
					const response = await this.helpers.request(options);
					returnData.push({ json: response as IDataObject });
				} catch (error: any) {
					if (error.response && typeof error.response === 'object' && error.response !== null) {
						const errorResponse = error.response as { body?: { error?: string } };
						if (errorResponse.body && typeof errorResponse.body.error === 'string') {
							throw new Error(`OpenRouter API request failed: ${errorResponse.body.error}`);
						}
					}
					throw new Error(`OpenRouter API request failed: ${error.message}`);
				}
			}
		}

		return [returnData];
	}
}
