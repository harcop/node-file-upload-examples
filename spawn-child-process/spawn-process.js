// childProcess.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const dataSchema = new Schema({
}, {strict: false, strictPopulate: false});

const DataModel = mongoose.model('users', dataSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/test').then(() => {
  // console.log('Connected to MongoDB');
  
  // Stream data from MongoDB
  const cursor = DataModel.find().limit(1).cursor();

  let firstChunk = true;

  cursor.on('data', (doc) => {
    if (firstChunk) {
      firstChunk = false;
    } else {
      process.stdout.write(',');
    }
    process.stdout.write(JSON.stringify(doc));
  });

  cursor.on('end', () => {
    process.stdout.write(']');
    mongoose.connection.close();
  });

  cursor.on('error', (err) => {
    console.error(`Error: ${err.message}`);
    mongoose.connection.close();
  });

  // Write the initial array bracket
  process.stdout.write('[');
}).catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1); // Exit the process with error code
});
