const { Credentials, Node } = require('n8n-core');

// Load all credentials
const credentials = {};
const credentialFiles = require.context('./credentials', false, /\.credentials\.ts$/);
credentialFiles.keys().forEach((credentialFile) => {
    const credentialClass = credentialFiles(credentialFile).default;
    const instance = new credentialClass();
    credentials[instance.name] = instance;
});

// Load all nodes
const nodes = {};
const nodeFiles = require.context('./nodes', false, /\.node\.ts$/);
nodeFiles.keys().forEach((nodeFile) => {
    const nodeClass = nodeFiles(nodeFile).default;
    const instance = new nodeClass();
    nodes[instance.name] = instance;
});


module.exports = {
    credentials,
    nodes,
    // eslint-disable-next-line global-require
    version: require('./package.json').version,
};
