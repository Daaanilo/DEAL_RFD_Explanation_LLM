const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');

const app = express();
const port = 5000;

mongoose.connect('mongodb+srv://admin:admin@progettouniversitario.7eqm09o.mongodb.net/?retryWrites=true&w=majority&appName=progettouniversitario')
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

const jsonSchema = new mongoose.Schema({
  fileName: String,
  data: Object
});

const JSONModel = mongoose.model('JSONModel', jsonSchema);

const upload = multer({ dest: 'uploads/' });

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.post('/upload', upload.single('file'), (req, res) => {
  try {
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const rawData = fs.readFileSync(filePath);
    const jsonData = JSON.parse(rawData);

    const newJSON = new JSONModel({ fileName, data: jsonData });
    newJSON.save().then(() => {
      fs.unlinkSync(filePath);
      res.send('JSON file uploaded and saved successfully!');
    }).catch(err => {
      console.error('Error saving JSON file:', err);
      res.status(500).send('Error saving JSON file');
    });
  } catch (error) {
    console.error('Error uploading the file:', error);
    res.status(500).send('Error uploading JSON file');
  }
});

app.get('/files', async (req, res) => {
  try {
    const files = await JSONModel.find({}, '_id fileName').lean();
    res.json(files);
  } catch (error) {
    console.error('Error retrieving file names:', error);
    res.status(500).json({ error: 'Error retrieving file names' });
  }
});

app.get('/files/:id', async (req, res) => {
  try {
    const file = await JSONModel.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json(file.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving file content' });
  }
});

app.delete('/files/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    const deletedFile = await JSONModel.findByIdAndDelete(fileId);
    if (!deletedFile) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting the file' });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
