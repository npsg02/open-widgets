import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors({
  origin: 'http://localhost:4321',
  credentials: true,
}));

app.use(express.json());

// Test health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Chat API server is running'
  });
});

// Test models endpoint
app.get('/api/chat/models', (req, res) => {
  res.json({
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    default: 'gpt-4o-mini'
  });
});

// Test chat endpoint
app.post('/api/chat', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send a test streaming response
  const message = 'This is a test response from the chat API. The OpenAI integration will work when you provide a valid API key.';
  
  // Simulate streaming
  let index = 0;
  const interval = setInterval(() => {
    if (index < message.length) {
      const chunk = message[index];
      res.write(`data: ${JSON.stringify({
        type: 'chunk',
        content: chunk,
        timestamp: new Date().toISOString()
      })}\n\n`);
      index++;
    } else {
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        fullResponse: message,
        model: 'test-model',
        timestamp: new Date().toISOString()
      })}\n\n`);
      clearInterval(interval);
      res.end();
    }
  }, 50);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Chat API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 CORS enabled for: http://localhost:4321`);
});

export default app;