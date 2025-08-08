import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4321',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Basic routes (simplified for now)
// TODO: Import full route modules when needed

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Models endpoint
app.get('/api/chat/models', (req, res) => {
  res.json({
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    default: 'gpt-4o-mini'
  });
});

// Basic chat endpoint for testing
app.post('/api/chat', (req, res) => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_key_for_testing') {
    // Provide mock streaming response for testing
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const message = 'This is a test response from the chat API. To use real OpenAI models, set the OPENAI_API_KEY environment variable with your actual API key.';
    
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
    return;
  }

  // For real OpenAI integration, you would import and use the chat routes here
  res.status(501).json({ 
    error: 'Full OpenAI integration not yet implemented in this simplified server',
    message: 'Set OPENAI_API_KEY=dummy_key_for_testing to use mock responses'
  });
});

// File upload support info
app.get('/api/upload/supported', (req, res) => {
  res.json({
    extensions: ['.txt', '.md', '.pdf', '.png', '.jpg', '.jpeg'],
    maxSize: '10MB',
    note: 'File upload endpoints not yet implemented in this simplified server'
  });
});

// Auth endpoints placeholder
app.post('/api/auth/guest', (req, res) => {
  res.json({
    success: true,
    token: 'mock-guest-token',
    user: { id: 'guest', username: 'Guest', isGuest: true },
    expiresIn: '1h'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Chat API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:4321'}`);
  console.log(`🤖 OpenAI API: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured (using mock responses)'}`);
});

export default app;