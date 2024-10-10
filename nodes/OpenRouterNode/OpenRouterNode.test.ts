import { OpenRouterNode } from './OpenRouterNode.node';
import { INodeType } from 'n8n-workflow';

describe('OpenRouterNode', () => {
  let openRouterNode: INodeType;

  beforeEach(() => {
    openRouterNode = new OpenRouterNode();
  });

  it('should have the correct properties', () => {
    expect(openRouterNode.description.displayName).toBe('OpenRouter');
    expect(openRouterNode.description.name).toBe('openRouterNode');
    expect(openRouterNode.description.group).toEqual(['transform']);
    expect(openRouterNode.description.version).toBe(1);
  });

  it('should have the correct operations', () => {
    const operations = openRouterNode.description.properties.find(
      (prop) => prop.name === 'operation'
    );
    expect(operations).toBeDefined();
    expect(operations?.options).toContainEqual({
      name: 'Chat Completion',
      value: 'chatCompletion',
      description: 'Create a chat completion',
    });
  });

  it('should have the correct credentials', () => {
    expect(openRouterNode.description.credentials).toContainEqual({
      name: 'openRouterApi',
      required: true,
    });
  });
});
