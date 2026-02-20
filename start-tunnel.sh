#!/bin/bash

# Mobile Testing Tunnel Starter (Bash)
# This script helps you quickly start a tunnel for mobile testing

echo "========================================"
echo "  Mobile Testing Tunnel Setup"
echo "========================================"
echo ""

# Check if server is running
echo "Checking if server is running on port 3001..."
if ! nc -z localhost 3001 2>/dev/null; then
    echo "❌ Server is not running on port 3001"
    echo ""
    echo "Please start the server first:"
    echo "  cd aws"
    echo "  node local-server.js"
    echo ""
    exit 1
fi

echo "✅ Server is running!"
echo ""

# Menu for tunnel selection
echo "Select a tunneling service:"
echo "1. ngrok (Recommended - requires signup)"
echo "2. localtunnel (Free, no signup)"
echo "3. cloudflared (Cloudflare Tunnel)"
echo "4. Show local network IP"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Starting ngrok..."
        echo ""
        
        # Check if ngrok is installed
        if command -v ngrok &> /dev/null; then
            echo "Opening ngrok tunnel on port 3001..."
            echo "Press Ctrl+C to stop the tunnel"
            echo ""
            ngrok http 3001
        else
            echo "❌ ngrok is not installed"
            echo ""
            echo "Install ngrok:"
            echo "  1. Download from: https://ngrok.com/download"
            echo "  2. Or install via npm: npm install -g ngrok"
            echo "  3. Or via Homebrew (Mac): brew install ngrok"
        fi
        ;;
    
    2)
        echo ""
        echo "Starting localtunnel..."
        echo ""
        
        # Check if localtunnel is installed
        if command -v lt &> /dev/null; then
            echo "Opening localtunnel on port 3001..."
            echo "Press Ctrl+C to stop the tunnel"
            echo ""
            lt --port 3001
        else
            echo "❌ localtunnel is not installed"
            echo ""
            echo "Install localtunnel:"
            echo "  npm install -g localtunnel"
        fi
        ;;
    
    3)
        echo ""
        echo "Starting Cloudflare Tunnel..."
        echo ""
        
        # Check if cloudflared is installed
        if command -v cloudflared &> /dev/null; then
            echo "Opening Cloudflare tunnel on port 3001..."
            echo "Press Ctrl+C to stop the tunnel"
            echo ""
            cloudflared tunnel --url http://localhost:3001
        else
            echo "❌ cloudflared is not installed"
            echo ""
            echo "Install cloudflared:"
            echo "  Mac: brew install cloudflare/cloudflare/cloudflared"
            echo "  Linux: wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && sudo dpkg -i cloudflared-linux-amd64.deb"
        fi
        ;;
    
    4)
        echo ""
        echo "Your Local Network IP Addresses:"
        echo ""
        
        # Get local IP addresses
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print "  📱 http://"$2":3001"}'
        else
            # Linux
            ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print "  📱 http://"$2":3001"}' | sed 's/\/[0-9]*//g'
        fi
        
        echo ""
        echo "Instructions:"
        echo "  1. Make sure your mobile is on the same WiFi network"
        echo "  2. Open one of the URLs above on your mobile browser"
        echo ""
        ;;
    
    *)
        echo "Invalid choice"
        ;;
esac

echo ""
echo "========================================"
