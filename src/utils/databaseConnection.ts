import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbClient = new Client({
  host: process.env.DB_HOST!,        
  port: Number(process.env.DB_PORT),              
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
});

export default dbClient;
