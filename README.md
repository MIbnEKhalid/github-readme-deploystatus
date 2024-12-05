# Github Readme Deploy Status

### Note Project Is Still UnderDevelopment

<p style="text-align:center"> 
    <a href="https://vercel.com/new/clone?repository-url=https://github.com/mibnekhalid/github-readme-deploystatus">
        <img src="https://vercel.com/button" alt="Deploy with Vercel" width="150" height="50" />
    </a>
</p>

**Use This Website to Build Badge: https://readme.deploystatus.mbktechstudio.com/Builder/**


## 🚀 Introduction
GitHub Readme Deploy Status is a simple tool to display the deployment status of your projects directly in your GitHub README file. It supports multiple platforms like GitHub, Netlify, and Vercel, giving users a dynamic way to monitor the deployment status of their repositories.


## 🛠 How to Use the Badge

After generating your badge using the **[Builder Tool Page](https://readme.deploystatus.mbktechstudio.com/Builder/)**, you can easily include it in your GitHub repository's README file. Simply copy the generated Markdown or HTML code and paste it into your README.

- **Markdown example:**
  ```markdown
  ![Deployment Status](https://readme.deploystatus.mbktechstudio.com/?platform=github&user=mibnekhalid&repo=MIbnEKhalid.github.io&background=fff&hide_border=false&border=ff0&width=200&height=50)
  ```
  ![Deployment Status](https://readme.deploystatus.mbktechstudio.com/?platform=github&user=mibnekhalid&repo=MIbnEKhalid.github.io&background=fff&hide_border=false&border=ff0&width=200&height=50)
- **HTML example:**

  ```html
  <a href="https://github.com/MIbnEKhalid/github-readme-deploystatus">
      <img src="https://readme.deploystatus.mbktechstudio.com/?platform=github&user=mibnekhalid&repo=MIbnEKhalid.github.io&background=000&hide_border=true&border=ff0" alt="DeployStatus" />
  </a>
  ```
     <img src="https://readme.deploystatus.mbktechstudio.com/?platform=github&user=mibnekhalid&repo=MIbnEKhalid.github.io&background=000&hide_border=true&border=ff0" alt="DeployStatus" />

 

 


## 🔧 Options

The `platform` field is the most important parameter.

- If `platform=github`, then the `user` and `repo` parameters are required.
- If `platform=netlify`, then either the `siteid`, `name`, or `projectid` parameter is required.
- If `platform=vercel`, then either the `siteid`, `name`, or `projectid` parameter is required.

Note: Only one should be used, either `name` or `siteid`.

**Important Note:** The `theme` parameter doesn't work for now. The design is currently basic, but improvements and parameter handling will be addressed soon.

| Parameter       | Details                                                                 | Example                                                                                          |
|-----------------|-------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| `platform`      | The platform to check the status for (`github`, `netlify`, `vercel`).  | `github`, `netlify`, `vercel`                                                                    |
| `user`          | GitHub username who owns the repository                                | `mibnekhalid`                                                                                    |
| `repo`          | GitHub repository to check the status for                              | `DeployStatus`                                                                                   |
| `siteid` / `projectid`       | Site ID of the Netlify or Vercel project to check the status for        | `adsfsffgaw33r242234324`                                                                         |
| `name`          | Name of the Netlify or Vercel project to check the status for           | `adsfsffgaw33r242234324`                                                                         |
| `theme`         | The theme to apply (Default: `default`)                                 | `dark`, `radical`, etc. [🎨➜](./docs/themes.md)                                                   |
| `hide_border`   | Make the border transparent (Default: `false`)                          | `true` or `false`                                                                                |
| `background`    | Background color (e.g., `f2f2f2`, `35,d22,00f`)                         | **hex code** without `#`, **CSS color**, or gradient in the form `angle,start_color,...,end_color` |
| `border`        | Border color                                                            | **hex code** without `#` or **CSS color**                                                        |
| `width`         | Width of the card in pixels (Default: `200`)                            |                                                                                                  |
| `height`        | Height of the card in pixels (Default: `50`)                            |                                                                                                  |


## 🚀 Building the Project

To build the project, follow these steps:

1. **Clone the repository:**
    ```sh
    git clone https://github.com/mibnekhalid/github-readme-deploystatus.git
    cd github-readme-deploystatus
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Build the project:**
    ```sh
    npm run build
    ```

4. **Run the project locally:**
    ```sh
    npm start
    ```

5. **Open your browser and navigate to:**
    ```
    http://localhost:3000
    ```

You should now see the project running locally on your machine.

## 🔧 Customizing the Project URL

To customize the project URL in the `public/Builder/script.js` file, follow these steps:

1. **Open the `public/Builder/script.js` file in your preferred code editor.**

2. **Locate the `buildURL()` function.**

3. **Find the line where the `url` constant is defined:**
    ```js
    let url = `https://readme.deploystatus.mbktechstudio.com/?platform=${platform}`;
    ```

4. **Modify the `url` constant to use your desired domain (e.g., Vercel, local, or custom domain):**
    ```js
    let url = `https://your-custom-domain.com/?platform=${platform}`;
    ```

5. **Find the `Markdown` and `HTML` badge generation code inside the `buildURL()` function:**
   ```js
   const markdown = `[![DeployStatus](${url})](https://github.com/MIbnEKhalid/github-readme-deploystatus)`;

   const html = `<a href="https://github.com/MIbnEKhalid/github-readme-deploystatus"><img src="${url}" alt="DeployStatus" /></a>`; 
   ```

6. **Modify or remove the GitHub repository links** in both the Markdown and HTML generation code if needed:
   - Change the link to your own GitHub repo
   ```js
   const markdown = `[![DeployStatus](${url})](https://github.com/your-username/your-repo)`;
   
   const html = `<a href="https://github.com/your-username/your-repo"><img src="${url}" alt="DeployStatus" /></a>`;
   ```
   - Or Remove It
   ```js
   const markdown = `![DeployStatus](${url})`;
   
   const html = `<img src="${url}" alt="DeployStatus" />`;
   ```



7. **Save the changes and rebuild the project:**
    ```sh
    npm run build
    ```

### Why Customize?
   - **Badge URL:** By customizing the URL in the script, you ensure that the badge or deployment status links point to your project’s own version, not to my project’s version.   
   - **GitHub Links:** Customizing the repository links allows you to either point to your own GitHub project or remove the links entirely, ensuring the badge reflects your project accurately.


By following these steps, you’ll ensure the badge builder reflects your project setup, and the generated Markdown/HTML badge will link to your repository or custom location.


 
 
## License
 

**Note:** Only The Source Code Of This Website Is Covered Under The **[MIT License](https://opensource.org/license/mit)**.  
The Project Documentation Covered Under The **[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/)** But Some **Images, Blog Posts, And Other Content Are NOT  
Covered Under This License And Remain The Intellectual Property Of The Author**.

See the [LICENSE](LICENSE.md) file for details.
 
## Contact

For questions or contributions, please contact Muhammad Bin Khalid at [mbktechstudio.com/Support](https://mbktechstudio.com/Support/?Project=github-readme-deploystatus), [support@mbktechstudio.com](mailto:support@mbktechstudio.com) or [chmuhammadbinkhalid28.com](mailto:chmuhammadbinkhalid28.com).
