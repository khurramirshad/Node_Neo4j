fetch('/data1')
  .then(response => response.json())
  .then(data => {
      const dataDiv = document.getElementById('data');
      dataDiv.innerHTML = JSON.stringify(data);
  })
  .catch(error => console.error('Error fetching data:', error));


