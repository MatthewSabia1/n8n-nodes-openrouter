# n8n-nodes-openrouter

This is an n8n community node. It lets you use OpenRouter in your n8n workflows.

[OpenRouter](https://openrouter.ai/) is a unified API for AI models, allowing you to access various language models through a single interface.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  
[Version history](#version-history)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

- Chat Completion: Create a chat completion using OpenRouter API

## Credentials

To use this node, you'll need to create an account on OpenRouter and obtain an API key.

1. Sign up for an account at [OpenRouter](https://openrouter.ai/)
2. Navigate to the API Keys section
3. Generate a new API key
4. Use this API key in the OpenRouter API credentials in n8n

## Compatibility

This node has been developed and tested with n8n version 0.125.0. It should work with any newer version as well.

## Usage

To use this node, you need to have n8n installed. If you haven't done that yet, check out the [n8n installation guide](https://docs.n8n.io/hosting/).

After installing this node, you can use it like any other n8n node. Add it to your workflow and configure it according to your needs.

### Chat Completion

1. Select the 'Chat Completion' operation
2. Choose the AI model from the dropdown list of available OpenRouter models
3. Add your messages in the 'Messages' section
4. Configure additional options like temperature and max tokens if needed
5. Enable streaming if you want to receive partial responses

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [OpenRouter API documentation](https://openrouter.ai/docs)

## Version history

0.2.0 - Added support for streaming responses, improved error handling, added additional options (temperature, max tokens), and implemented a dropdown selector for OpenRouter models
0.1.0 - Initial release

## Development

If you want to contribute to this node, follow these steps:

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the node: `npm run build`
4. Run tests: `npm test`

We welcome contributions! Please submit a pull request with your changes.
