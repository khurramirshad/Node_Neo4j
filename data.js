const neo4j = require('neo4j-driver');
const URI = 'bolt://localhost:7687';
const USER = 'neo4j';
const PASSWORD = '12345678';

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

//const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '12345678'));
const session = driver.session();

async function fetchData() {
  const result = await session.run('MATCH (n)-[r]->(m) RETURN n, r, m');
  const nodes = [];
  const links = [];

  result.records.forEach(record => {
    if (typeof record == 'object') {
        nodes.push(record.get('n').properties);
        nodes.push(record.get('m').properties);
       // if (record.get('m').identity.low !== 0) {
        links.push({
           source: record.get('n').identity.low,
           target: record.get('m').identity.low,
           type: record.get('r').type
        });
   // }       
    }
  });

  await session.close();
  await driver.close();

  return { nodes, links };
}

module.exports = fetchData;