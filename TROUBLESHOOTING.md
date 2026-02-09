# Troubleshooting Guide

## "Unable to connect to server" Error

If you're seeing the error "Unable to connect to server. Please make sure the backend server is running", follow these steps:

### Step 1: Check Backend Server Status

1. **Verify the backend server is running:**
   ```bash
   cd backend
   php artisan serve
   ```
   
   The server should start on `http://localhost:8000` by default.

2. **Check if the server is accessible:**
   - Open your browser and go to: `http://localhost:8000/api`
   - You should see a response (even if it's an error, it means the server is running)

### Step 2: Check Environment Variables

1. **Verify `VITE_BASE_API_URL` is set:**
   - Open `frontend/.env` file
   - Make sure it contains:
     ```env
     VITE_BASE_API_URL=http://localhost:8000
     ```
   
2. **If the variable is missing:**
   - Add it to your `.env` file
   - Restart the frontend development server

### Step 3: Check CORS Configuration

If the backend is running but you still get connection errors, check CORS:

1. **Backend CORS settings:**
   - Open `backend/config/cors.php`
   - Make sure your frontend URL is allowed in `allowed_origins`

2. **Common CORS fix:**
   ```php
   'allowed_origins' => [
       'http://localhost:5173', // Vite default port
       'http://localhost:3000', // Alternative port
   ],
   ```

### Step 4: Check Network Tab

1. **Open browser DevTools (F12)**
2. **Go to Network tab**
3. **Try to make a request (e.g., login)**
4. **Check the failed request:**
   - Look at the URL - is it correct?
   - Check the status code
   - Check for CORS errors in the console

### Step 5: Verify Port Numbers

Make sure the ports match:

- **Backend:** Usually `8000` (check with `php artisan serve`)
- **Frontend:** Usually `5173` (check Vite output when running `npm run dev`)

### Step 6: Check Firewall/Antivirus

Sometimes firewalls or antivirus software can block local connections:

1. **Temporarily disable firewall** to test
2. **Add exception** for your development ports
3. **Check Windows Defender** or your antivirus settings

### Step 7: Check if Figma Mode is Interfering

If you have `VITE_FIGMA_MODE=true` set:

1. **Temporarily disable it:**
   ```env
   VITE_FIGMA_MODE=false
   ```

2. **Restart the frontend server**

3. **Try again**

Note: Figma Mode should NOT block connection errors, but if you're having issues, try disabling it.

### Common Issues and Solutions

#### Issue: "Network Error" in console
**Solution:** 
- Check if backend is running
- Verify `VITE_BASE_API_URL` is correct
- Check CORS settings

#### Issue: "CORS policy" error
**Solution:**
- Update `backend/config/cors.php`
- Add your frontend URL to allowed origins
- Restart backend server

#### Issue: "ECONNREFUSED" error
**Solution:**
- Backend server is not running
- Wrong port number
- Firewall blocking connection

#### Issue: Works locally but not on Vercel
**Solution:**
- Set `VITE_BASE_API_URL` in Vercel environment variables
- Make sure backend is deployed and accessible
- Check backend CORS allows your Vercel domain

### Testing Connection

You can test the connection manually:

```javascript
// In browser console
fetch('http://localhost:8000/api')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

If this works, the backend is accessible. If not, check backend server status.

### Still Having Issues?

1. **Check backend logs:**
   ```bash
   cd backend
   tail -f storage/logs/laravel.log
   ```

2. **Check frontend console:**
   - Open DevTools (F12)
   - Look for errors in Console tab

3. **Verify both servers are running:**
   - Backend: `php artisan serve` (port 8000)
   - Frontend: `npm run dev` (port 5173)
