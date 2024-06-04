// csvWriter.js
const mongoose = require('mongoose');
const { createObjectCsvStringifier } = require('csv-writer');
const User = require('./models/User'); // Adjust the path as needed

mongoose.connect('mongodb://localhost:27017/testdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const BATCH_SIZE = 100; // Adjust the batch size as needed

async function generateCSV() {
  try {
    const csvWriter = createObjectCsvStringifier({
      header: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'age', title: 'Age' }
      ]
    });

    let headerWritten = false;
    const cursor = User.find().lean().batchSize(BATCH_SIZE).cursor();
    
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      const records = [doc];

      if (!headerWritten) {
        process.stdout.write(csvWriter.getHeaderString() + csvWriter.stringifyRecords(records));
        headerWritten = true;
      } else {
        process.stdout.write(csvWriter.stringifyRecords(records));
      }
    }

    process.stdout.end(); // Signal the end of the stream
    mongoose.connection.close();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

generateCSV();
