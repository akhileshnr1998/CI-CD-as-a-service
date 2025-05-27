import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const asyncExec = promisify(exec);

interface JobData {
  repo: string;
  branch: string;
  cloneUrl: string;
  shouldRunBuild: boolean;
  shouldRunTest: boolean;
}

interface ChildResponse {
  status: 'done' | 'error';
  processedData?: any;
  error?: string;
}

process.on('message', async (jobData: JobData) => {
  console.log('Child process received job data:', jobData);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-'));
  const repoPath = path.join(tmpDir, 'repo');

  try {
    // Clone the repository
    const cleanedBranch = jobData.branch.replace('refs/heads/', '');
    await asyncExec(`git clone --branch ${cleanedBranch} ${jobData.cloneUrl} ${repoPath}`);
    console.log('Repository cloned.');

    // Run install & build (adjust based on repo type)
    await asyncExec(`npm install`, { cwd: repoPath });
    if(jobData.shouldRunBuild){
      await asyncExec(`npm run build`, { cwd: repoPath });
    }
    console.log('Build completed.');

    // Optionally: Run tests
    if(jobData.shouldRunTest){
      await asyncExec(`npm test`, { cwd: repoPath });
    }
    console.log('Tests passed.');

    // Deploy
    await asyncExec(`chmod +x deploy.sh`, { cwd: repoPath });
    await asyncExec(`./deploy.sh`, { cwd: repoPath });

    // Clean up
    fs.rmSync(tmpDir, { recursive: true, force: true });

    process.send?.({
      status: 'done',
      processedData: {
        repo: jobData.repo,
        branch: jobData.branch,
        result: 'CI/CD pipeline completed successfully',
      },
    });
    process.exit(0);
  } catch (err: any) {
    console.error('CI/CD error:', err.message || err);
    process.send?.({ status: 'error', error: err.message || 'Unknown error' });
    process.exit(1);
  }
});
