# Server Startup Guide

## 🚀 Quick Start

### Backend Server (Django)
```bash
cd backend/flexbnb_backend
python manage.py runserver
```

**Expected Output:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

**Verify:** Open http://localhost:8000/api/properties/ in browser - should return JSON

---

### Frontend Server (Next.js)
```bash
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 15.5.9
  - Local:        http://localhost:3000
  - Ready in Xs
```

**Verify:** Open http://localhost:3000 in browser - should show the app

---

## 🔧 Troubleshooting

### Port Already in Use

**Backend (port 8000):**
```powershell
# Find process
Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess

# Kill process (replace PID)
Stop-Process -Id <PID> -Force
```

**Frontend (port 3000):**
```powershell
# Find process
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

# Kill process (replace PID)
Stop-Process -Id <PID> -Force
```

---

### Backend Not Starting

**Check:**
1. Virtual environment activated?
   ```bash
   cd backend/flexbnb_backend
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

2. Dependencies installed?
   ```bash
   pip install -r requirements.txt
   ```

3. Migrations applied?
   ```bash
   python manage.py migrate
   ```

4. Database exists?
   ```bash
   python manage.py showmigrations
   ```

---

### Frontend Not Starting

**Check:**
1. Node modules installed?
   ```bash
   npm install
   ```

2. `.env.local` exists?
   ```bash
   # Should contain:
   NEXT_PUBLIC_API_HOST=http://localhost:8000
   ```

3. Port 3000 available?
   ```bash
   # Check what's using it
   netstat -ano | findstr :3000
   ```

---

## ✅ Verification Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Backend API accessible: http://localhost:8000/api/properties/
- [ ] Frontend accessible: http://localhost:3000
- [ ] No CORS errors in browser console
- [ ] No 500 errors when sending messages

---

## 🎯 Expected Behavior

### Backend Terminal:
```
[MESSAGING] ========== CREATE CONVERSATION ==========
[MESSAGING] Guest (sender): user@example.com
[MESSAGING] ✅ Message created successfully!
```

### Frontend Browser:
- No console errors
- Messages send successfully
- Conversations appear in lists
- Real-time updates work

---

## 📋 Quick Commands

**Start Backend:**
```bash
cd backend/flexbnb_backend
python manage.py runserver
```

**Start Frontend:**
```bash
npm run dev
```

**Check Ports:**
```powershell
Get-NetTCPConnection -LocalPort 8000,3000 | Select-Object LocalPort, OwningProcess
```

**Kill All Node/Python:**
```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Stop-Process -Name python -Force -ErrorAction SilentlyContinue
```

---

**Both servers should now be running!** 🎉

