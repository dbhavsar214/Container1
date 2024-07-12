const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { log, error } = require('console');

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 6000;
const CONTAINER_2_ENDPOINT = process.env.CONTAINER_2_ENDPOINT || 'http://localhost:6001/calculate';
const FILE_DIRECTORY = process.env.FILE_DIRECTORY || '/divy_PV_dir';

// Ensure the directory exists
if (!fs.existsSync(FILE_DIRECTORY)) {
  fs.mkdirSync(FILE_DIRECTORY, { recursive: true });
}

// Endpoint to store file
app.post('/store-file', (req, res) => {
  const { file, data } = req.body;

  const filename = req.body.file;
  const content = req.body.data;

  if (!filename || !content) {

    return res.status(400).json({ file: null, error: 'Invalid JSON input.' });
  }

  const filePath = path.resolve(FILE_DIRECTORY, file);

  fs.writeFile(filePath, data, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ file: 'file.dat', error: 'Error while storing the file to the storage.' });
    }
    return res.json({ message: "Success.", file });
  });
});


app.post('/calculate', async (req, res) => {
  const { file, product } = req.body;
  //comment
  if (!file) {
    return res.status(400).json({ file: null, error: 'Invalid JSON input.' });
  }

  const filePath = path.resolve(FILE_DIRECTORY, file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ file, error: 'File not found.' });
  }

  try {
    const response = await axios.post(CONTAINER_2_ENDPOINT, { "file": file, "data": product });
    console.log(response.data);  // Logging the response data from the processor
    return res.json(response.data);
  } catch (error) {
    console.error("Axios error:", error);
    return res.status(500).json({ file, error: 'Error processing request.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
