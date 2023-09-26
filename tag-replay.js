const readline = require('readline');
const fs = require('fs');
const net = require('net');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let filePath, port, startDate, endDate;

// Establish a TCP server at the specified port
const server = net.createServer((client) => {
  // Prompt the user for the file path to a text file
  rl.question('Enter the file path to the text file: ', (file) => {
    filePath = file;

    // Prompt the user for a date in MM/DD/YY format
    client.write('Enter a date (MM/DD/YY): ');

    client.on('data', (data) => {
      const input = data.toString().trim();

      if (!startDate) {
        startDate = new Date(input);
        client.write('Enter a start time (HH:mm:ss): ');
      } else if (!endDate) {
        endDate = new Date(input);
        client.write('Enter an end time (HH:mm:ss): ');
      } else {
        client.write('Invalid input. Connection closing...\r\n');
        client.end();
      }
    });

    client.on('end', () => {
      if (startDate && endDate) {
        readAndFilterFile(filePath, startDate, endDate, client);
      }
    });
  });
});

server.listen(3000, () => {
  console.log('TCP server listening on port 3000');
});

// Function to read and filter the text file
function readAndFilterFile(filePath, startDate, endDate, client) {
  const fileStream = fs.createReadStream(filePath);

  fileStream.on('data', (data) => {
    const lines = data.toString().split('\n');

    for (const line of lines) {
      if (line.startsWith('aa')) {
        const dateString = line.substr(2, 6);
        const timeString = line.substr(8, 6);
        const dateTimeString = `20${dateString} ${timeString}`;
        const dateTime = new Date(dateTimeString);

        if (dateTime >= startDate && dateTime <= endDate) {
          client.write(line + '\r\n');
        }
      }
    }
  });

  fileStream.on('end', () => {
    client.end();
    console.log('Transmission complete. Connection closed.');
  });
}
