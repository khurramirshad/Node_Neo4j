const neo4j = require('neo4j-driver');
const URI = 'bolt://localhost:7687';
const USER = 'neo4j';
const PASSWORD = '12345678';

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

async function fetchChildren(type,id,ent) {
    const session = driver.session();
    try {
        let query;
        if (type === 'Project') {
            query =`MATCH (developer:Developer)-[:WORKS_ON]->(project:Project {ProjectId: '${id}'}) RETURN developer`;;
        } else if (type === 'root') {
            query = `MATCH (developer:Project) RETURN developer LIMIT 1`;
        } else if (type === 'Developer') {
            query = `MATCH (developer:Commit)-[:Commited_BY]->(d:Developer {Name: '${id}'}) RETURN developer`;
        } 
        else if (type === 'Commit') {
            query = `MATCH (developer:Class)-[:Updated_in]->(c:Commit {Name: '${id}'}) RETURN developer`;
        } 
        else if (type === 'Class') {
            query = `MATCH (developer:Method)-[:Modified_In]->(c:Class {Name: '${id}'}) RETURN developer`;
        } 
        else if (type === 'Search') {
            query = `MATCH (developer: ${ent} {Name: '${id}'}) RETURN developer`;
        } 
        else {

            query = `MATCH (developer:Class)-[:Updated_in]->(c:Commit {Name: '60d3474d553f47445c38757ffb75fc6417114223'}) RETURN developer`;
            
        }
        console.log(query);
        const result = await session.run(query);
        console.log("result.records.length",result.records.length);
        if (result.records.length === 0) {
            return {data:[{ERROR:'No records found'}]};
        }else{

        const developers = result.records.map(record => {
            const developer = record.get('developer');
            return {
                id: developer.identity.low,
                labels: developer.labels,
                properties: developer.properties
            };
        });
        return developers;
    }
        //console.log(developers);
       
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