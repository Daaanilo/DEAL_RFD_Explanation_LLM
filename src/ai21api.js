async function ai21HandleUserInput(prompt, model = 'j2-ultra', maxTokens = 100) {
    const apiKey = 'TMizVfcAqTQAUO0dYf66csA2igrq5edX';
    const apiUrl = `https://api.ai21.com/studio/v1/${model}/complete`;
  
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          maxTokens: maxTokens,
          temperature: 0.7,
          topKReturn: 0,
          topP: 1,
        })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data.completions[0].data.text;
    } catch (error) {
      console.error('Si Ã¨ verificato un errore:', error);
      return null;
    }
  }
  
  export default ai21HandleUserInput;