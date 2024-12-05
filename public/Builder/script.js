function toggleFields() {
  const platform = document.getElementById("platform").value;
  document.getElementById("user-group").style.display =
    platform === "github" ? "block" : "none";
  document.getElementById("repo-group").style.display =
    platform === "github" ? "block" : "none";
  document.getElementById("site-id-group").style.display =
    platform === "netlify" ? "block" : "none";
  document.getElementById("project-id-group").style.display =
    platform === "vercel" ? "block" : "none";
}

function buildURL() {
  const platform = document.getElementById("platform").value;
  const user = document.getElementById("user").value;
  const repo = document.getElementById("repo").value;
  const siteId = document.getElementById("site-id").value;
  const projectId = document.getElementById("project-id").value;
  const background = document.getElementById("background").value;
  const border = document.getElementById("border").value;
  const width = document.getElementById("width").value;
  const height = document.getElementById("height").value;
  const hideBorder = document.getElementById("hide-border").value;
  let url = `https://readme.deploystatus.mbktechstudio.com/?platform=${platform}`;
  if (platform === "github") {
    if (!user || !repo) {
      alert("Please fill in all required fields.");
      return;
    }
    url += `&user=${user}&repo=${repo}`;
  } else if (platform === "netlify") {
    if (!siteId) {
      alert("Please fill in all required fields.");
      return;
    }
    url += `&site-id=${siteId}`;
  } else if (platform === "vercel") {
    if (!projectId) {
      alert("Please fill in all required fields.");
      return;
    }
    url += `&project-id=${projectId}`;
  }
  if (background) {
    url += `&background=${background}`;
  }
  if (border) {
    url += `&border=${border}`;
  }
  if (width) {
    url += `&width=${width}`;
  }
  if (height) {
    url += `&height=${height}`;
  }
  url += `&hide_border=${hideBorder}`;
  const previewHtml = `<img src="${url}" alt="Deployment Status"><br><br><input type="text" value="${url}" id="url-output" readonly>`;
  document.getElementById("output").innerHTML = previewHtml;
  const markdown = `[![DeployStatus](${url})](https://github.com/MIbnEKhalid/github-readme-deploystatus)`;
  document.getElementById("markdown").innerText = markdown;
  const html = `<a href="https://github.com/MIbnEKhalid/github-readme-deploystatus"><img src="${url}" alt="DeployStatus" /></a>`;
  document.getElementById("html").innerText = html;
}

function copyText(type) {
  let text;
  if (type === "markdown") {
    text = document.getElementById("markdown").innerText;
  } else if (type === "html") {
    text = document.getElementById("html").innerText;
  }
  navigator.clipboard.writeText(text).then(() => {
    alert(
      `${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard`
    );
  });
}
// Initialize the form fields based on the selected platform
toggleFields();

function showMessage(message, heading) {
  document.querySelector(".messageWindow h2").innerText = heading;
  document.querySelector(".messageWindow p").innerHTML = message;
  document.querySelector(".blurWindow").classList.add("active");
  document.body.classList.add("blur-active");
}

function hideMessage() {
  const blurWindow = document.querySelector(".blurWindow");
  blurWindow.classList.add("fade-out");
  setTimeout(() => {
    blurWindow.classList.remove("active", "fade-out");
    document.body.classList.remove("blur-active");
  }, 500);
}

//showMessage("dsdsdsdsdu duak d Initialize the form fields based on the selected platformhs dhskhs skh", "Error");

