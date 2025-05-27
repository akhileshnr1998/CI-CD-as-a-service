import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

const jobQueue = new Queue('ci-jobs', {
    connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    }
});

export default jobQueue;

