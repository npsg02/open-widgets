import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supported file types and their processors
const FILE_PROCESSORS = {
  '.txt': processTxtFile,
  '.md': processMarkdownFile,
  '.pdf': processPdfFile, // Placeholder - would need pdf-parse package
  '.png': processImageFile, // Placeholder - would need image processing
  '.jpg': processImageFile,
  '.jpeg': processImageFile,
};

// Maximum file size (10MB default)
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

/**
 * Process uploaded file and extract text content
 */
export async function processUploadedFile(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const processor = FILE_PROCESSORS[ext];

  if (!processor) {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  try {
    const stats = fs.statSync(filePath);
    if (stats.size > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    const result = await processor(filePath, originalName);
    
    // Clean up uploaded file after processing
    fs.unlinkSync(filePath);
    
    return result;
  } catch (error) {
    // Clean up on error
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.error('Error cleaning up file:', unlinkError);
    }
    throw error;
  }
}

/**
 * Process text files
 */
async function processTxtFile(filePath, originalName) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return {
    type: 'text',
    filename: originalName,
    content: content.trim(),
    summary: generateTextSummary(content),
    size: content.length
  };
}

/**
 * Process Markdown files
 */
async function processMarkdownFile(filePath, originalName) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return {
    type: 'markdown',
    filename: originalName,
    content: content.trim(),
    summary: generateTextSummary(content),
    size: content.length
  };
}

/**
 * Placeholder for PDF processing
 */
async function processPdfFile(filePath, originalName) {
  // This would require the pdf-parse package
  // For now, return a placeholder
  return {
    type: 'pdf',
    filename: originalName,
    content: '[PDF content extraction not implemented]',
    summary: `PDF file: ${originalName}`,
    size: fs.statSync(filePath).size
  };
}

/**
 * Placeholder for image processing
 */
async function processImageFile(filePath, originalName) {
  // This would require image processing libraries
  // For now, return a placeholder
  const stats = fs.statSync(filePath);
  return {
    type: 'image',
    filename: originalName,
    content: '[Image content analysis not implemented]',
    summary: `Image file: ${originalName} (${(stats.size / 1024).toFixed(2)}KB)`,
    size: stats.size
  };
}

/**
 * Generate a summary of text content
 */
function generateTextSummary(content, maxLength = 200) {
  if (!content || content.length <= maxLength) {
    return content;
  }

  // Simple truncation with word boundary
  const truncated = content.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Validate file type
 */
export function isValidFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  return Object.keys(FILE_PROCESSORS).includes(ext);
}

/**
 * Get supported file extensions
 */
export function getSupportedExtensions() {
  return Object.keys(FILE_PROCESSORS);
}