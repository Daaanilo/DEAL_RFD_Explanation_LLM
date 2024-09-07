const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: "sk-proj-4aB1sWHFnSNiMVXgpWKrT3BlbkFJwhGWWAqvwV1YTxZ6yCte", dangerouslyAllowBrowser: true});
// sk-proj-4aB1sWHFnSNiMVXgpWKrT3BlbkFJwhGWWAqvwV1YTxZ6yCte or sk-F7RcVEi656cOuVLUasOHkzoIjasZ2hc8y3p1OblvOQT3BlbkFJH_DKu7w1JRM9wRI2Nep5wGTDUAGfhqHdfwtTZGVScA

const chatGPTHandleUserInput = async (input) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: input }],
      max_tokens: 2048,
    });

    const assistantResponse = response.choices[0].message.content;
    return assistantResponse;

  } catch (error) {
    alert('Error: ' + error);
  }
};

module.exports = { chatGPTHandleUserInput };