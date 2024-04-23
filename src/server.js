<<<<<<< HEAD:src/server.js
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
=======
const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
app.use("/files", express.static("files"));
//mongodb connection----------------------------------------------
const mongoUrl =
  "mongodb+srv://admin:admin@cluster0.nnoxykj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => console.log(e));
//multer------------------------------------------------------------
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./pdfDetails");
const PdfSchema = mongoose.model("PdfDetails");
const upload = multer({ storage: storage });

app.post("/upload-files", upload.single("file"), async (req, res) => {
  console.log(req.file);
  const title = req.body.title;
  const fileName = req.file.filename;
  try {
    await PdfSchema.create({ title: title, pdf: fileName });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-files", async (req, res) => {
  try {
    PdfSchema.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});

app.listen(5000, () => {
  console.log("Server Started");
});
>>>>>>> 594fd372dadb44abc5c9ac06a82e4f03a1f07129:progettouniversitario/src/server.js
