const neo4j = require('neo4j-driver');
const URI = 'bolt://localhost:7687';
const USER = 'neo4j';
const PASSWORD = '12345678';

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

async function fetchDevelopers() {
    const session = driver.session();
    try {
        const result = await session.run("MATCH (developer:Developer)-[:WORKS_ON]->(project:Project {ProjectId: 'FoodDeliveryProject'}) RETURN developer");

        if (result.records.length === 0) {
            throw new Error('No records found');
        }

        const developers = result.records.map(record => {
            const developer = record.get('developer');
            return {
                id: developer.identity.low,
                labels: developer.labels,
                properties: developer.properties
            };
        });

        console.log(developers);
        return developers;
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

module.exports = fetchDevelopers;