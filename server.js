const express = require('express');
const path = require('path');
const app = express();
const port = 3000;


app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
// Serve static files from node_modules
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));

// Serve the JavaScript file
app.get('/script_d3.js', (req, res) => {
  res.sendFile(path.join(__dirname, '/script_d3.js'));
});
// Serve the JavaScript file
app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, '/style.css'));
});
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

const fetchData = require('./data');
const fetchtreeData = require('./treedata');
const fetchChildren = require('./ChildData');

app.get('/api/data', async (req, res) => {
  const data = await fetchData();
  //console.log(data.nodes[0].labels);
  res.json(data);
});

app.get('/api/treedata', async (req, res) => {
  const data1 = await fetchtreeData();
  // console.log(data1);
  res.json(data1);
});

app.get('/api/ChildData', async (req, res) => {
  const { type } = req.query;  // Receiving query parameter 'type
  const { id } = req.query; 
  const { ent } = req.query; 
  console.log(type);
  const data2 = await fetchChildren(type,id,ent); 
  res.json(data2);
});