import { Hono } from 'hono';
import { config } from 'dotenv';
import { logger } from 'hono/logger';
import auth from '~src/routes/auth';
import authMiddleware from './routes/middleware/auth-middleware';
import role_middleware from './routes/middleware/role-middleware';
import book from './routes/books';
import borrow from './routes/borrow';
import md from '~utils/render-md';
import fs from 'fs/promises';
config();

const app = new Hono().basePath('/api/v1');
app.use('*', logger());
app.use('/books/*', authMiddleware);
app.use('/books/*', role_middleware('LIBRARIAN'));
app.use('/borrow/*', authMiddleware);
app.use('/borrow/*', role_middleware('LIBRARIAN'));
app.route('/auth', auth);
app.route('/books', book);
app.route('/borrow', borrow);

app.get('/', async (c) => {
  try {
    const doc = 'src/doc/api_doc.md';
    const fileContents = await Bun.file(doc).text();
    const formattedFileContents = md.parse(fileContents);
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/tokyo-night-dark.min.css">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet">
        <style>
          *{
            font-family: "Outfit", sans-serif;
            font-optical-sizing: auto;
          }
          code{
            border-radius: 5px;
            background-color:#273469;
            padding: 4px 6px;
          }
          code:hover{
              border: 4px solid #E4D9FF ;
          }
          body{
              background-color:#30343F;
              color:#FAFAFF;
          }
        </style>
          <title>Library Management API</title>
      </head>
      <body>
        ${formattedFileContents}
      </body>
      </html>
    `;

    return c.html(htmlContent);
  } catch (error) {
    console.error('Error reading file:', error);
    return c.html('Error reading file');
  }
});

Bun.serve({
  fetch: app.fetch,
  port: process.env.PORT,
});
