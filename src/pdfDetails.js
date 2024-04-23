<<<<<<< HEAD:src/pdfDetails.js
const mongoose = require("mongoose");

const PdfDetailsSchema=new mongoose.Schema({
    pdf:String,
    title:String
},{collection:"PdfDetails"})

=======
const mongoose = require("mongoose");

const PdfDetailsSchema=new mongoose.Schema({
    pdf:String,
    title:String
},{collection:"PdfDetails"})

>>>>>>> 594fd372dadb44abc5c9ac06a82e4f03a1f07129:progettouniversitario/src/pdfDetails.js
mongoose.model("PdfDetails", PdfDetailsSchema)