function populateFieldsFromURL() {
  const params = new URLSearchParams(window.location.search);

  // Allowed platforms (case-insensitive)
  const allowedPlatforms = ["github", "netlify", "vercel"];

  // Map URL parameters to form fields
  const fieldMap = {
    platform: "platform",
    user: "user",
    repo: "repo",
    siteId: "site-id",
    projectId: "project-id",
    background: "background",
    border: "border",
    width: "width",
    height: "height",
    hide_border: "hide-border",
  };

  for (const [param, fieldId] of Object.entries(fieldMap)) {
    const value = params.get(param);
    if (value !== null) {
      const field = document.getElementById(fieldId);
      if (param === "platform") {
        const normalizedValue = value.toLowerCase();

        // Redirect to GitHub if platform is under development
        if (normalizedValue === "netlify" || normalizedValue === "vercel") {
          showMessage(
            `The ${
              normalizedValue.charAt(0).toUpperCase() + normalizedValue.slice(1)
            } platform is currently under development. Defaulting to GitHub.`,
            `${
              normalizedValue.charAt(0).toUpperCase() + normalizedValue.slice(1)
            } Platform Unavailable`
          );
          normalizedValue = "github"; // Default to GitHub
        }

        if (!allowedPlatforms.includes(normalizedValue)) {
          showMessage(`Invalid platform: ${value}`, "Parameter Error");
          return; // Exit the function if the platform is invalid
        } else {
          // Set the normalized value to match select options
          if (field) field.value = normalizedValue;
        }

        if (normalizedValue === "github") {
          if (!params.get("user")) {
            showMessage(
              "Missing required query parameter: user",
              "Parameter Error"
            );
            return;
          }
          if (!params.get("repo")) {
            showMessage(
              "Missing required query parameter: repo",
              "Parameter Error"
            );
            return;
          }
        } else if (normalizedValue === "vercel") {
          showMessage(
            "This platform is currently not available. Please check back soon.",
            "Vercel Platform Under Development"
          );
          if (!params.get("projectId")) {
            //    showMessage('Missing required query parameter: projectId', 'Parameter Error');
            return;
          }
          if (!params.get("teamId")) {
            //    showMessage('Missing required query parameter: teamId', 'Parameter Error');
            return;
          }
        } else if (normalizedValue === "netlify") {
          showMessage(
            "This platform is currently not available. Please check back soon.",
            "Netlify Platform Under Development"
          );
          if (!params.get("siteId")) {
            //    showMessage('Missing required query parameter: siteId', 'Parameter Error');
            return;
          }
        }
      } else if (field) {
        if (field.tagName === "SELECT") {
          field.value = value;
        } else if (field.tagName === "INPUT") {
          if (field.type === "checkbox") {
            field.checked = value === "true";
          } else {
            field.value = value;
          }
        }
      }
    }
    buildURL(); // Update the output fields
  }

  /*

    for (const [param, fieldId] of Object.entries(fieldMap)) {
        const value = params.get(param);
        if (value !== null) {
            const field = document.getElementById(fieldId);
            if (param === 'platform') {
                const normalizedValue = value.toLowerCase();
                if (!allowedPlatforms.includes(normalizedValue)) {
                    showMessage(`Invalid platform: ${value}`, 'Parameter Error');
                    return; // Exit the function if the platform is invalid
                } else {
                    // Set the normalized value to match select options
                    if (field) field.value = normalizedValue;
                }

                if (normalizedValue === 'github') {
                    if (!params.get('user')) {
                        showMessage('Missing required query parameter: user', 'Parameter Error');
                        return;
                    }
                    if (!params.get('repo')) {
                        showMessage('Missing required query parameter: repo', 'Parameter Error');
                        return;
                    }
                }

                else if (normalizedValue === 'vercel') {
                    if (!params.get('projectId')) {
                        showMessage('Missing required query parameter: projectId', 'Parameter Error');
                        return;
                    }
                    if (!params.get('teamId')) {
                        showMessage('Missing required query parameter: teamId', 'Parameter Error');
                        return;
                    }
                } else if (normalizedValue === 'netlify') {
                    if (!params.get('siteId')) {
                        showMessage('Missing required query parameter: siteId', 'Parameter Error');
                        return;
                    }
                }

            }
            else if (field) {
                if (field.tagName === 'SELECT') {
                    field.value = value;
                }
                else if (field.tagName === 'INPUT') {
                    if (field.type === 'checkbox') {
                        field.checked = value === 'true';
                    } else {
                        field.value = value;
                    }
                }
            }
        }
        buildURL(); // Update the output fields
    }
*/

  toggleFields(); // Adjust visibility of platform-specific fields
}

document.addEventListener("DOMContentLoaded", () => {
  populateFieldsFromURL();
});
