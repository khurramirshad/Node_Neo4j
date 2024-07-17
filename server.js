const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

const fetchData = require('./data');

app.get('/api/data', async (req, res) => {
  const data = await fetchData();
  //console.log(data.nodes[0].labels);
  res.json(data);
});