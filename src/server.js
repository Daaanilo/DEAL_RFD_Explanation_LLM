const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');

const app = express();
const port = 5000;

// Connessione al database MongoDB con un timeout maggiore
mongoose.connect('mongodb+srv://admin:admin@progettouniversitario.7eqm09o.mongodb.net/?retryWrites=true&w=majority&appName=progettouniversitario')
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('Errore di connessione al database MongoDB:', err);
    process.exit(1); // Esci dall'applicazione in caso di errore di connessione
  });


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

// Gestione degli errori durante il caricamento dei file
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    const filePath = req.file.path;
    const rawData = fs.readFileSync(filePath);
    const jsonData = JSON.parse(rawData);

    const newJSON = new JSONModel({ data: jsonData });
    newJSON.save().then(() => {
      fs.unlinkSync(filePath);
      res.send('File JSON caricato e salvato con successo!');
    }).catch(err => {
      console.error('Errore durante il salvataggio del file JSON:', err);
      res.status(500).send('Errore durante il salvataggio del file JSON');
    });
  } catch (error) {
    console.error('Errore durante il caricamento del file:', error);
    res.status(500).send('Errore durante il caricamento del file JSON');
  }
});

// Gestione degli errori nella query per recuperare i nomi dei file
app.get('/files', async (req, res) => {
  try {
    const files = await JSONModel.find({}, '_id').lean(); // Usare il metodo lean per ottenere un oggetto JavaScript piuttosto che un documento Mongoose
    const fileNames = files.map(file => file._id);
    res.json(fileNames);
  } catch (error) {
    console.error('Errore durante il recupero dei nomi dei file:', error);
    res.status(500).json({ error: 'Errore durante il recupero dei nomi dei file' });
  }
});

// Route per recuperare il contenuto di un file specifico
app.get('/files/:id', async (req, res) => {
  try {
    const file = await JSONModel.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File non trovato' });
    }
    res.json(file.data); // Restituisci solo il contenuto del file
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante il recupero del contenuto del file' });
  }
});

// Route per eliminare un file specifico
app.delete('/files/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    const deletedFile = await JSONModel.findByIdAndDelete(fileId);
    if (!deletedFile) {
      return res.status(404).json({ error: 'File non trovato' });
    }
    res.json({ message: 'File eliminato con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante l\'eliminazione del file' });
  }
});


app.listen(port, () => console.log(`Server running on port ${port}`));
