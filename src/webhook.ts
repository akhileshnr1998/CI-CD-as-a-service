import express, { Request, Response } from 'express';
import { verifySignature } from './utils/verifySignature';
import dotenv from 'dotenv';
import jobQueue from './queue';

dotenv.config();

const router = express.Router();

const GITHUB_SECRET = process.env.GITHUB_SECRET!;

router.post('/',async (req: Request, res: Response) => {
  const signature = req.headers['x-hub-signature-256'] as string;
  const rawBody = (req as any).rawBody;


  if (!signature || !verifySignature(GITHUB_SECRET, rawBody, signature)) {
    return res.status(401).send('Invalid signature');
  }

  const event = req.headers['x-github-event'];
  if (event !== 'push') {
    return res.status(200).send('Ignored event');
  }

  const payload = req.body;

  await jobQueue.add('run-job',{
    repo: payload.repository.full_name,
    branch: payload.ref,
    cloneUrl: payload.repository.clone_url,
    shouldRunBuild: false,
    shouldRunTest: false
  })
  console.log(`Received push for ${payload.repository.full_name} on ${payload.ref}`);

  res.status(200).send('Webhook received');
});

export default router;
