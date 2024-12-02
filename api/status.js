import express from 'express';
import axios from 'axios';

const app = express();

app.get('/', async (req, res) => {
  const platform = req.query.platform;
  const user = req.query.user;
  const repo = req.query.repo;
  let status = 'unknown';
  let errorLogs = '';

  if (!platform || !user || !repo) {
    return res.status(400).send(
      '<div class="status error">Missing required query parameters: platform, user, or repo.</div>'
    );
  }

  try {
    if (platform === 'github' || platform === 'g') {
      const response = await axios.get(
        `https://api.github.com/repos/${user}/${repo}/pages/builds/latest`
      );
      const latestRun = response.data.workflow_runs[0];
      status = latestRun.status === 'completed' ? latestRun.conclusion : latestRun.status;

      if (status === 'failure' || status === 'error') {
        const logsResponse = await axios.get(latestRun.logs_url, {
          headers: { Accept: 'application/vnd.github.v3+json' }
        });
        errorLogs = logsResponse.data || 'No logs available.';
      }
    } else if (platform === 'netlify') {
      const response = await axios.get(
        `https://api.netlify.com/api/v1/sites/<site_id>/deploys`
      );
      status = response.data[0].state;

      if (status === 'error') {
        errorLogs = 'Netlify error logs are not available via API. Check the Netlify dashboard.';
      }
    }
  } catch (error) {
    console.error('Error fetching status:', error.message);
    return res.status(500).send('<h1>500 Internal Server Error</h1><p>Error fetching status from the platform.</p>');
  }

  let colorClass = 'unknown';
  let message = 'Unknown';

  if (status === 'success' || status === 'ready') {
    colorClass = 'success';
    message = 'Success';
  } else if (status === 'failure' || status === 'error') {
    colorClass = 'error';
    message = 'Error';
  } else if (status === 'in_progress' || status === 'building') {
    colorClass = 'building';
    message = 'Building';
  }

  res.status(200).send(`
    <style>
      .status { display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; border-radius: 5px; text-align: center; transition: background-color 0.3s ease; }
      .success { background-color: #4caf50; }
      .error { background-color: #f44336; }
      .building { background-color: #ffeb3b; color: #000; }
      .unknown { background-color: #9e9e9e; }
    </style>
    <div class="status ${colorClass}">${message}</div>
    <div class="error-logs">${status === 'error' || status === 'failure' ? `<h3>Error Logs:</h3><pre>${errorLogs}</pre>` : ''}</div>
  `);
});

// Vercel expects a handler function, so we export the app as a function
export default app;



/*
import express from 'express';
import axios from 'axios';
import { createServer } from 'http';

const app = express();

// Endpoint for deployment status
app.get('/', async (req, res) => {
  const platform = req.query.platform; // 'github' or 'netlify'
  const user = req.query.user; // GitHub username
  const repo = req.query.repo; // GitHub repository name
  let status = 'unknown';
  let errorLogs = '';

  if (!platform || !user || !repo) {
    const html = `
      <style>
        .status {
          display: inline-block;
          padding: 10px 20px;
          font-size: 16px;
          color: #fff;
          border-radius: 5px;
          text-align: center;
          transition: background-color 0.3s ease;
        }
        .error {
          background-color: #f44336;
        }
      </style>
      <div class="status error">
        Missing required query parameters: platform, user, or repo.
      </div>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.status(400).send(html);
    return;
  }

  try {
    if (platform === 'github' || platform === 'g') {
      const response = await axios.get(
        `https://api.github.com/repos/${user}/${repo}/pages/builds/latest`
      );
      const latestRun = response.data.workflow_runs[0];
      status = latestRun.status === 'completed' ? latestRun.conclusion : latestRun.status;

      if (status === 'failure' || status === 'error') {
        const logsResponse = await axios.get(latestRun.logs_url, {
          headers: { Accept: 'application/vnd.github.v3+json' }
        });
        errorLogs = logsResponse.data || 'No logs available.';
      }
    } else if (platform === 'netlify') {
      const response = await axios.get(
        `https://api.netlify.com/api/v1/sites/<site_id>/deploys`
      );
      status = response.data[0].state;

      if (status === 'error') {
        errorLogs = 'Netlify error logs are not available via API. Check the Netlify dashboard.';
      }
    }
  } catch (error) {
    console.error('Error fetching status:', error.message);
    res.status(500).send('<h1>500 Internal Server Error</h1><p>Error fetching status from the platform.</p>');
    return;
  }

  let colorClass = 'unknown';
  let message = 'Unknown';

  if (status === 'success' || status === 'ready') {
    colorClass = 'success';
    message = 'Success';
  } else if (status === 'failure' || status === 'error') {
    colorClass = 'error';
    message = 'Error';
  } else if (status === 'in_progress' || status === 'building') {
    colorClass = 'building';
    message = 'Building';
  }
  else  {
    colorClass = 'error';
    message = 'Not Found';
  }

  const html = `
    <style>
      .status {
        display: inline-block;
        padding: 10px 20px;
        font-size: 16px;
        color: #fff;
        border-radius: 5px;
        text-align: center;
        transition: background-color 0.3s ease;
      }
      .success {
        background-color: #4caf50;
      }
      .error {
        background-color: #f44336;
      }
      .building {
        background-color: #ffeb3b;
        color: #000;
      }
      .unknown {
        background-color: #9e9e9e;
      }
      .error-logs {
        margin-top: 20px;
        padding: 10px;
        border: 1px solid #f44336;
        background-color: #ffe6e6;
        color: #b71c1c;
        white-space: pre-wrap;
        font-family: monospace;
        max-height: 400px;
        overflow-y: auto;
      }
      .hidden {
        display: none;
      }
    </style>
    <div class="status ${colorClass}">
      ${message}
    </div>
    <div class="error-logs ${status === 'error' || status === 'failure' ? '' : 'hidden'}">
      <h3>Error Logs:</h3>
      <pre>${errorLogs}</pre>
    </div>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
*/