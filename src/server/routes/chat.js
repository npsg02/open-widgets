import express from 'express';
import { createChatCompletion, AVAILABLE_MODELS, processModelChain } from '../utils/openai.js';
import { chatLimiter, chainLimiter } from '../middleware/rateLimit.js';
import { validateChatMessage, validateModelChain } from '../middleware/validation.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/chat/models - Get available models
 */
router.get('/models', (req, res) => {
  res.json({
    models: AVAILABLE_MODELS,
    default: 'gpt-4o-mini'
  });
});

/**
 * POST /api/chat - Send chat message and get streaming response
 */
router.post('/', chatLimiter, optionalAuth, validateChatMessage, async (req, res) => {
  try {
    const { message, model = 'gpt-4o-mini', sessionId, context = [], attachments = [] } = req.body;

    // Build messages array
    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      ...context,
    ];

    // Add attachment context if present
    if (attachments && attachments.length > 0) {
      const attachmentContext = attachments.map(att => 
        `File: ${att.filename}\nContent: ${att.summary || att.content}`
      ).join('\n\n');
      
      messages.push({
        role: 'system',
        content: `The user has attached the following files:\n\n${attachmentContext}`
      });
    }

    messages.push({ role: 'user', content: message });

    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const completion = await createChatCompletion(messages, model, true);

    let fullResponse = '';

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        
        // Send chunk to client
        res.write(`data: ${JSON.stringify({
          type: 'chunk',
          content,
          timestamp: new Date().toISOString()
        })}\n\n`);
      }
    }

    // Send completion signal
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      fullResponse,
      model,
      timestamp: new Date().toISOString()
    })}\n\n`);

    res.end();

  } catch (error) {
    console.error('Chat error:', error);
    
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    })}\n\n`);
    
    res.end();
  }
});

/**
 * POST /api/chat/complete - Non-streaming chat completion
 */
router.post('/complete', chatLimiter, optionalAuth, validateChatMessage, async (req, res) => {
  try {
    const { message, model = 'gpt-4o-mini', context = [], attachments = [] } = req.body;

    // Build messages array
    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      ...context,
    ];

    // Add attachment context if present
    if (attachments && attachments.length > 0) {
      const attachmentContext = attachments.map(att => 
        `File: ${att.filename}\nContent: ${att.summary || att.content}`
      ).join('\n\n');
      
      messages.push({
        role: 'system',
        content: `The user has attached the following files:\n\n${attachmentContext}`
      });
    }

    messages.push({ role: 'user', content: message });

    const completion = await createChatCompletion(messages, model, false);
    const response = completion.choices[0].message.content;

    res.json({
      response,
      model,
      usage: completion.usage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat completion error:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/chat/chain - Process model chain
 */
router.post('/chain', chainLimiter, optionalAuth, validateModelChain, async (req, res) => {
  try {
    const { message, chain, context = {} } = req.body;

    const results = await processModelChain(message, chain, context);

    res.json({
      results,
      totalSteps: results.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Model chain error:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;