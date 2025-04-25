import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Security Headers
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
  );
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.get('/api', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Debug route to check directory structure
app.get('/debug/paths', (req, res) => {
  const publicPath = path.join(__dirname, '../public');
  const indexPath = path.join(__dirname, '../public/index.html');
  res.json({
    currentDir: __dirname,
    publicPath,
    indexPath,
    exists: {
      publicDir: existsSync(publicPath),
      indexFile: existsSync(indexPath)
    }
  });
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Anything that doesn't match the above, send back index.html
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../public/index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: 'Index file not found',
      path: indexPath
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 