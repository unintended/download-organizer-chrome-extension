const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const distPath = path.join(__dirname, '..', 'dist');
const outputPath = path.join(__dirname, '..', 'extension.zip');

// Create a file to stream archive data to
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', () => {
  console.log(`Extension packaged successfully: ${archive.pointer()} total bytes`);
  console.log(`Output: ${outputPath}`);
});

// Good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

// Good practice to catch this error explicitly
archive.on('error', (err) => {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Append files from the dist directory
archive.directory(distPath, false);

// Finalize the archive (ie we are done appending files but streams have to finish yet)
archive.finalize();