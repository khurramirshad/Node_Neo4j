const neo4j = require('neo4j-driver');
const URI = 'bolt://localhost:7687';
const USER = 'neo4j';
const PASSWORD = '12345678';

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

async function fetchtreeData() {
    const session = driver.session();
    try {
        const result = await session.run('MATCH (n)-[r]->(m) RETURN n, r, m');
        
        const nodes = {};
        const relationships = [];

        result.records.forEach(record => {
            const n = record.get('n');
            const m = record.get('m');
            const r = record.get('r');

            if (!nodes[n.identity.low]) {
                nodes[n.identity.low] = {
                    id: n.identity.low,
                    labels: n.labels,
                    properties: n.properties,
                    children: []
                };
            }

            if (!nodes[m.identity.low]) {
                nodes[m.identity.low] = {
                    id: m.identity.low,
                    labels: m.labels,
                    properties: m.properties,
                    children: []
                };
            }

            nodes[n.identity.low].children.push(nodes[m.identity.low]);
            relationships.push({
                startNode: n.identity.low,
                endNode: m.identity.low,
                type: r.type,
                properties: r.properties
            });
        });

        // Find the root node
        const childIds = new Set(Object.values(nodes).flatMap(node => node.children.map(child => child.id)));
        const rootNode = Object.values(nodes).find(node => !childIds.has(node.id));

        const treeData = {
            rootNode,
            nodes: Object.values(nodes),
            relationships
        };

        console.log(treeData);
        return treeData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error after logging it
    } finally {
        await session.close();
    }
}

// Ensure the driver is closed when the application exits
process.on('exit', async () => {
    await driver.close();
});

module.exports = fetchtreeData;