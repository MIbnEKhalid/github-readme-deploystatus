import express from "express";
import axios from "axios";
//import { SpeedInsights } from "@vercel/speed-insights/next";

const app = express();
const token = process.env.GITHUB_TOKEN;

const generateSVG = (status, options) => {
  const {
    background = "333333", // Default background
    theme = "light", // Default theme
    hide_border = "false", // Default hide_border
    border = "000000", // Default border color
    width = 200, // Default width
    height = 50, // Default height
  } = options;

  // Convert string flags to boolean
  const hideBorder = hide_border === "true";

  // Ensure valid hex color format
  const validHex = (color) => /^([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(color);

  const bgColor = validHex(background) ? `#${background}` : "#ffffff";
  const borderColor = hideBorder
    ? "none"
    : validHex(border)
      ? `#${border}`
      : "#000000";

  const themes = {
    light: { textColor: "#000000" },
    dark: { textColor: "#ffffff" },
  };

  const textColor = themes[theme]?.textColor || "#000000";

  let statusColor = "#9e9e9e"; // Default for 'unknown'
  if (status === "success") statusColor = "#4caf50";
  else if (status === "building") statusColor = "#ffeb3b";
  else if (status === "failed") statusColor = "#f44336";

  // Calculate font sizes and positioning based on SVG width and height
  const fontSize = Math.min(width / 12, 30); // Limit max font size to a reasonable size based on width

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="${bgColor}" rx="10" ry="10" stroke="${borderColor}" stroke-width="2" />
      <text x="${width / 2}" y="${height / 2
    }" fill="${statusColor}" font-size="${fontSize}" font-family="Arial, sans-serif" text-anchor="middle" alignment-baseline="middle">
        ${status}
      </text> 
    </svg>
  `;
};

app.get("/", async (req, res) => {
  const {
    platform,
    user,
    repo,
    siteid,
    projectid,
    projectname,
    teamid,
    theme,
    background,
    hide_border,
    border,
    width,
    height,
  } = req.query;

  // Validate required parameters
  if (!platform) {
    res
      .status(400)
      .send("Missing required query parameters: platform.");
    return;
  }

  if (platform.toLowerCase() !== "github" && platform.toLowerCase() !== "g" && platform.toLowerCase() !== "netlify" &&
    platform.toLowerCase() !== "n" && platform.toLowerCase() !== "vercel" && platform.toLowerCase() !== "v") {
    res.status(400).send("Currently, only the GitHub platform is supported.");
    res.status(400).send("Incorrect platform naming. Netlify, vercel and github are the only supported platforms.");
    return;
  }

  // Validate required parameters for github
  if ((platform.toLowerCase() === "github" || platform.toLowerCase() === "g") && !user) {
    res
      .status(400)
      .send("Missing required query parameters: user");
    return;
  }

  if ((platform.toLowerCase() === "github" || platform.toLowerCase() === "g") && !repo) {
    res
      .status(400)
      .send("Missing required query parameters: repo.");
    return;
  }

  // Validate required parameters for vercel
  if ((platform.toLowerCase() === "vercel" || platform.toLowerCase() === "g") && !projectid) {
    res
      .status(400)
      .send("Missing required query parameters: projectid");
    return;
  }

  if ((platform.toLowerCase() === "vercel" || platform.toLowerCase() === "g") && !teamid) {
    res
      .status(400)
      .send("Missing required query parameters: teamid.");
    return;
  }

  // Validate required parameters for netlify
  if ((platform.toLowerCase() === "netlify" || platform.toLowerCase() === "n") && !siteid)  {
    res
      .status(400)
      .send("Missing required query parameters: siteid or projectname");
    return;
  }

  if (platform.toLowerCase() === "github" || platform.toLowerCase() === "g") {
    try {
      let status = "unknown";
      let errorLogs = "";

      // Set width and height for SVG
      const svgWidth = width ? parseInt(width) : 200;
      const svgHeight = height ? parseInt(height) : 50;

      // Check platform (GitHub or Netlify)
      if (platform === "github" || platform === "g") {
        const response = await axios.get(
          `https://api.github.com/repos/${user}/${repo}/actions/runs`,
          {
            method: "GET",
            headers: {
              // Uncomment and use a token if your API requests exceed rate limits or the repository is private
              // 'Authorization': `token ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        // Extract workflow runs data
        const runs = response.data.workflow_runs || [];
        if (runs.length === 0) {
          throw new Error("No workflow runs found.");
        }

        const latestRun = runs[0];
        status = latestRun.conclusion || latestRun.status || "unknown"; // Get status or conclusion
        console.log(latestRun);

        // If the status is failure or error, fetch logs
        if (status === "failure" || status === "error") {
          const logsResponse = await axios.get(latestRun.logs_url, {
            headers: { Accept: "application/vnd.github.v3+json" },
          });
          errorLogs = logsResponse.data || "No logs available.";
        }
      }

      // Generate SVG response based on status
      const svg = generateSVG(
        status === "success" || status === "ready"
          ? "success"
          : status === "building" ||
            status === "in_progress" ||
            status === "queued"
            ? "building"
            : "failed",
        {
          theme,
          background,
          hide_border,
          border,
          width: svgWidth,
          height: svgHeight,
        }
      );

      res.setHeader("Content-Type", "image/svg+xml");
      res.send(svg);
    } catch (error) {
      console.error("Error fetching status:", error.message);
      res
        .status(500)
        .send(
          "<h1>500 Internal Server Error</h1><p>Error fetching status from the platform.</p>"
        );
    }
  }

  if (platform.toLowerCase() === "netlify" || platform.toLowerCase() === "n") {
    try {
      let status = "unknown";

      // Set width and height for SVG
      const svgWidth = width ? parseInt(width) : 200;
      const svgHeight = height ? parseInt(height) : 50;

      const response = await axios.get(
        `https://api.netlify.com/api/v1/sites/${siteid}/deploys`,
        {
          headers: {
        Accept: "application/json",
          },
        }
      );

      // Extract deploys data
      const deploys = response.data || [];
      if (deploys.length === 0) {
        throw new Error("No deploys found.");
      }

      const latestDeploy = deploys[0];
      status = latestDeploy.state || "unknown"; // Get deploy state

      // Generate SVG response based on status
      const svg = generateSVG(
        status === "ready"
          ? "success"
          : status === "building"
          ? "building"
          : "failed",
        {
          theme,
          background,
          hide_border,
          border,
          width: svgWidth,
          height: svgHeight,
        }
      );

      res.setHeader("Content-Type", "image/svg+xml");
      res.send(svg);
    } catch (error) {
      console.error("Error fetching status:", error.message);
      res
        .status(500)
        .send(
          "<h1>500 Internal Server Error</h1><p>Error fetching status from Netlify.</p>"
        );
    }
  }

  if (platform.toLowerCase() === "vercel" || platform.toLowerCase() === "v") {
    res
      .status(400)
      .send(
        "We are sorry, the Vercel deploy status badge is currently under development. Currently, only the GitHub platform is supported."
      );
    return;
  }

});


