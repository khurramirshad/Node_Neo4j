const neo4j = require('neo4j-driver');
const URI = 'bolt://localhost:7687';
const USER = 'neo4j';
const PASSWORD = '12345678';

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

async function fetchChildren(type) {
    const session = driver.session();
    try {
        let query;
        if (type === 'FoodDeliveryProject') {
            query = "MATCH (developer:Developer)-[:WORKS_ON]->(project:Project {ProjectId: 'FoodDeliveryProject'}) RETURN developer";
        } else if (type === 'root') {
            query = "MATCH (developer:Project) RETURN developer LIMIT 1";
        } else if (type === 'Developer') {
            query = "MATCH (developer:Commit)-[:WORKS_ON]->(project:Project) RETURN developer";
        } 
        else {
            query = "MATCH (developer:Commit)-[:Commited_BY]->(d:Developer {Name: 'khuram.irshad@gmail.com'}) RETURN developer";
            
        }
        console.log(query);
        const result = await session.run(query);

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

        //console.log(developers);
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

module.exports = fetchChildren;