// ipAddress = the ip of the machine that is hosting the server
const ipAddress = '192.168.16.6';
const port = 8000;

document.getElementById("reportForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    // Get the value of the location input field
    var location = document.getElementById("curlInput").value;

    // Function to handle the response from the HTTP GET request
    function handleResponse(responseText) {
        // Do something with the response, such as updating the UI
        console.log("Response from server:", responseText);
    }

    // Construct the URL with the location query parameter
    var url = `http://${ipAddress}:${port}?args=location=${encodeURIComponent(location)}`;
    console.log(url);

    // Call httpGetAsync with the URL and the handleResponse function as parameters
    httpGetAsync(url, handleResponse);
});

// Function to make an asynchronous HTTP GET request
function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}


document.addEventListener("submit", function() {
    // Function to make the HTTP GET request and update the HTML content
    // Function to make the HTTP GET request and update the HTML content
    function fetchDataAndUpdateHTML() {
        // Make the HTTP GET request
        // Get the value of the location input field
        var location = document.getElementById("curlInput").value;
        fetch(`http://${ipAddress}:${port}?args=location=${encodeURIComponent(location)}`)
            .then(response => response.text())
            .then(data => {
                // Parse the response text to extract the desired information
                var lines = data.split('\n'); // Split the response into lines
                let extractedData = ''; // Initialize an empty string to store extracted data

                // Loop through each line and extract relevant information
                lines.forEach(line => {
                    if (line.startsWith('Location') ||
                        line.startsWith('UV index') ||
                        line.startsWith('Wave Height') ||
                        line.startsWith('Wave Direction') ||
                        line.startsWith('Wave Period')) {
                        extractedData += line + '<br>'; // Add line to extractedData
                    }
                });

                // Update the content of the serverResponse div with the extracted data
                document.getElementById('serverResponse').innerHTML = extractedData;
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }
    function getPlotData() {
        // Clear arrays before fetching new data
        // Make the HTTP GET request
        // Get the value of the location input field
        var location = document.getElementById("curlInput").value;
        fetch(`http://${ipAddress}:${port}?args=fc=7,=location=${encodeURIComponent(location)}`)
            .then(response => response.text())
            .then(data => {
                // Parse the response text to extract the desired information
                var lines = data.split('\n'); // Split the response into lines
                let dates = []; // Initialize an empty array for dates
                let heights = []; // Initialize an empty array for wave heights
                let periods = []; // Initialize an empty array for wave periods
                // Loop through each line and extract relevant information
                lines.forEach(line => {
                    if (line.startsWith('Date')) {
                        var fullDate = line.split(':')[1].trim();
                        var date = fullDate.split(' ')[0]; // Extract the date part only
                        dates.push(date);
                    } else if (line.startsWith('Wave Height')) {
                        var height = parseFloat(line.split(':')[1].trim());
                        heights.push(height);
                    } else if (line.startsWith('Wave Period')) {
                        var period = parseFloat(line.split(':')[1].trim());
                        periods.push(period);
                    }
                });
                // Log the arrays to verify
                console.log('Dates:', dates);
                console.log('Wave Heights:', heights);
                console.log('Wave Periods:', periods);
                plot_graph(dates, heights, periods);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    // Call the function to fetch data and update HTML content when the form is submitted
    fetchDataAndUpdateHTML();
    getPlotData();
});

function plot_graph(dates, heights, periods) {
    var heightPoints = dates.map((date, index) => [date, heights[index]]);
    var periodPoints = dates.map((date, index) => [date, periods[index]]);
  
    var chart = JSC.chart('chartDiv', { 
      debug: true, 
      type: 'line', 
      legend_visible: false, 
      xAxis: { 
        crosshair_enabled: true, 
        scale: { type: 'time' } 
      }, 
      yAxis: { 
        orientation: 'opposite', 
        formatString: 'n2'
      }, 
      defaultSeries: { 
        firstPoint_label_text: '<b>%seriesName</b>', 
        defaultPoint_marker: { 
          type: 'circle', 
          size: 8, 
          fill: 'white', 
          outline: { width: 2, color: 'currentColor' } 
        } 
      }, 
      title_label_text: 'Surf Heights and Periods', 
      series: [ 
        { 
          name: 'Heights', 
          points: heightPoints
        }, 
        { 
          name: 'Periods', 
          points: periodPoints
        } 
      ] 
    }); 

  }
  