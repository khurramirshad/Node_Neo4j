const neo4j = require('neo4j-driver');
const URI = 'bolt://localhost:7687';
const USER = 'neo4j';
const PASSWORD = '12345678';

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

//const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '12345678'));
const session = driver.session();

async function fetchData() {
    const result = await session.run('MATCH (n)-[r]->(m) RETURN n, r, m');
    const nodeSet = new Set();
const nodes = [];
const links = [];

result.records.forEach(record => {
    if (typeof record == 'object') {
        const n = record.get('n');
        const m = record.get('m');
        const r = record.get('r');

        if (!nodeSet.has(n.identity.low)) {
            nodeSet.add(n.identity.low);
            nodes.push({
                id: n.identity.low,
                labels: n.labels,
                properties: n.properties
            });
        }

        if (!nodeSet.has(m.identity.low)) {
            nodeSet.add(m.identity.low);
            nodes.push({
                id: m.identity.low,
                labels: m.labels,
                properties: m.properties
            });
        }

        links.push({
            source: n.identity.low,
            target: m.identity.low,
            type: r.type
        });
    }
});

  await session.close();
  await driver.close();

  return { nodes, links };
}

module.exports = fetchData;