# Visitor Tracking Setup Guide

## Step 1: Create Database Tables

Run this SQL command in your MySQL database:

```bash
cd /mnt/d/aicodestream/food-ordering-website/database
sudo mysql -u root -p food_ordering < add-visitor-tracking.sql
```

Or manually in MySQL:

```sql
USE food_ordering;

-- Run the contents of add-visitor-tracking.sql
SOURCE /mnt/d/aicodestream/food-ordering-website/database/add-visitor-tracking.sql;
```

## Step 2: Restart the Server

```bash
cd /mnt/d/aicodestream/food-ordering-website/aws
# Stop the current server (Ctrl+C if running)
node local-server.js
```

## Step 3: Test Visitor Tracking

1. Open the website: `http://localhost:3001`
2. Browse a few pages
3. Open admin panel: `http://localhost:3001/admin.html`
4. Check the visitor stats cards

## What Gets Tracked

✅ **Today's Visitors** - Unique visitors today
✅ **Today's Page Views** - Total page views today  
✅ **Total Visitors** - All-time unique visitors

## Features

- Automatic tracking on every page load
- Unique visitor identification using localStorage
- Page view counting
- Daily statistics
- Historical data (30 days)
- Real-time updates in admin panel

## Privacy Note

The tracking uses:
- Anonymous visitor IDs (stored in browser)
- Page URLs
- User agent (browser info)
- IP address (for uniqueness)

No personal information is collected.

## Admin Panel Display

The visitor stats appear as green cards below the order stats:
- 👥 Today's Visitors
- 📄 Today's Page Views  
- 🌐 Total Visitors

Stats auto-refresh every minute!
