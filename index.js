import express from "express";
import axios from "axios";
import path from "path"
import { fileURLToPath } from "url"
import { SpeedInsights } from "@vercel/speed-insights/next";


const app = express();
// const token = process.env.GITHUB_TOKEN;


// Prevent HTTP cache
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use("/Builder", express.static(path.join(__dirname, "public/Builder")));


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
      <rect width="${width}" height="${height}" fill="${bgColor}" rx="10" ry="10" stroke="${borderColor}" stroke-width="3" />
      <text x="${width / 2}" y="${height / 2
    }" fill="${statusColor}" font-size="${fontSize}" font-family="Arial, sans-serif" text-anchor="middle" alignment-baseline="middle">
        ${status}
      </text> 
    </svg>
  `;

};



async function fetchInsights(url) {
  const options = {
    strategy: "mobile", // or "desktop"
  };

  try {
    const insights = await getInsights(url, options);
    console.log(insights);
    return insights;
  } catch (error) {
    console.error("Error fetching speed insights:", error);
  }
}

fetchInsights("https://readme.deploystatus.mbktechstudio.com/");

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});


export default app