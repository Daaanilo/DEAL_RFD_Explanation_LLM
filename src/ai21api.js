async function ai21HandleUserInput(prompt, model = 'j2-ultra', maxTokens = 1000) {
    const apiKey = 'TMizVfcAqTQAUO0dYf66csA2igrq5edX';
    // TMizVfcAqTQAUO0dYf66csA2igrq5edX or RALv692HUse02IpqxXV7XN0T7a9iBUzi
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
          maxTokens: 2048,
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
      console.error('An error occurred:', error);
      return null;
    }
  }
  
  export default ai21HandleUserInput;