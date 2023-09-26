const readline = require('readline');
const fs = require('fs');
const net = require('net');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let filePath, startDate, endDate, startTime, endTime, port;
let startDateEpoch, endDateEpoch;

function promptForFilePath() {
    rl.question('Enter the file path to a text file: ', (answer) => {
      filePath = answer;
      promptForDate();
    });
  }

function promptForDate() {
  rl.question('Enter a date in MM/DD/YY format: ', (answer) => {
    startDate = answer;
    promptForEndDate(); // Changed to prompt for end date
  });
}

function promptForEndDate() {
  rl.question('Enter an end date in MM/DD/YY format: ', (answer) => {
    endDate = answer;
    promptForStartTime();
  });
}

function promptForStartTime() {
  rl.question('Enter a start time in 24-hour format (HH:mm:ss): ', (answer) => {
    startTime = answer;
    promptForEndTime();
  });
}

function promptForEndTime() {
  rl.question('Enter an end time in 24-hour format (HH:mm:ss): ', (answer) => {
    endTime = answer;
    promptForPort();
  });
}

function promptForPort() {
  rl.question('Enter a port number for the TCP server: ', (answer) => {
    port = parseInt(answer);

    // Calculate start and end date in epoch format for comparison
    startDateEpoch = new Date(startDate).getTime();
    endDateEpoch = new Date(endDate).getTime();

    createTCPServer();
  });
}

function createTCPServer() {
    const server = net.createServer((client) => {
      const fileStream = fs.createReadStream(filePath);
      let foundMatchingLines = false;
  
      fileStream.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
          if (line.startsWith('aa')) {
            const timestamp = line.substr(2, 12); // Extract timestamp
  
            // Parse the timestamp into separate components
            const year = parseInt(timestamp.substr(0, 2)) + 2000; // Assuming 20xx format
            const month = parseInt(timestamp.substr(2, 2));
            const day = parseInt(timestamp.substr(4, 2));
            const hour = parseInt(timestamp.substr(6, 2));
            const minute = parseInt(timestamp.substr(8, 2));
            const second = parseInt(timestamp.substr(10, 2));
  
            const lineDate = new Date(year, month - 1, day, hour, minute, second);
            const startTimeDate = new Date(startDate + ' ' + startTime);
            const endTimeDate = new Date(endDate + ' ' + endTime);
  
            if (
              lineDate >= startTimeDate &&
              lineDate <= endTimeDate
            ) {
              client.write(`${line}\r\n`);
              foundMatchingLines = true;
            }
          }
        }
      });
  
      fileStream.on('end', () => {
        client.end();
  
        if (foundMatchingLines) {
          console.log('Matching lines were found and transmitted.');
        } else {
          console.log('No matching lines were found.');
        }
      });
    });
  
    server.listen(port, () => {
      console.log(`TCP server listening on port ${port}`);
    });
  }
  

promptForFilePath();
