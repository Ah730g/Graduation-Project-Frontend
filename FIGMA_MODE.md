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

1. **Enable Figma Mode** (set `VITE_FIGMA_MODE=true` in `.env`)
2. **Start your development server** (`npm run dev`)
3. **Open the page** you want to convert in your browser
4. **Use the Web-to-Figma plugin** to capture the page
5. **Disable Figma Mode** when done (set `VITE_FIGMA_MODE=false`)

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

### Pages still redirect to login
- Make sure `VITE_FIGMA_MODE=true` is set correctly
- Restart the development server after changing `.env`
- Clear browser cache and localStorage

### Admin pages not accessible
- Admin pages automatically use mock admin user in Figma Mode
- Make sure you're accessing `/admin/*` routes

### API errors in console
- This is normal in Figma Mode - API calls are intercepted
- The pages will still render correctly with mock data
