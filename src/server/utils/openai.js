import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Available models for chat
export const AVAILABLE_MODELS = [
  'gpt-4-turbo',
  'gpt-4',
  'gpt-3.5-turbo',
  'gpt-4o',
  'gpt-4o-mini'
];

// Create chat completion with streaming
export async function createChatCompletion(messages, model = 'gpt-4o-mini', stream = true) {
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      stream,
      max_tokens: 2000,
      temperature: 0.7,
    });

    return completion;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

// Function to process model chaining
export async function processModelChain(initialMessage, modelChain, userContext = {}) {
  const results = [];
  let currentMessage = initialMessage;

  for (const step of modelChain) {
    const { model, transform, prompt_template } = step;
    
    // Apply transform to current message if specified
    if (transform && typeof transform === 'function') {
      currentMessage = transform(currentMessage);
    }

    // Build messages array
    const messages = [
      { role: 'system', content: prompt_template || 'You are a helpful assistant.' },
      { role: 'user', content: currentMessage }
    ];

    try {
      const completion = await createChatCompletion(messages, model, false);
      const response = completion.choices[0].message.content;
      
      results.push({
        step: step.name || `Step ${results.length + 1}`,
        model,
        input: currentMessage,
        output: response,
        timestamp: new Date().toISOString()
      });

      // Use this response as input for next step
      currentMessage = response;
    } catch (error) {
      results.push({
        step: step.name || `Step ${results.length + 1}`,
        model,
        input: currentMessage,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      break; // Stop chain on error
    }
  }

  return results;
}

export default openai;