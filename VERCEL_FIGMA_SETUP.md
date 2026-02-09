# Setting up Figma Mode on Vercel

This guide explains how to enable Figma Mode on your Vercel deployment so you can convert protected pages using Web-to-Figma tools.

## Step 1: Add Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New**
4. Add the following:
   - **Name:** `VITE_FIGMA_MODE`
   - **Value:** `true`
   - **Environment:** Select all (Production, Preview, Development)
5. Click **Save**

## Step 2: Redeploy Your Application

After adding the environment variable, you need to redeploy:

### Option A: Trigger a new deployment
- Push a new commit to your repository, OR
- Go to **Deployments** tab → Click **Redeploy** on the latest deployment

### Option B: Manual redeploy
1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on your latest deployment
3. Select **Redeploy**

## Step 3: Verify Figma Mode is Active

1. Wait for the deployment to complete
2. Visit a protected page directly (e.g., `https://your-app.vercel.app/user/profile`)
3. If Figma Mode is working, you should see the page without being redirected to login

## Step 4: Use Browser Extension to Capture Pages

Since the Figma plugin may not work directly with cloud deployments:

1. **Install the Browser Extension:**
   - Install `html.to.design` extension from Chrome Web Store
   - Or use any other Web-to-Figma browser extension

2. **Capture the Page:**
   - Open your protected page in the browser
   - Click the browser extension icon
   - Select "Send to Figma" or similar option
   - The page will be converted and sent to Figma

## Step 5: Disable Figma Mode (IMPORTANT!)

⚠️ **CRITICAL:** After converting all pages, disable Figma Mode:

1. Go back to **Settings** → **Environment Variables**
2. Find `VITE_FIGMA_MODE`
3. Change the value to `false` OR delete the variable
4. **Redeploy** your application

## Alternative: Use Preview Deployments

Instead of enabling Figma Mode on production:

1. Create a **Preview Deployment** with `VITE_FIGMA_MODE=true`
2. Use the preview URL for Figma conversion
3. Keep production secure with `VITE_FIGMA_MODE=false`

## Troubleshooting

### Environment variable not working
- Make sure you redeployed after adding the variable
- Check that the variable name is exactly `VITE_FIGMA_MODE` (case-sensitive)
- Verify it's set for the correct environment (Production/Preview)

### Pages still require login
- Clear your browser cache
- Try in an incognito/private window
- Check the deployment logs for any errors

### Browser extension not capturing correctly
- Make sure the page is fully loaded before capturing
- Try waiting a few seconds after the page loads
- Check that JavaScript is enabled in your browser