app.get("/Builder", async (req, res) => {
  
  res.send(`    

    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>URL Builder</title>
    <style>
        body {
            font-family: 'Roboto', sans-serif;
            background: linear-gradient(135deg, #0d1117, #161b22);
            color: #c9d1d9;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            padding: 20px;
            flex-direction: column;
            min-height: 100vh;
        }

        h1 {
            color: #ffffff;
            text-align: center;
            margin-bottom: 20px;
            font-size: 2.5em;
            text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        }

        .container {
            display: flex;
            background: #161b22;
            padding: 10px;
            border-radius: 15px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
            max-width: 900px;
            width: 100%;
            flex-direction: row;
            transition: transform 0.3s;
        }

        .builder,
        .output-container {
            flex: 1;
            padding: 20px;
        }

        .builder {
            border-right: 1px solid #21262d;
        }

        h2 {
            text-align: center;
            margin-bottom: 20px;
            color: #58a6ff;
            font-size: 1.8em;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: #c9d1d9;
        }

        .form-group input,
        .form-group select {
            width: 100%;
            padding: 12px;
            box-sizing: border-box;
            border: 1px solid #30363d;
            border-radius: 5px;
            background-color: #0d1117;
            color: #c9d1d9;
            transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus {
            border-color: #58a6ff;
            outline: none;
        }

        button {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #238636, #2ea043);
            color: #ffffff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s, transform 0.3s;
        }

        button:hover {
            background: linear-gradient(135deg, #2ea043, #238636);
            transform: scale(1.05);
        }

        .output {
            margin-top: 20px;
            padding: 15px;
            background: #0d1117;
            border-radius: 5px;
            word-break: break-all;
            color: #c9d1d9;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        }

        .output img {
            max-width: 100%;
            border-radius: 5px;
        }

        .copy-button {
            margin-top: 10px;
            padding: 10px;
            background: linear-gradient(135deg, #238636, #2ea043);
            color: #ffffff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s, transform 0.3s;
        }

        .copy-button:hover {
            background: linear-gradient(135deg, #2ea043, #238636);
            transform: scale(1.05);
        }

        .output input {
            width: 100%;
            padding: 10px;
            margin-top: 10px;
            border: 1px solid #30363d;
            border-radius: 5px;
            background-color: #0d1117;
            color: #c9d1d9;
            box-sizing: border-box;
            transition: border-color 0.3s;
        }

        .output input:focus {
            border-color: #58a6ff;
            outline: none;
        }

        @media (max-width: 768px) {
            .container {
                flex-direction: column;
            }

            .builder {
                border-right: none;
                border-bottom: 1px solid #21262d;
            }
        }
    </style>
    <style>
        .github-widget {
            background-color: #0d1117;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 10px 15px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
            display: inline-flex;
            align-items: center;
            transition: box-shadow 0.3s ease, border-color 0.3s ease;
            margin-bottom: 15px;
            transition: transform 0.3s;
        }

        .github-widget:hover {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.8);
            border-color: #58a6ff;
        }

        .github-link {
            text-decoration: none;
            color: #ffffff;
            font-size: 14px;
            font-weight: bold;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .github-link:hover {
            color: #f0f0f0;
        }

        .github-logo {
            width: 20px;
            height: 20px;
        }
    </style>
</head>

<body>
    <h1>🔥 GitHub Readme Deploy Status</h1>
    <div class="github-widget">
        <a href="https://github.com/MIbnEKhalid/github-readme-deploystatus"
            title="MIbnEKhalid/github-readme-deploystatus" target="_blank" class="github-link">
            <!-- SVG for GitHub Logo -->
            <svg class="github-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff">
                <path
                    d="M12 .296c-6.63 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.07c-3.338.726-4.033-1.416-4.033-1.416-.546-1.384-1.333-1.754-1.333-1.754-1.09-.744.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.305 3.495.998.108-.775.42-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.47-2.38 1.235-3.22-.135-.302-.54-1.515.105-3.16 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.645.24 2.858.12 3.16.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.435.372.81 1.11.81 2.235v3.31c0 .315.21.69.825.575C20.565 22.09 24 17.592 24 12.296c0-6.627-5.373-12-12-12" />
            </svg>
            View on GitHub
        </a>
    </div>


    <div class="container">

        <div class="builder">

            <h2>URL Builder</h2>

            <button onclick="buildURL()">Build URL</button>
            <br>
            <br>

            <div class="form-group">
                <label for="platform">Platform</label>
                <select id="platform" onchange="toggleFields()">
                    <option value="github">GitHub</option>
                    <option value="netlify">Netlify</option>
                    <option value="vercel">Vercel</option>
                </select>
            </div>

            <div class="form-group" id="user-group">
                <label for="user">User</label>
                <input type="text" id="user" placeholder="GitHub username" value="MIbnEKhalid">
            </div>

            <div class="form-group" id="repo-group">
                <label for="repo">Repo</label>
                <input type="text" id="repo" placeholder="GitHub repository" value="MIbnEKhalid.github.io">
            </div>

            <div class="form-group" id="site-id-group" style="display: none;">
                <label for="site-id">Site ID</label>
                <input type="text" id="site-id" placeholder="Netlify Site ID">
            </div>

            <div class="form-group" id="project-id-group" style="display: none;">
                <label for="project-id">Project ID</label>
                <input type="text" id="project-id" placeholder="Vercel Project ID">
            </div>
            <div class="form-group">
                <label for="background">Background (optional)</label>
                <input type="text" id="background" placeholder="e.g., 333333">
            </div>

            <div class="form-group">
                <label for="border">Border (optional)</label>
                <input type="text" id="border" placeholder="e.g., ff0">
            </div>

            <div class="form-group">
                <label for="width">Width (optional)</label>
                <input type="number" id="width" placeholder="e.g., 200">
            </div>

            <div class="form-group">
                <label for="height">Height (optional)</label>
                <input type="number" id="height" placeholder="e.g., 50">
            </div>

            <div class="form-group">
                <label for="hide-border">Hide Border</label>
                <select id="hide-border">
                    <option value="false">False</option>
                    <option value="true">True</option>
                </select>
            </div>
            <button onclick="buildURL()">Build URL</button>

        </div>

        <div class="output-container">
            <h2>Preview</h2>
            <div class="output" id="output"></div>
            <h2>Markdown</h2>
            <div class="output" id="markdown"></div>
            <button class="copy-button" onclick="copyText('markdown')">Copy Markdown</button>
            <h2>HTML</h2>
            <div class="output" id="html"></div>
            <button class="copy-button" onclick="copyText('html')">Copy HTML</button>
        </div>
    </div>

    <script>
        function toggleFields() {
            const platform = document.getElementById('platform').value;
            document.getElementById('user-group').style.display = platform === 'github' ? 'block' : 'none';
            document.getElementById('repo-group').style.display = platform === 'github' ? 'block' : 'none';
            document.getElementById('site-id-group').style.display = platform === 'netlify' ? 'block' : 'none';
            document.getElementById('project-id-group').style.display = platform === 'vercel' ? 'block' : 'none';
        }

        function buildURL() {
            const platform = document.getElementById('platform').value;
            const user = document.getElementById('user').value;
            const repo = document.getElementById('repo').value;
            const siteId = document.getElementById('site-id').value;
            const projectId = document.getElementById('project-id').value;
            const background = document.getElementById('background').value;
            const border = document.getElementById('border').value;
            const width = document.getElementById('width').value;
            const height = document.getElementById('height').value;
            const hideBorder = document.getElementById('hide-border').value;

            let url = \`https://readme.deploystatus.mbktechstudio.com/?platform=\${platform}\`;

            if (platform === 'github') {
                if (!user || !repo) {
                    alert('Please fill in all required fields.');
                    return;
                }
                url += \`&user=\${user}&repo=\${repo}\`;
            } else if (platform === 'netlify') {
                if (!siteId) {
                    alert('Please fill in all required fields.');
                    return;
                }
                url += \`&site-id=\${siteId}\`;
            } else if (platform === 'vercel') {
                if (!projectId) {
                    alert('Please fill in all required fields.');
                    return;
                }
                url += \`&project-id=\${projectId}\`;
            }

            if (background) {
                url += \`&background=\${background}\`;
            }
            if (border) {
                url += \`&border=\${border}\`;
            }
            if (width) {
                url += \`&width=\${width}\`;
            }
            if (height) {
                url += \`&height=\${height}\`;
            }
            url += \`&hide_border=\${hideBorder}\`;

            const previewHtml = \`<img src="\${url}" alt="Deployment Status"><br><br><input type="text" value="\${url}" id="url-output" readonly>\`;
            document.getElementById('output').innerHTML = previewHtml;

            const markdown = \`[![DeployStatus](\${url})](\${url})\`;
            document.getElementById('markdown').innerText = markdown;

            const html = \`<a href="\${url}"><img src="\${url}" alt="DeployStatus" /></a>\`;
            document.getElementById('html').innerText = html;
        }

        function copyText(type) {
            let text;
            if (type === 'markdown') {
                text = document.getElementById('markdown').innerText;
            } else if (type === 'html') {
                text = document.getElementById('html').innerText;
            }
            navigator.clipboard.writeText(text).then(() => {
                alert(\`\${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard\`);
            });
        }

        // Initialize the form fields based on the selected platform
        toggleFields();
    </script>
</body>

</html>

  `);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

export default app
