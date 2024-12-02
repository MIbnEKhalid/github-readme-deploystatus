import express from 'express';
import axios from 'axios';

const app = express();

const generateSVG = (status, message, options) => {
  const {
    background = 'ffffff', // Default background
    theme = 'light',       // Default theme
    hide_border = 'false', // Default hide_border
    border = '000000',     // Default border color
    width = 400,           // Default width
    height = 150           // Default height
  } = options;

  // Convert string flags to boolean
  const hideBorder = hide_border === 'true';

  // Ensure valid hex color format
  const validHex = (color) => /^([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(color);

  const bgColor = validHex(background) ? `#${background}` : '#ffffff';
  const borderColor = hideBorder ? 'none' : validHex(border) ? `#${border}` : '#000000';

  const themes = {
    light: { textColor: '#000000' },
    dark: { textColor: '#ffffff' },
  };

  const textColor = themes[theme]?.textColor || '#000000';

  let statusColor = '#9e9e9e'; // Default for 'unknown'
  if (status === 'success') statusColor = '#4caf50';
  else if (status === 'building') statusColor = '#ffeb3b';
  else if (status === 'failed') statusColor = '#f44336';

  // Calculate font sizes and positioning based on SVG width and height
  const fontSize = Math.min(width / 12, 30); // Limit max font size to a reasonable size based on width
  const subTextFontSize = Math.min(width / 20, 16); // For the status text

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="${bgColor}" rx="10" ry="10" stroke="${borderColor}" stroke-width="2" />
      <text x="${width / 2}" y="${height / 3}" fill="${statusColor}" font-size="${fontSize}" font-family="Arial, sans-serif" text-anchor="middle" alignment-baseline="middle">
        ${message}
      </text>
      <text x="${width / 2}" y="${height - 30}" fill="${textColor}" font-size="${subTextFontSize}" font-family="Arial, sans-serif" text-anchor="middle" alignment-baseline="middle">
        Status: ${status}
      </text>
    </svg>
  `;
};

app.get('/', async (req, res) => {
  const { platform, user, repo, theme, background, hide_border, border, width, height } = req.query;

  // Validate required parameters
  if (!platform || !user || !repo) {
    res.status(400).send('Missing required query parameters: platform, user, or repo.');
    return;
  }

  if (platform.toLowerCase() !== 'github') {
    res.status(400).send('Currently, only the GitHub platform is supported.');
    return;
  }

  try {
    let status = 'unknown';
    let errorLogs = '';
    let message = 'Unknown';

    // Set width and height for SVG
    const svgWidth = width ? parseInt(width) : 400;
    const svgHeight = height ? parseInt(height) : 150;

    // Check platform (GitHub or Netlify)
    if (platform === 'github' || platform === 'g') {
      const response = await axios.get(`https://api.github.com/repos/${user}/${repo}/actions/runs`, {
        method: 'GET',
        headers: {
          // Uncomment and use a token if your API requests exceed rate limits or the repository is private
          // 'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      console.log(response);

      // Extract workflow runs data
      const runs = response.data.workflow_runs || [];
      if (runs.length === 0) {
        throw new Error('No workflow runs found.');
      }

      const latestRun = runs[0];
      status = latestRun.conclusion || latestRun.status || 'unknown'; // Get status or conclusion

      // If the status is failure or error, fetch logs
      if (status === 'failure' || status === 'error') {
        const logsResponse = await axios.get(latestRun.logs_url, {
          headers: { Accept: 'application/vnd.github.v3+json' }
        });
        errorLogs = logsResponse.data || 'No logs available.';
      }

      // Message based on the status
      if (status === 'success') {
        message = 'Deployed Successfully';
      } else if (status === 'in_progress' || status === 'queued') {
        message = 'Deployment In Progress';
      } else if (status === 'failure' || status === 'error') {
        message = 'Deployment Failed';
      }

    } else if (platform === 'netlify' || platform === 'n') {
      const response = await axios.get(
        `https://api.netlify.com/api/v1/sites/<site_id>/deploys`,
        {
          headers: {
            'Authorization': `Bearer ${netlifyToken}` // You need to provide a Netlify API token here
          }
        }
      );
console.log(response);
      status = response.data[0].state;

      // Handle Netlify status
      if (status === 'error') {
        errorLogs = 'Netlify error logs are not available via API. Check the Netlify dashboard.';
      }

      // Set message for Netlify deployment status
      if (status === 'ready') {
        message = 'Deployed Successfully';
      } else if (status === 'building') {
        message = 'Deployment In Progress';
      } else if (status === 'error') {
        message = 'Deployment Failed';
      }
    }

    // Generate SVG response based on status
    const svg = generateSVG(
      status === 'success' || status === 'ready' ? 'success' : status === 'building' || status === 'in_progress' ? 'building' : 'failed',
      message,
      { theme, background, hide_border, border, width: svgWidth, height: svgHeight }
    );

    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);

  } catch (error) {
    console.error('Error fetching status:', error.message);
    res.status(500).send('<h1>500 Internal Server Error</h1><p>Error fetching status from the platform.</p>');
  }

});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

export default app;
