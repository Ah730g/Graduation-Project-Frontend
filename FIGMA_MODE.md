# Figma Mode Guide

This guide explains how to use Figma Mode to convert protected pages to Figma using Web-to-Figma plugins.

## What is Figma Mode?

Figma Mode is a special mode that allows you to access protected pages (that require login) without authentication. This is useful when using Web-to-Figma plugins to convert your pages to Figma designs.

## How to Enable Figma Mode

### Step 1: Create/Edit `.env` file

Create a `.env` file in the `frontend` directory (if it doesn't exist) and add:

```env
# Enable Figma Mode for Web-to-Figma plugins
VITE_FIGMA_MODE=true

# Your existing environment variables
VITE_BASE_API_URL=http://localhost:8000
VITE_IMAGEKIT_PUBLIC_KEY=your_imagekit_key
VITE_IMAGEKIT_URL_ENDPOINT=your_imagekit_endpoint
```

**Note:** If you already have a `.env` file, just add `VITE_FIGMA_MODE=true` to it.

### Step 2: Restart Development Server

```bash
npm run dev
```

### Step 3: Access Protected Pages

Now you can access all protected pages directly without logging in:

**User Pages:**
- `/user/profile`
- `/user/profile/update`
- `/post/add`
- `/identity-verification`
- `/booking-requests`
- `/notifications`
- `/payment`
- `/contracts/:id`
- `/ratings`
- `/support/tickets`
- `/support/create`
- `/support/tickets/:id`

**Admin Pages:**
- `/admin/dashboard`
- `/admin/users`
- `/admin/apartments`
- `/admin/rental-requests`
- `/admin/contracts`
- `/admin/reviews`
- `/admin/identity-verifications`
- `/admin/support/tickets`
- `/admin/support/tickets/:id`
- `/admin/reports`

## How to Use with Web-to-Figma Plugins

### Method 1: Using Browser Extension (Recommended for Production/Cloud)

If you're using a cloud deployment (like Vercel), the plugin may not be able to access protected pages directly. Use the browser extension instead:

1. **Install the Browser Extension:**
   - For `html.to.design`: Install from [Chrome Web Store](https://chrome.google.com/webstore)
   - Works on Chrome, Edge, Brave, Opera, Arc, and Vivaldi

2. **Enable Figma Mode on your deployment:**
   - Add `VITE_FIGMA_MODE=true` to your environment variables in Vercel/Railway/etc.
   - Redeploy your application

3. **Capture the page:**
   - Open your protected page in the browser (it should be accessible with Figma Mode)
   - Use the browser extension to capture the page
   - The extension will send it directly to Figma

### Method 2: Using Plugin with Local Development

1. **Enable Figma Mode** (set `VITE_FIGMA_MODE=true` in `.env`)
2. **Start your development server** (`npm run dev`)
3. **Open the page** you want to convert in your browser (e.g., `http://localhost:5173/user/profile`)
4. **Use the Web-to-Figma plugin** in Figma to capture the page
5. **Disable Figma Mode** when done (set `VITE_FIGMA_MODE=false`)

### Method 3: Direct URL Access (For Cloud Deployments)

If you're using a cloud deployment:

1. **Set environment variable in your hosting platform:**
   - Vercel: Go to Settings → Environment Variables → Add `VITE_FIGMA_MODE=true`
   - Railway: Add to your environment variables
   - Other platforms: Add to your environment configuration

2. **Redeploy your application**

3. **Access protected pages directly:**
   - Your protected pages will now be accessible without login
   - Example: `https://your-app.vercel.app/user/profile`
   - Example: `https://your-app.vercel.app/admin/dashboard`

4. **Use browser extension** to capture the pages (recommended for cloud)

## Important Notes

⚠️ **Security Warning:**
- **NEVER** deploy to production with `VITE_FIGMA_MODE=true`
- **NEVER** commit `.env` file with `VITE_FIGMA_MODE=true` to version control
- Always set `VITE_FIGMA_MODE=false` after converting pages

## How It Works

- In Figma Mode, the app uses mock user data instead of real authentication
- Protected routes allow access without checking for real tokens
- API calls are intercepted but not actually sent (to prevent errors)
- Mock data is automatically selected based on the route (admin vs user)

## Disabling Figma Mode

Simply set in `.env`:
```env
VITE_FIGMA_MODE=false
```

Then restart your development server.

## Troubleshooting

### Plugin shows "Access to this page is restricted"
**Solution:** Use the browser extension instead of the Figma plugin directly:
1. Install the `html.to.design` browser extension
2. Open your protected page in the browser (with Figma Mode enabled)
3. Use the extension to capture and send to Figma

### Pages still redirect to login
- Make sure `VITE_FIGMA_MODE=true` is set correctly
- For local development: Restart the development server after changing `.env`
- For cloud deployments: Make sure the environment variable is set and redeploy
- Clear browser cache and localStorage

### Admin pages not accessible
- Admin pages automatically use mock admin user in Figma Mode
- Make sure you're accessing `/admin/*` routes
- Check that `VITE_FIGMA_MODE=true` is set in your environment

### API errors in console
- This is normal in Figma Mode - API calls are intercepted
- The pages will still render correctly with mock data

### Figma Mode not working on Vercel/Cloud
1. **Check environment variables:**
   - Go to your hosting platform's settings
   - Verify `VITE_FIGMA_MODE=true` is set
   - Make sure it's set for the correct environment (Production/Preview)

2. **Redeploy:**
   - After adding/changing environment variables, you must redeploy
   - Vercel: Push a new commit or trigger a redeploy
   - Railway: Restart the service

3. **Verify the build:**
   - Check build logs to ensure the variable is being read
   - Look for any errors related to environment variables

### Browser Extension not working
- Make sure you're using a supported browser (Chrome, Edge, Brave, Opera, Arc, Vivaldi)
- Check that the extension is enabled
- Try refreshing the page after installing the extension
