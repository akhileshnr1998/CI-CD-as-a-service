import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import webhookRoute from './webhook';
import startWorker from './worker';
import dbClient from './utils/databaseConnection';

// Load environment variables from .env file
dotenv.config();

const app = express();

async function startServer() {
  await dbClient.connect();
  console.log("✅ Connected to PostgreSQL")

  // Middleware to capture raw body for signature verification
  app.use(
    bodyParser.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      }
    })
  );

  startWorker();

  // Register routes
  app.use('/webhook', webhookRoute);

  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}

startServer();

