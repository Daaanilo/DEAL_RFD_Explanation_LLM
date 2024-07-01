const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: "sk-proj-CW8O86Ex57hya7AbceT2T3BlbkFJIyfY1LgD6zTky4xMVhZY", dangerouslyAllowBrowser: true});

const handleUserInput = async (input) => {

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: input }],
    });

    const assistantResponse = response.choices[0].message.content;
    return assistantResponse;

  } catch (error) {
    alert('Error: ' + error);
  }
};

module.exports = { handleUserInput };