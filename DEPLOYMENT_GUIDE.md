# 🚀 Precariat Opportunity Engine — Deployment Guide for Dummies

**Goal:** Get your app live on the internet at a real URL like `precariat-engine.vercel.app` so you can use it from any device.

**Time required:** About 20 minutes

**Cost:** $0 to deploy. You only pay Anthropic for the AI usage (a few cents per project analysis).

**Required:** A computer with a web browser. No coding experience needed. No command line needed.

---

## 📋 What You'll Do (Big Picture)

1. **Get an Anthropic API key** — this is what powers the AI features
2. **Create a GitHub account** — this is where your code lives
3. **Upload the project files** — drag and drop in your browser
4. **Create a Vercel account** — this is what hosts your app
5. **Click "Deploy"** — Vercel does the rest
6. **Open your app** — paste in your API key and start using it

That's it. No terminals, no commands, no servers to manage.

---

## Part 1: Get Your Anthropic API Key 🔑

The app uses Claude (Anthropic's AI) to analyze your projects, search for opportunities, and write applications. You need an API key so it can talk to Claude.

### Steps:

1. **Go to** [https://console.anthropic.com](https://console.anthropic.com)

2. **Sign up** with your email (or log in if you already have an account)

3. Once logged in, look for **"API Keys"** in the left sidebar (or settings menu)

4. Click **"Create Key"**

5. Give it a name like "Precariat Engine" and click Create

6. **Copy the key** that appears — it starts with `sk-ant-api03-...`
   
   ⚠️ **IMPORTANT:** This is the only time the full key will be shown. Paste it somewhere safe right now (like a notes app).

7. **Add credit to your account:**
   - Go to **Billing** in the sidebar
   - Click **"Add to credit balance"**
   - Add $5–10 to start (this lasts a long time — analyzing one project costs about $0.10)

✅ **You now have an API key. Keep it safe.** You'll paste it into the app at the very end.

---

## Part 2: Create a GitHub Account 🐙

GitHub is where your project files will live. Vercel will pull them from here to deploy your app.

### Steps:

1. **Go to** [https://github.com](https://github.com)

2. Click **"Sign up"** in the top right

3. Use your email and create a username (this will appear in your app's URL, so pick something nice — like `ryanguiterman`)

4. **Verify your email** when GitHub sends you a confirmation

5. You can skip any "Set up your profile" prompts — just click **Skip** or **Continue**

✅ **You now have a GitHub account.**

---

## Part 3: Upload the Project to GitHub 📤

Now you'll upload all the files I gave you to a new GitHub repository ("repo" for short).

### Steps:

1. **Unzip** the `precariat-opportunity-engine.zip` file on your computer (double-click it). You should now have a folder called `precariat-engine` with files inside.

2. **On GitHub**, click the **"+"** icon in the top right and choose **"New repository"**

3. **Repository name:** type `precariat-engine` (or any name you like — this becomes part of your app's URL)

4. Set it to **Public** (Vercel's free plan works best with public repos)

5. **Don't check** any of the "Add a README" boxes — leave them empty

6. Click **"Create repository"**

7. On the next page, you'll see a setup screen. Look for the link near the top that says **"uploading an existing file"** and click it.

   *(If you don't see it, look for a link that says "upload an existing file" — it's usually in a sentence like "You can also upload an existing file" or "Get started by creating a new file or uploading an existing file.")*

8. **Drag and drop** ALL the files and folders from inside the unzipped `precariat-engine` folder into the upload area. Make sure you're dragging the **contents** of the folder, not the folder itself.

   You should be uploading these items:
   - `src` (folder)
   - `api` (folder)
   - `package.json`
   - `vite.config.js`
   - `vercel.json`
   - `index.html`
   - `.gitignore`
   - `.env.example`
   - `README.md`
   - `DEPLOYMENT_GUIDE.md`

   ⚠️ **If you don't see the files starting with a dot** (like `.gitignore`), open your file browser settings and enable "Show hidden files."

9. Wait for all files to upload (you'll see them listed below the upload area)

10. Scroll down. In the **"Commit changes"** section, you can leave the default message or type "Initial upload"

11. Click the green **"Commit changes"** button

✅ **Your code is now on GitHub.** You should see the file list on your repository page.

---

## Part 4: Create a Vercel Account ▲

Vercel is the service that will actually host your app on the internet.

### Steps:

1. **Go to** [https://vercel.com](https://vercel.com)

2. Click **"Sign Up"** in the top right

3. Choose **"Continue with GitHub"** — this links your accounts so Vercel can see your repositories

4. **Authorize Vercel** when GitHub asks (click the green button)

5. You may be asked to choose between Hobby (free) and Pro — choose **Hobby** ($0/month)

6. Vercel might ask to install on your GitHub account — click **Install** and choose **"All repositories"** (or just the precariat-engine one)

✅ **You now have a Vercel account connected to GitHub.**

---

## Part 5: Deploy Your App 🚀

This is the fun part. You're about to make your app live.

### Steps:

1. After connecting Vercel to GitHub, you should land on a page that says **"Import Git Repository"**. If not, click **"Add New..."** → **"Project"** in the top right.

2. You should see your `precariat-engine` repository in the list. Click the **"Import"** button next to it.

3. On the configuration page that appears:
   - **Project Name:** Leave the default or change it (this becomes your URL, e.g., `precariat-engine.vercel.app`)
   - **Framework Preset:** Vercel should auto-detect "Vite" — leave it
   - **Root Directory:** Leave as `./`
   - **Build and Output Settings:** Leave the defaults

4. **You can ignore** the Environment Variables section for now (we use a client-side API key)

5. Click the big **"Deploy"** button

6. **Wait about 1–2 minutes.** You'll see a build log scrolling by. Don't worry about the details — Vercel is installing the dependencies and building your app.

7. When it finishes, you'll see a celebration screen with **"Congratulations!"** and a preview of your app

8. Click **"Continue to Dashboard"** or click directly on your app's preview/URL

✅ **Your app is LIVE on the internet!** 🎉

---

## Part 6: Open Your App and Add Your API Key 🔧

You're almost done. The app works, but it needs your API key to talk to Claude.

### Steps:

1. From the Vercel dashboard, click the link to your app (it'll be something like `precariat-engine-abc123.vercel.app`)

2. Your app should open. You'll see the dashboard.

3. Click **"PROFILE"** in the left sidebar (the bottom item)

4. At the top of the Profile page, you'll see a section called **"API Configuration"** with a yellow warning badge that says **"NOT SET"**

5. **Paste your Anthropic API key** (the one from Part 1) into the input field

6. Click **"Save All"** at the bottom

7. The badge should now turn green and say **"CONNECTED"**

✅ **You're done!** Your app is live and ready to use.

---

## 🎬 Using Your App for the First Time

Now go try it out:

1. Click **"PROJECTS"** in the sidebar
2. Click **"+ New Project"**
3. Fill in the details for one of your films
4. Scroll down to **"Project Materials"** and upload your screenplay, pitch deck, or look book
5. Click **"Save Project"**
6. Back on the Projects list, click the **"🔬 Analyze"** button
7. Wait about 30 seconds while Claude reads your materials and generates a deep intelligence report
8. Once analyzed, head to **"DISCOVER"** to find matching opportunities
9. Save the ones you like, then go to **"APPLICATIONS"** to generate tailored drafts

---

## 🆘 Troubleshooting

### "API key invalid" or analysis fails

- Double-check you copied the **entire** API key from console.anthropic.com (it should start with `sk-ant-api03-`)
- Make sure you have **credit balance** in your Anthropic account (Billing → Credit balance)
- Try clicking "Show" on the API key field in Profile to verify there are no extra spaces

### Vercel deployment fails

- Most common cause: missing files. Go back to your GitHub repo and verify all the files listed in Part 3 are present
- Check that `package.json` is in the root of the repository, not inside a subfolder
- Click "Redeploy" in Vercel to try again

### "Can't find variable" or app won't open

- Try a hard refresh: hold **Shift** and click reload in your browser
- Open a new incognito/private window and visit your URL
- Check the browser console (right-click → Inspect → Console) for the actual error and search for it

### Files won't upload (4MB limit)

- The app caps individual file uploads at 4MB to keep things fast
- For large screenplays: export as text instead of PDF, or use a compressed PDF
- For pitch decks: use "Reduce File Size" in Preview (Mac) or compress online before uploading

### My data disappeared!

- The app stores everything in your browser's local database. If you cleared browser data or use a different browser, it'll appear empty
- Always use the same browser to access your app
- For backup, you can export individual applications using the "Copy All" button

---

## 🔄 Making Changes Later

Want to update the app or change something? Here's how:

### Update the code

1. On GitHub, navigate to the file you want to change (e.g., `src/App.jsx`)
2. Click the pencil icon ✏️ to edit
3. Make your changes
4. Scroll down and click "Commit changes"
5. **Vercel will automatically redeploy** within 1–2 minutes

### Get a custom domain (optional)

1. In Vercel, go to your project → **Settings** → **Domains**
2. Type your domain (e.g., `engine.precariatproductions.com`)
3. Vercel will give you DNS instructions — follow them on your domain registrar's website
4. Wait a few minutes for it to take effect

---

## 💡 Tips for Long-Term Use

- **Keep your API key secret.** Don't share screenshots of the Profile page
- **Monitor your Anthropic spending** at console.anthropic.com → Billing → Usage
- **Bookmark your Vercel app URL** for easy access
- **Star your GitHub repo** so you can find it again later
- **Don't delete the GitHub repo** — Vercel needs it to host the app

---

## 🎯 What's Next

Once you're comfortable with the app, consider:

- Asking Claude (in chat) to add new features
- Setting up a custom domain so it lives at `engine.precariatproductions.com`
- Sharing the URL with Sam so you both can use it
- Exporting your favorite applications as PDFs to keep records

---

## 🙋 Still Stuck?

If something isn't working, the fastest fix is to ask Claude directly:

> "Hey Claude, I'm trying to deploy the Precariat Opportunity Engine and I'm stuck at [step number]. Here's what I'm seeing: [describe the issue or paste the error message]"

I'll walk you through it. Good luck with the engine, Ryan! 🎬

---

*Built with love by Precariat Productions — precariatproductions.com*
