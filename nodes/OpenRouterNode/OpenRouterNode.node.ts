import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	IHttpRequestOptions,
	NodeApiError,
	NodeOperationError,
	JsonObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
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
						action: 'Create a chat completion',
					},
				],
				default: 'chatCompletion',
				noDataExpression: true,
			},
			{
				displayName: 'Model Name or ID',
				name: 'model',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getModels',
				},
				default: '',
				description: 'The model to use for the completion. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 2,
							numberStepSize: 0.1,
						},
						default: 1,
						description: 'Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.',
					},
					{
						displayName: 'Max Tokens',
						name: 'max_tokens',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 16,
						description: 'The maximum number of tokens to generate in the completion',
					},
					{
						displayName: 'Stream',
						name: 'stream',
						type: 'boolean',
						default: false,
						description: 'Whether to stream back partial progress. If set, tokens will be sent as data-only server-sent events as they become available.',
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			async getModels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('openRouterApi');
				const requestOptions: IHttpRequestOptions = {
					method: 'GET',
					url: 'https://openrouter.ai/api/v1/models',
					headers: {
						'Authorization': `Bearer ${credentials.apiKey}`,
					},
				};

				try {
					const response = await this.helpers.request(requestOptions);
					const models = response.data as IDataObject[];
					return models.map((model) => ({
						name: model.name as string,
						value: model.id as string,
					}));
				} catch (error) {
					throw new NodeOperationError(this.getNode(), 'Failed to load models from OpenRouter API');
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const model = this.getNodeParameter('model', i) as string;
				const messagesInput = this.getNodeParameter('messages.messagesValues', i, []) as Array<{
					role: string;
					content: string;
				}>;
				const options = this.getNodeParameter('options', i, {}) as IDataObject;

				if (operation === 'chatCompletion') {
					// Input validation
					if (messagesInput.length === 0) {
						throw new NodeOperationError(this.getNode(), 'At least one message is required.');
					}

					const credentials = await this.getCredentials('openRouterApi');

					const body: IDataObject = {
						model,
						messages: messagesInput,
						...options,
					};

					const requestOptions: IHttpRequestOptions = {
						method: 'POST',
						url: 'https://openrouter.ai/api/v1/chat/completions',
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Content-Type': 'application/json',
						},
						body,
						json: true,
					};

					try {
						if (options.stream) {
							// For streaming, we'll use the raw response
							requestOptions.json = false;
							requestOptions.encoding = 'text';

							const response = await this.helpers.request(requestOptions);
							const chunks = (response as string).split('\n\n').filter((chunk: string) => chunk.trim() !== '');
							const parsedChunks = chunks.map((chunk: string) => {
								const jsonStr = chunk.replace('data: ', '');
								return JSON.parse(jsonStr);
							});
							returnData.push({ json: { streamedResponse: parsedChunks } });
						} else {
							const response = await this.helpers.request(requestOptions);
							returnData.push({ json: response as IDataObject });
						}
					} catch (error) {
						if (error instanceof Error) {
							const apiError = error as Error & { response?: { data?: JsonObject } };
							if (apiError.response && apiError.response.data) {
								throw new NodeApiError(this.getNode(), apiError.response.data);
							}
						}
						throw error;
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error instanceof Error ? error.message : 'An unknown error occurred' } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
