const { OpenRouterNode } = require('./dist/nodes/OpenRouterNode/OpenRouterNode.node');
const { OpenRouterApi } = require('./dist/credentials/OpenRouterApi.credentials');

module.exports = {
    nodes: [
        OpenRouterNode
    ],
    credentials: [
        OpenRouterApi
    ],
    version: require('./package.json').version,
};
