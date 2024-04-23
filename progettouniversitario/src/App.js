import React, { useState } from 'react';
import { Stitch, RemoteMongoClient, BSON } from 'mongodb-stitch-browser-sdk';
import axios from "axios"

function App() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState("");
  
  const submitImage=async(e)=>{
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    
    console.log(title, file)
    const result = await axios.post("http://localhost:5000/upload-files", formData,
    {
      headers: {"Content-Type": "multipart/form-data"},
    });

    console.log(result);
  }

  return (
    <div className="App">
      <form className="formStyle" onSubmit={submitImage}>
        <h4>Upload JSON</h4>
        <br/>
        <input
          type="text"
          className="form-control"
          placeholder="Title"
          required
          onChange={(e)=>setTitle(e.target.value)}/>
          <input
            type="file"
            class="form-control"
            accept="application/pdf"
            required
            onChange={(e)=>setFile(e.target.files[0])}
            />
 
      <button class="btn btn-primary" type="submit">
        Carica
      </button>     </form>
    </div>
  );
}

export default App;

