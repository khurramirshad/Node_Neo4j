fetch('/data2')
  .then(response => response.json())
  .then(data => {
      //const dataDiv = document.getElementById('data');
      //dataDiv.innerHTML = JSON.stringify(data);
      const nodes = [];
      const links = [];

      data.records.forEach(record => {
        nodes.push(record.get('n').properties);
        nodes.push(record.get('m').properties);
        links.push({
          source: record.get('n').identity.low,
          target: record.get('m').identity.low,
          type: record.get('r').type
        });
      });

      visualizeGraph({ nodes, links });
  })
  .catch(error => console.error('Error fetching data:', error));