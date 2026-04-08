# How to Deploy the Precariat Opportunity Engine
### A no-coding-experience-required, step-by-step guide

This guide will walk you through getting your app live on the internet at a real URL like `precariat-engine.vercel.app` (or even your own domain). No prior coding or deployment experience needed. Total time: **about 30-45 minutes**.

By the end you'll have:
- Your app running live on the internet
- A secure setup where your API key stays hidden on the server
- The ability to update your app anytime by editing files on GitHub

---

## What You'll Need

Three free accounts. Sign up for these first if you don't already have them:

1. **Anthropic Console** — for the API key — https://console.anthropic.com
2. **GitHub** — to store your code — https://github.com/signup
3. **Vercel** — to host your app for free — https://vercel.com/signup (sign up with your GitHub account when prompted, that makes things easier)

You'll also need the **`precariat-engine` folder** that came with this guide. Unzip it somewhere you can find it, like your Desktop.

---

## Part 1 — Get Your Anthropic API Key

Your app uses Claude (the AI) to analyze projects, search the web, and write applications. You need an API key for that.

1. Go to https://console.anthropic.com and sign in.
2. Click **"API Keys"** in the left sidebar (or top menu).
3. Click **"Create Key"**.
4. Give it a name like `Precariat Engine` and click Create.
5. **IMPORTANT:** Copy the key that appears (it starts with `sk-ant-api03-...`) and paste it somewhere safe like a notes app. **You will not be able to see this key again** after you close the dialog.
6. Add some credits to your account: click **"Plans & Billing"** → **"Add Credits"**. $10-20 is plenty to start. (Each project analysis costs roughly 2-5 cents.)

✅ You now have an API key. Keep it handy for Part 4.

---

## Part 2 — Put Your Code on GitHub

GitHub is like Google Drive for code. Vercel will pull your code from here to publish your app.

### Option A: Using the GitHub Website (easiest, no installs needed)

1. Go to https://github.com and sign in.
2. Click the **"+"** button in the top right corner → **"New repository"**.
3. **Repository name:** type `precariat-engine` (or whatever you want)
4. Set it to **Private** (recommended — only you can see it).
5. **Do not** check any of the "Add a README" boxes.
6. Click **"Create repository"**.
7. On the next page you'll see a section that says "uploading an existing file". Click the link **"uploading an existing file"** (it's a blue link in the middle of the page).
8. Now open your `precariat-engine` folder on your computer.
9. Select **all** the files and folders inside it (NOT the `precariat-engine` folder itself — go inside it first), then drag them all into the GitHub upload area. This includes:
   - `api` folder
   - `src` folder
   - `.env.example`
   - `.gitignore`
   - `HOW_TO_DEPLOY.md`
   - `index.html`
   - `package.json`
   - `README.md`
   - `vercel.json`
   - `vite.config.js`
