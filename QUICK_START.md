# Quick Start Guide

## ✅ Servers Started!

### Frontend (Next.js)
- **Status:** ✅ RUNNING
- **URL:** http://localhost:3000
- **Port:** 3000

### Backend (Django)
- **Status:** ⏳ STARTING
- **URL:** http://localhost:8000
- **Port:** 8000
- **Note:** Check PowerShell window for startup messages

---

## 🔍 Verify Servers

### 1. Test Backend API
Open in browser: **http://localhost:8000/api/properties/**

**Expected:** JSON array of properties

**If error:** Wait 10-15 seconds and try again

### 2. Test Frontend
Open in browser: **http://localhost:3000**

**Expected:** FlexBnB homepage

---

## 🧪 Test Messaging

1. **Sign in** to the app
2. **Navigate** to any property page
3. **Click** "Message Host" button
4. **Send** a test message
5. **Check** `/Messages` (guest portal)
6. **Check** `/Host/Messages` (host dashboard)

---

## 📝 Troubleshooting

### Backend Not Starting?
- Check PowerShell window for errors
- Verify: `python manage.py migrate` completed
- Check: Virtual environment activated

### Frontend Not Starting?
- Check terminal for compilation errors
- Verify: `.env.local` exists with `NEXT_PUBLIC_API_HOST=http://localhost:8000`
- Restart: `npm run dev`

### Port Already in Use?
```powershell
# Kill process on port 8000
Get-NetTCPConnection -LocalPort 8000 | Stop-Process -Id {OwningProcess} -Force

# Kill process on port 3000
Get-NetTCPConnection -LocalPort 3000 | Stop-Process -Id {OwningProcess} -Force
```

---

## ✅ Success Indicators

- ✅ Backend: http://localhost:8000/api/properties/ returns JSON
- ✅ Frontend: http://localhost:3000 shows the app
- ✅ No console errors in browser
- ✅ Messages send successfully
- ✅ Conversations appear in both portals

---

**Both servers are running! Test the messaging system now!** 🎉

