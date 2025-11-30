# Chat Widget

A comprehensive AI chat interface built with Astro, React, and TypeScript that provides streaming conversations with OpenAI models, file uploads, markdown rendering, and multi-model session management.

## Features

### Core Chat Features
- **Streaming Responses**: Real-time token-by-token streaming from OpenAI models
- **Multi-Model Support**: Chat with different OpenAI models (GPT-4, GPT-3.5, etc.)
- **File Attachments**: Upload and process files (text, markdown, images, PDFs)
- **Markdown Rendering**: Full markdown support with syntax highlighting
- **Code Execution**: Run JavaScript code blocks directly in the browser

### Advanced Features
- **Multi-Session Management**: Run multiple chat sessions simultaneously
- **Model-to-Model Chaining**: Chain responses between different models
- **Session Management**: Save, export, and manage chat history
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes

### Security & Performance
- **JWT Authentication**: Secure user sessions
- **Rate Limiting**: Prevent API abuse
- **Input Sanitization**: XSS protection
- **File Validation**: Secure file upload handling

## Getting Started

### Prerequisites
- Node.js 18+ 
- OpenAI API key
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd open-widgets
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development servers:
```bash
# Start both frontend and backend
npm run dev:full

# Or start them separately:
npm run dev      # Frontend (Astro) on port 4321
npm run server   # Backend API on port 3001
```

5. Open your browser and navigate to:
- Frontend: http://localhost:4321/chat
- API Health Check: http://localhost:3001/health

## Usage

### Basic Chat
1. Visit http://localhost:4321/chat
2. Click "Start New Chat"
3. Select a model from the dropdown
4. Type your message and press Enter
5. Watch the AI response stream in real-time

### File Uploads
1. Click the paperclip icon in the message input
2. Drag and drop files or click to browse
3. Supported formats: .txt, .md, .pdf, .png, .jpg, .jpeg
4. Files are processed and their content is included in the chat context

### Multi-Model Sessions
1. Click "New Chat" to create additional sessions
2. Use the view mode buttons to switch between:
   - Single: One chat at a time
   - Grid: Multiple chats in a grid layout
   - Stack: Vertically stacked chats

### Model Chaining
1. Enable "Model Chains" in settings
2. Create a chain configuration with multiple models
3. Each model's output becomes the next model's input

## API Endpoints

### Chat Endpoints
- `GET /api/chat/models` - Get available models
- `POST /api/chat` - Send message with streaming response
- `POST /api/chat/complete` - Send message with single response
- `POST /api/chat/chain` - Process model chain

### Upload Endpoints  
- `GET /api/upload/supported` - Get supported file types
- `POST /api/upload` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files

### Auth Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/guest` - Get guest token
- `GET /api/auth/me` - Get current user

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `PORT` | Backend server port | 3001 |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:4321 |
| `JWT_SECRET` | Secret for JWT tokens | Change in production |
| `MAX_FILE_SIZE` | Max file upload size in bytes | 10485760 (10MB) |

### Widget Configuration

The chat widget can be configured via props or postMessage:

```javascript
// Via props
<ChatWidget config={{
  apiBaseUrl: 'http://localhost:3001/api',
  theme: { darkMode: false },
  settings: {
    defaultModel: 'gpt-4o-mini',
    enableFileUploads: true,
    enableModelChains: true
  }
}} />

// Via postMessage (for iframe embedding)
window.postMessage({
  type: 'CHAT_CONFIG',
  config: {
    apiBaseUrl: 'http://localhost:3001/api',
    theme: { darkMode: true }
  }
}, '*');
```

## Development

### Project Structure
```
src/
├── pages/
│   └── chat.astro              # Chat page
├── widgets/
│   └── chat/
│       ├── index.tsx           # Main widget component
│       ├── store.ts            # Zustand state management
│       ├── types.ts            # TypeScript interfaces
│       ├── components/         # React components
│       └── utils/              # Utility functions
└── server/                     # Backend API
    ├── index.js                # Express server
    ├── routes/                 # API routes
    ├── middleware/             # Express middleware
    └── utils/                  # Server utilities
```

### Adding New Features

1. **New Chat Components**: Add to `src/widgets/chat/components/`
2. **API Endpoints**: Add to `src/server/routes/`
3. **Store Actions**: Extend `src/widgets/chat/store.ts`
4. **Types**: Update `src/widgets/chat/types.ts`

### Testing

Run the basic test suite:
```bash
npm test
```

For manual testing:
1. Test file uploads with various formats
2. Test streaming responses
3. Test multi-session management
4. Test error handling
5. Test responsive design

## Deployment

### Build for Production

```bash
npm run build
```

### Environment Setup

For production deployment:

1. Set secure environment variables:
```env
NODE_ENV=production
JWT_SECRET=your-secure-production-secret
OPENAI_API_KEY=your-production-api-key
```

2. Configure CORS for your domain:
```env
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

3. Set up HTTPS and security headers

### Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001 4321
CMD ["npm", "run", "dev:full"]
```

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Check your API key is valid
   - Ensure you have sufficient credits
   - Verify model names are correct

2. **File Upload Issues**
   - Check file size limits
   - Verify supported file types
   - Ensure `/tmp/uploads` directory exists

3. **CORS Errors**
   - Set correct `FRONTEND_URL` in environment
   - Check CORS configuration in server

4. **Streaming Issues**
   - Ensure browser supports Server-Sent Events
   - Check network connectivity
   - Verify API endpoint accessibility

### Debug Mode

Enable debug logging:
```env
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the API
- Astro team for the excellent framework
- React and Zustand communities
- Contributors and testers