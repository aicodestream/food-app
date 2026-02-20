# Mobile Testing Guide - Local Tunnel Setup

This guide will help you test your local website on mobile devices using tunneling services.

## Option 1: Using ngrok (Recommended)

### Installation

1. **Download ngrok:**
   - Visit: https://ngrok.com/download
   - Or install via npm: `npm install -g ngrok`
   - Or via Chocolatey (Windows): `choco install ngrok`

2. **Sign up for free account:**
   - Visit: https://dashboard.ngrok.com/signup
   - Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken

3. **Configure ngrok:**
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

### Usage

1. **Start your local server:**
   ```bash
   cd food-ordering-website/aws
   node local-server.js
   ```
   Server runs on: http://localhost:3001

2. **In a new terminal, start ngrok:**
   ```bash
   ngrok http 3001
   ```

3. **You'll see output like:**
   ```
   Forwarding  https://abc123.ngrok.io -> http://localhost:3001
   ```

4. **Open the ngrok URL on your mobile:**
   - Copy the `https://abc123.ngrok.io` URL
   - Open it on your mobile browser
   - Test the website!

### ngrok Features:
- ✅ HTTPS by default
- ✅ Inspect traffic at http://localhost:4040
- ✅ Stable URLs (with paid plan)
- ✅ Works on all networks

---

## Option 2: Using localtunnel (Free, No Signup)

### Installation

```bash
npm install -g localtunnel
```

### Usage

1. **Start your local server:**
   ```bash
   cd food-ordering-website/aws
   node local-server.js
   ```

2. **In a new terminal, start localtunnel:**
   ```bash
   lt --port 3001
   ```

3. **You'll see:**
   ```
   your url is: https://random-name.loca.lt
   ```

4. **Open on mobile and click "Continue"**

### localtunnel Features:
- ✅ No signup required
- ✅ Free forever
- ✅ HTTPS support
- ⚠️ URL changes each time
- ⚠️ Shows warning page first time

---

## Option 3: Using Your Local Network (Same WiFi)

### Find Your Local IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```

### Update Server to Listen on All Interfaces

The server is already configured to listen on all interfaces (0.0.0.0).

### Access from Mobile

1. **Make sure mobile is on same WiFi**
2. **Open browser on mobile:**
   ```
   http://YOUR_IP_ADDRESS:3001
   ```
   Example: `http://192.168.1.100:3001`

### Local Network Features:
- ✅ Completely free
- ✅ No external services
- ✅ Fast (no internet routing)
- ⚠️ Only works on same WiFi
- ⚠️ No HTTPS (some features may not work)

---

## Option 4: Using Cloudflare Tunnel (cloudflared)

### Installation

**Windows:**
```bash
# Download from: https://github.com/cloudflare/cloudflared/releases
# Or via Chocolatey:
choco install cloudflared
```

**Mac:**
```bash
brew install cloudflare/cloudflare/cloudflared
```

**Linux:**
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

### Usage

1. **Start your local server:**
   ```bash
   cd food-ordering-website/aws
   node local-server.js
   ```

2. **In a new terminal, start cloudflared:**
   ```bash
   cloudflared tunnel --url http://localhost:3001
   ```

3. **You'll see:**
   ```
   Your quick Tunnel has been created! Visit it at:
   https://random-name.trycloudflare.com
   ```

4. **Open the URL on your mobile**

### Cloudflare Tunnel Features:
- ✅ No signup required
- ✅ Free forever
- ✅ HTTPS support
- ✅ Fast and reliable
- ⚠️ URL changes each time

---

## Quick Start Scripts

I've created helper scripts for you:

### Windows (PowerShell):
```bash
.\start-tunnel.ps1
```

### Mac/Linux (Bash):
```bash
./start-tunnel.sh
```

---

## Testing Checklist

Once you have the tunnel URL, test these on your mobile:

- [ ] Homepage loads correctly
- [ ] Navigation menu works (hamburger menu)
- [ ] Language switcher (English ↔ Marathi)
- [ ] Menu items display properly
- [ ] Add to cart functionality
- [ ] Cart page and checkout
- [ ] Place order
- [ ] My Orders page
- [ ] Login/Signup
- [ ] Touch interactions (tap, scroll, swipe)
- [ ] Forms (keyboard doesn't zoom screen)
- [ ] Images load correctly
- [ ] Responsive layout on different orientations

---

## Troubleshooting

### Issue: "Connection Refused"
- Make sure your local server is running
- Check the port number (should be 3001)

### Issue: "Tunnel not working"
- Try a different tunneling service
- Check your firewall settings
- Restart the tunnel

### Issue: "WhatsApp notifications not working"
- This is expected - Twilio needs a public URL
- You can update the webhook URL in Twilio console to your tunnel URL

### Issue: "Database connection failed"
- Make sure MySQL is running
- Check if WSL is running (if using WSL)

---

## Recommended: ngrok

For the best experience, I recommend **ngrok** because:
1. Most reliable and stable
2. HTTPS by default
3. Traffic inspection tool
4. Can keep same URL (with account)

---

## Need Help?

If you encounter any issues:
1. Check that local server is running on port 3001
2. Try a different tunnel service
3. Use local network option if on same WiFi
4. Check firewall settings

Happy testing! 📱
