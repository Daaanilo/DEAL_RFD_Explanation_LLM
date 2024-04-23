const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');

const app = express();
const port = 5000;

// Connessione al database MongoDB
mongoose.connect('mongodb+srv://admin:admin@progettouniversitario.7eqm09o.mongodb.net/?retryWrites=true&w=majority&appName=progettouniversitario', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Definizione dello schema per i dati JSON
const jsonSchema = new mongoose.Schema({
  data: Object
});
const JSONModel = mongoose.model('JSONModel', jsonSchema);

// Configurazione di multer per il caricamento dei file
const upload = multer({ dest: 'uploads/' });

// Middleware per gestire le richieste CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // Consenti l'accesso da qualsiasi dominio
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // Specifica i metodi consentiti
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Route per il caricamento dei file JSON
app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const rawData = fs.readFileSync(filePath);
  const jsonData = JSON.parse(rawData);

  // Salvataggio dei dati JSON nel database MongoDB
  const newJSON = new JSONModel({ data: jsonData });
  newJSON.save().then(() => {
    // Rimuovi il file temporaneo dopo il caricamento
    fs.unlinkSync(filePath);
    res.send('File JSON caricato e salvato con successo!');
  }).catch(err => {
    console.log(err);
    res.status(500).send('Errore durante il salvataggio del file JSON');
  });
});

app.listen(port, () => console.log(`Server running on port ${port}`));