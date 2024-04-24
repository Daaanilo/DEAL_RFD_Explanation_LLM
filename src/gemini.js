// gemini.js
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run() {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = "Ciao come stai?";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
}

run();
