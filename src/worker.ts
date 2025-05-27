import { Worker } from "bullmq";
import path from 'path';
import { ChildProcess, fork } from 'child_process';

interface JobData {
  [key: string]: any;
}

interface ChildResponse {
  status: string;
  processedData?: any;
  error?: string;
}

function startWorker() {
  const worker = new Worker('ci-jobs', async (job) => {
    console.log(`Processing job for ${job.data.repo} on ${job.data.branch}`);
    return new Promise((resolve, reject) => {
      const childPath = path.resolve(__dirname, 'jobs/processor.js');

      const child: ChildProcess = fork(childPath);

      // Send job data to child process
      child.send(job.data as JobData);

      // Listen for message from child
      child.on('message', (message: ChildResponse) => {
        if (message.status === 'done') {
          resolve(message.processedData);
        } else if (message.status === 'error') {
          reject(new Error(message.error));
        }
        child.kill();
      });

      child.on('error', (err) => {
        reject(err);
        child.kill();
      });

      child.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Child process exited with code ${code}`));
        }
      });
    });
  }, {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    }
  });

  worker.on('completed', job => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });
}

export default startWorker;
