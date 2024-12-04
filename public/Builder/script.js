
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
    let url = `https://readme.deploystatus.mbktechstudio.com/?platform=${platform}`;
    if (platform === 'github') {
        if (!user || !repo) {
            alert('Please fill in all required fields.');
            return;
        }
        url += `&user=${user}&repo=${repo}`;
    } else if (platform === 'netlify') {
        if (!siteId) {
            alert('Please fill in all required fields.');
            return;
        }
        url += `&site-id=${siteId}`;
    } else if (platform === 'vercel') {
        if (!projectId) {
            alert('Please fill in all required fields.');
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
    document.getElementById('output').innerHTML = previewHtml;
    const markdown = `[![DeployStatus](${url})](${url})`;
    document.getElementById('markdown').innerText = markdown;
    const html = `<a href="${url}"><img src="${url}" alt="DeployStatus" /></a>`;
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
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard`);
    });
}
// Initialize the form fields based on the selected platform
toggleFields();