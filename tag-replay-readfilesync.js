const readline = require('readline');
const net = require('net');
const fs = require('fs');

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

function processFileData(client, data) {
    let foundMatchingLines = false;
    let buffer = ''; // Buffer to hold incomplete lines

    buffer += data.toString();
    const lines = buffer.split('\n'); // Split by '\n' to handle different line endings
    buffer = lines.pop(); // Store any incomplete line for the next chunk

    for (const line of lines) {
        console.log(line);
        if (line.startsWith('aa')) {
            const timestamp = line.substr(20, 12); // Extract timestamp

            console.log(`Found line: ${line}`);
            console.log(`Extracted timestamp: ${timestamp}`);

            // Parse the timestamp into separate components
            const year = parseInt(timestamp.substr(0, 2)) + 2000; // Assuming 20xx format
            const month = parseInt(timestamp.substr(2, 2));
            const day = parseInt(timestamp.substr(4, 2));
            const hour = parseInt(timestamp.substr(6, 2));
            const minute = parseInt(timestamp.substr(8, 2));
            const second = parseInt(timestamp.substr(10, 2));

            console.log(`Parsed year: ${year}`);
            console.log(`Parsed month: ${month}`);
            console.log(`Parsed day: ${day}`);
            console.log(`Parsed hour: ${hour}`);
            console.log(`Parsed minute: ${minute}`);
            console.log(`Parsed second: ${second}`);

            const lineDate = new Date(year, month - 1, day, hour, minute, second);
            const startTimeDate = new Date(startDate + ' ' + startTime);
            const endTimeDate = new Date(endDate + ' ' + endTime);

            console.log(`Line date: ${lineDate}`);
            console.log(`Start time date: ${startTimeDate}`);
            console.log(`End time date: ${endTimeDate}`);

            if (
                lineDate >= startTimeDate &&
                lineDate <= endTimeDate
            ) {
                client.write(`${line}\r\n`);
                foundMatchingLines = true;
                console.log('Matching line found.');
            }
        }
    }

    return foundMatchingLines;
}

function createTCPServer() {
    const server = net.createServer((client) => {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            const foundMatchingLines = processFileData(client, data);

            client.end(); // End the client connection

            if (!foundMatchingLines) {
                console.log('No matching lines were found.');
            }

            server.close(); // Close the server after processing
        } catch (error) {
            console.error('Error reading the file:', error);
        }
    });

    server.listen(port, () => {
        console.log(`TCP server listening on port ${port}`);
    });
}

promptForFilePath();