10. Wait for them all to finish uploading (you'll see a progress bar for each).
11. Scroll down. In the "Commit changes" box, type something like `Initial upload`.
12. Click the green **"Commit changes"** button.

✅ Your code is now on GitHub. You should see all the files listed on the repo page.

> **Note about the `.env.local` file:** You might be wondering about an API key file. **Don't worry** — you should never upload your actual API key to GitHub. The `.gitignore` file already prevents this. We'll add the key directly to Vercel in Part 4 instead, where it stays private.

---

## Part 3 — Connect Vercel to Your GitHub

Vercel is where your app will actually live. The free tier is more than enough for this.

1. Go to https://vercel.com and sign in (use the "Continue with GitHub" button — this saves a lot of friction).
2. If asked, **authorize Vercel to access your GitHub account**.
3. Once you're in the Vercel dashboard, click **"Add New..."** in the top right → **"Project"**.
4. You'll see a list of your GitHub repositories. Find **`precariat-engine`** in the list and click the **"Import"** button next to it.
   - If you don't see it, click "Adjust GitHub App Permissions" and grant Vercel access to that repo.
5. On the configuration screen:
   - **Project Name:** leave it as `precariat-engine` (or change it — this becomes part of your URL)
   - **Framework Preset:** Vercel should auto-detect "Vite". If not, select it from the dropdown.
   - **Root Directory:** leave as `./`
   - **Build Command, Output Directory, Install Command:** leave as default
6. **DON'T click Deploy yet!** First, expand the **"Environment Variables"** section.

---

## Part 4 — Add Your API Key to Vercel

This is the secure way to give your app access to Claude. The key lives on Vercel's servers and is never visible in your browser or code.

1. Still on the Vercel deploy configuration screen, in the **Environment Variables** section:
2. **Name (or Key):** type exactly `ANTHROPIC_API_KEY` (case-sensitive, no spaces)
3. **Value:** paste your API key from Part 1 (the one starting with `sk-ant-api03-...`)
4. Click **"Add"** (or just tab away — it should save automatically).
5. Now click the big **"Deploy"** button.

Wait 1-2 minutes. You'll see a build log scrolling. When it's done you'll see **🎉 Congratulations!** and a screenshot of your app.

6. Click **"Continue to Dashboard"**.
7. On the dashboard, click your project → click the **Visit** button (top right) or click the URL shown (something like `precariat-engine.vercel.app`).

✅ **Your app is live!** Open it and try it out. Add a project, upload a screenplay, hit Analyze.

---

## Part 5 — Test That Everything Works

1. Open your live URL.
2. Go to **Projects** tab → click **+ New Project**.
3. Fill in a title and synopsis.
4. Scroll down to **Project Materials** and upload a PDF (screenplay or pitch deck if you have one).
5. Click **Save Project**.
6. Back on the Projects list, click **🔬 Analyze**.
7. Wait 30-60 seconds. You should see a full intelligence report appear.

If that worked, congratulations — **everything is set up correctly**.

If it didn't work, see **Troubleshooting** at the bottom.

---

## Part 6 — (Optional) Use Your Own Domain

If you have a domain like `precariatproductions.com` and want your app at `engine.precariatproductions.com`:

1. In your Vercel project dashboard, go to **Settings** → **Domains**.
2. Type your domain (e.g., `engine.precariatproductions.com`) and click **Add**.
3. Vercel will show you DNS records to add. Go to wherever you bought your domain (GoDaddy, Namecheap, Cloudflare, etc.) and add those records.
4. Wait a few minutes (sometimes longer) for it to verify, then visit your new URL.

---

## Part 7 — How to Update Your App Later

Want to change something? Here's the simplest way:

1. Go to your GitHub repo (`github.com/your-username/precariat-engine`).
2. Click the file you want to edit (e.g., `src/App.jsx`).
3. Click the **pencil icon** (Edit this file) in the top right of the file view.
4. Make your changes in the browser editor.
5. Scroll down, type a brief description like "Updated colors", and click **Commit changes**.
6. **That's it.** Vercel automatically detects the change and redeploys your app within 1-2 minutes. Refresh your live URL to see the update.

For bigger changes, you can also re-upload files: go to the repo → Add file → Upload files.

---

## Optional: Run Locally on Your Computer

If you want to test changes before pushing them live, you can run the app on your own machine.

**One-time setup:**
1. Install Node.js from https://nodejs.org (download the LTS version).
2. Open Terminal (Mac) or Command Prompt (Windows).
3. Type: `cd ` then drag your `precariat-engine` folder into the Terminal window and press Enter.
4. Type: `npm install` and press Enter. Wait for it to finish (1-2 mins).
5. Copy `.env.example` to `.env.local` and paste your API key into it (replace the placeholder).

**To run it:**
1. In Terminal, in the project folder: `npm run dev`
2. Open http://localhost:3000 in your browser.
3. To stop: press `Ctrl+C` in the terminal.

---

## Troubleshooting

### "API request failed" or "ANTHROPIC_API_KEY not set"
You forgot to add the environment variable in Vercel, or you misspelled it.
- Go to Vercel → your project → **Settings** → **Environment Variables**.
- Make sure you have one named exactly `ANTHROPIC_API_KEY` (all caps, underscores).
- After adding/fixing it, go to **Deployments** → click the latest deployment → click the **⋯ (three dots)** → **Redeploy**.

### The build failed on Vercel
- Click on the failed deployment in Vercel and read the error log.
- Most common cause: a file didn't upload to GitHub properly. Re-upload missing files.

### Page loads but says "Loading Precariat..." forever
- Open your browser's developer console (F12 or right-click → Inspect → Console).
- If you see errors mentioning IndexedDB, make sure you're not in private/incognito mode (some browsers block IndexedDB there).

### Analyze button doesn't do anything
- Open the developer console (F12) and look for errors.
- Check that your Anthropic account has credits at https://console.anthropic.com → Plans & Billing.

### "Failed to fetch" when uploading files
- Check that your file is under 4MB.
- PDFs and small images work best.

### Lost your API key
- You can't recover it. Go to Anthropic Console → API Keys → delete the old one and create a new one. Then update it in Vercel under Settings → Environment Variables.

### Other issues
- The Vercel deployment logs are your best friend. Click on any deployment to see the full build and runtime logs.
- You can also paste error messages back to Claude and ask for help debugging.

---

## How Much Does This Cost?

- **GitHub:** Free for private repos
- **Vercel:** Free tier (more than enough for personal use)
- **Anthropic API:** Pay-per-use. Roughly:
  - Project analysis: ~$0.02–$0.05 per analysis
  - Opportunity search: ~$0.05–$0.15 per search (web search costs more)
  - Application generation: ~$0.03–$0.08 per draft
  - **Realistic monthly cost for active use: $5–$20**

---

## What's Next

You're live! Some ideas for next steps:

- Add your other projects and run analysis on each
- Test the Discover tab to find real grants and festivals
- Set up your payment safety controls
- Share the URL with Sam/Isabel
- Consider adding the Stripe integration later if you want to actually process submission fees automatically

If you ever need to make changes or add features, just come back and ask Claude — share the link to your GitHub repo and describe what you want to change.

**Built with love for Precariat Productions** 🎬
