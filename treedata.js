const neo4j = require('neo4j-driver');
const URI = 'bolt://localhost:7687';
const USER = 'neo4j';
const PASSWORD = '12345678';

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

async function fetchRootNode() {
    const session = driver.session();
    try {
       const result = await session.run('MATCH (root:Project) RETURN root LIMIT 1');
       // const result = await session.run('MATCH (n)-[r]->(m) RETURN n, r, m');

        if (result.records.length === 0) {
            throw new Error('No records found');
        }
        
        const rootRecord = result.records[0];
        const root = rootRecord.get('root');

        if (!root) {
            throw new Error('Root node is undefined');
        }

        const rootNode = {
            id: root.identity.low,
            labels: root.labels,
            properties: root.properties
        };

        console.log(rootNode);
        return rootNode;
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

module.exports = fetchRootNode;