# Quick Mobile Testing - 2 Minutes Setup! 📱

## Fastest Way: Using Cloudflare Tunnel (No Signup!)

### Step 1: Install cloudflared (One-time)

**Windows (PowerShell as Admin):**
```powershell
# Download and install
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "$env:USERPROFILE\cloudflared.exe"

# Add to PATH (restart terminal after)
$env:Path += ";$env:USERPROFILE"
```

Or use Chocolatey:
```powershell
choco install cloudflared
```

### Step 2: Start Your Server

```bash
cd food-ordering-website/aws
node local-server.js
```

Keep this terminal running!

### Step 3: Start Tunnel (New Terminal)

```bash
cloudflared tunnel --url http://localhost:3001
```

### Step 4: Get Your URL

You'll see something like:
```
Your quick Tunnel has been created! Visit it at:
https://random-name.trycloudflare.com
```

### Step 5: Test on Mobile! 🎉

1. Copy the `https://random-name.trycloudflare.com` URL
2. Open it on your mobile browser
3. Test the website!

---

## Alternative: Use Your WiFi Network (No Installation)

### Step 1: Find Your IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" like `192.168.1.100`

### Step 2: Start Server

```bash
cd food-ordering-website/aws
node local-server.js
```

### Step 3: Open on Mobile

Make sure your phone is on the same WiFi, then open:
```
http://YOUR_IP:3001
```
Example: `http://192.168.1.100:3001`

---

## Using the Helper Script

**Windows:**
```powershell
cd food-ordering-website
.\start-tunnel.ps1
```

**Mac/Linux:**
```bash
cd food-ordering-website
./start-tunnel.sh
```

The script will:
- ✅ Check if server is running
- ✅ Show you all available options
- ✅ Start the tunnel automatically

---

## Troubleshooting

**"Server not running"**
- Start the server first: `cd aws && node local-server.js`

**"Command not found"**
- Install the tool first (see MOBILE-TESTING.md)

**"Can't access from mobile"**
- Make sure you're on the same WiFi (for local IP method)
- Check firewall settings
- Try a different tunnel service

---

## What to Test on Mobile

- [ ] Homepage loads
- [ ] Hamburger menu (☰) works
- [ ] Language switch (मराठी ↔ English)
- [ ] Menu scrolling
- [ ] Add items to cart
- [ ] Checkout form
- [ ] Place order
- [ ] My Orders page
- [ ] Touch gestures work smoothly

---

## Need More Options?

See **MOBILE-TESTING.md** for:
- ngrok setup (most reliable)
- localtunnel (free, no signup)
- Detailed troubleshooting
- Advanced configurations

Happy testing! 🚀
