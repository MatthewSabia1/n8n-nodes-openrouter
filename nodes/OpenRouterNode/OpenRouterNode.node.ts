import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class OpenRouterNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OpenRouter',
		name: 'openRouterNode',
		icon: 'file:openrouter.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with OpenRouter API',
		defaults: {
			name: 'OpenRouter',
		},
		inputs: '={{["main"]}}',
		outputs: '={{["main"]}}',
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
				noDataExpression: true,
				options: [
					{
						name: 'Chat Completion',
						value: 'chatCompletion',
						description: 'Create a chat completion',
						action: 'Create a chat completion',
					},
				],
				default: 'chatCompletion',
			},
			{
				displayName: 'Model Name or ID',
				name: 'model',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getModels',
				},
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				default: '',
				required: true,
			},
			{
				displayName: 'Messages',
				name: 'messages',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: { messagesValues: [{ role: 'user', content: '' }] },
				options: [
					{
						name: 'messagesValues',
						displayName: 'Message',
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
								description: 'The content of the message',
							},
						],
					},
				],
			},
			// Expose adjustable model parameters
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
				displayName: 'Temperature',
				name: 'temperature',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 2,
					numberStepSize: 0.1,
				},
				default: 1,
				description:
					'Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.',
			},
			{
				displayName: 'Top P',
				name: 'top_p',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.1,
				},
				default: 1,
				description:
					'Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered',
			},
			{
				displayName: 'Frequency Penalty',
				name: 'frequency_penalty',
				type: 'number',
				typeOptions: {
					minValue: -2,
					maxValue: 2,
					numberStepSize: 0.1,
				},
				default: 0,
				description:
					"How much to penalize new tokens based on their existing frequency in the text so far. Decreases the model's likelihood to repeat the same line verbatim.",
			},
			{
				displayName: 'Presence Penalty',
				name: 'presence_penalty',
				type: 'number',
				typeOptions: {
					minValue: -2,
					maxValue: 2,
					numberStepSize: 0.1,
				},
				default: 0,
				description:
					"How much to penalize new tokens based on whether they appear in the text so far. Increases the model's likelihood to talk about new topics.",
			},
			{
				displayName: 'Stream',
				name: 'stream',
				type: 'boolean',
				default: false,
				description:
					'Whether to stream back partial progress. If set, tokens will be sent as data-only server-sent events as they become available.',
			},
		],
	};

	methods = {
		loadOptions: {
			async getModels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('openRouterApi');
				const { apiKey } = credentials as { apiKey: string };

				const requestOptions: IDataObject = {
					method: 'GET',
					url: 'https://openrouter.ai/api/v1/models',
					headers: {
						Authorization: `Bearer ${apiKey}`,
					},
					json: true,
				};

				try {
					const response = await this.helpers.request(requestOptions);
					const models = response as IDataObject[];
					if (!models || !Array.isArray(models)) {
						throw new NodeOperationError(
							this.getNode(),
							'Invalid response format from OpenRouter API',
						);
					}
					return models.map((model) => ({
						name: model.id as string,
						value: model.id as string,
						description: model.description as string,
					}));
				} catch (error) {
					throw new NodeOperationError(
						this.getNode(),
						'Failed to load models from OpenRouter API',
					);
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('openRouterApi');
		const { apiKey } = credentials as { apiKey: string };

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const model = this.getNodeParameter('model', i) as string;
				const messagesInput = (this.getNodeParameter(
					'messages.messagesValues',
					i,
					[],
				) as IDataObject[]).map((message) => ({
					role: message.role,
					content: message.content,
				}));
				const max_tokens = this.getNodeParameter('max_tokens', i) as number;
				const temperature = this.getNodeParameter('temperature', i) as number;
				const top_p = this.getNodeParameter('top_p', i) as number;
				const frequency_penalty = this.getNodeParameter('frequency_penalty', i) as number;
				const presence_penalty = this.getNodeParameter('presence_penalty', i) as number;
				const stream = this.getNodeParameter('stream', i) as boolean;

				if (operation === 'chatCompletion') {
					if (messagesInput.length === 0) {
						throw new NodeOperationError(this.getNode(), 'At least one message is required');
					}

					const body: IDataObject = {
						model,
						messages: messagesInput,
						max_tokens,
						temperature,
						top_p,
						frequency_penalty,
						presence_penalty,
						stream,
					};

					const requestOptions: IDataObject = {
						method: 'POST',
						url: 'https://openrouter.ai/api/v1/chat/completions',
						headers: {
							Authorization: `Bearer ${apiKey}`,
							'Content-Type': 'application/json',
						},
						body,
						json: true,
					};

					if (stream) {
						requestOptions.encoding = 'utf8';
						requestOptions.json = false;

						const response = await this.helpers.request(requestOptions);
						const chunks = (response as string)
							.split('\n\n')
							.filter((chunk: string) => chunk.trim() !== '');
						const parsedChunks = chunks.map((chunk: string) => {
							const jsonStr = chunk.replace('data: ', '');
							return JSON.parse(jsonStr);
						});
						returnData.push({ json: { streamedResponse: parsedChunks } });
					} else {
						const response = await this.helpers.request(requestOptions);
						returnData.push({ json: response as IDataObject });
					}
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`The operation "${operation}" is not supported`,
					);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : 'Unknown error occurred',
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
