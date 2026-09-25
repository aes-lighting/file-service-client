# First Time Setup Guide

Follow these steps to get the AES File Service running locally or on a production server.

**Repository:** [aes-lighting/file-service-client](https://github.com/aes-lighting/file-service-client)  
**Spec Kit:** [`.specify/README.md`](.specify/README.md) (binding contract + ontology). MVP acceptance is **Deferred** — [`.specify/mvp-definition.md`](.specify/mvp-definition.md).

---

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/aes-lighting/file-service-client.git
cd file-service-client

# Install dependencies
npm install --production
```

---

## Step 2: Configure the Service

### For Local Development

```bash
# Copy the example config into the path expected by config.js
mkdir -p config
cp config.example.json config/config.json

# Edit with your preferred editor
# Windows (PowerShell)
notepad config/config.json

# macOS/Linux
nano config/config.json
```

**Minimal local config:**
```json
{
  "service": {
    "port": 3001,
    "host": "127.0.0.1"
  },
  "storage": {
    "rootDirectory": "./data",
    "maxFileSize": 52428800
  },
  "directories": [
    {"name": "INTAKE", "path": "INTAKE"}
  ],
  "authentication": {
    "apiKey": "dev-api-key-123456"
  }
}
```

Then create the data directory:
```bash
mkdir data
mkdir data/INTAKE
```

### For Production (Windows Server)

```bash
# Copy the example config into the path expected by config.js
mkdir -p config
cp config.example.json config/config.json

# Edit for your network
```

**Production config example:**
```json
{
  "service": {
    "port": 3001,
    "host": "0.0.0.0"
  },
  "storage": {
    "rootDirectory": "\\\\your-server\\uploads",
    "maxFileSize": 52428800
  },
  "directories": [
    {"name": "INTAKE", "path": "INTAKE"},
    {"name": "DELIVERY", "path": "DELIVERY"},
    {"name": "IN-TRANSIT", "path": "IN-TRANSIT"}
  ],
  "authentication": {
    "apiKey": "YOUR_STRONG_API_KEY_HERE"
  }
}
```

**Generate a strong API key:**
```bash
# Node.js (any platform)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# PowerShell
$bytes = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
[System.BitConverter]::ToString($bytes) -replace '-',''

# macOS/Linux
openssl rand -hex 32
```

---

## Step 3: Start the Service

### Development (Local)
```bash
npm start
```

You should see:
```
✓ AES File Service V0 started on http://127.0.0.1:3001
```

### Production (Windows Server)

#### Option A: Manual Start
```bash
npm start
```

Leave the terminal open - service runs in foreground.

#### Option B: Windows Service (Recommended)

1. **Download and install NSSM:**
   ```bash
   # Visit https://nssm.cc/download
   # Extract to C:\nssm\
   ```

2. **Install the service:**
   ```powershell
   cd C:\nssm\nssm-2.24\win64
   
   nssm install AESFileService node "C:\AESFileService\src\index.js"
   nssm set AESFileService AppDirectory "C:\AESFileService"
   nssm set AESFileService AppStdout "C:\AESFileService\logs\service.log"
   nssm set AESFileService AppStderr "C:\AESFileService\logs\service.log"
   nssm start AESFileService
   ```

3. **Verify it's running:**
   ```bash
   sc query AESFileService
   ```

   Expected output: `STATE : 4 RUNNING`

---

## Step 4: Test the Service

### Health Check
```bash
curl http://127.0.0.1:3001/api/health
```

**Expected response:**
```json
{"status":"ok","service":"AES File Service V0","timestamp":"2026-08-28T..."}
```

### Test File Upload
```bash
# Create a test file
echo "test data" > test.txt

# Upload it
curl -X POST http://127.0.0.1:3001/api/upload \
  -H "X-API-Key: dev-api-key-123456" \
  -F file=@test.txt \
  -F filename=INTAKE_TEST-001_2026-08-28T00-00-00_abc123.txt
```

**Expected response:**
```json
{"success":true,"file":"INTAKE_TEST-001_2026-08-28T00-00-00_abc123.txt","size":10}
```

### Verify File Was Saved
```bash
# Development
ls data/INTAKE/

# Production (Windows)
dir \\your-server\uploads\INTAKE\
```

---

## Step 5: Manage Configuration

### Add a New Directory

1. **Stop the service** (if running as service):
   ```bash
   net stop AESFileService
   ```

2. **Edit config.json:**
   ```json
   "directories": [
     {"name": "INTAKE", "path": "INTAKE"},
     {"name": "DELIVERY", "path": "DELIVERY"},
     {"name": "NEW_DIRECTORY", "path": "NEW_DIRECTORY"}  ← Add this
   ]
   ```

3. **Restart the service:**
   ```bash
   net start AESFileService
   ```

### Change API Key

1. Generate a new strong key (see Step 2)
2. Update `"apiKey"` in config.json
3. Restart the service
4. Update all applications using the old key

### Change Storage Path

1. Stop the service
2. Update `"rootDirectory"` in config.json
3. Create the directory if it doesn't exist
4. Restart the service

---

## 🐛 Troubleshooting

### "Cannot find module 'express'"
```bash
# Make sure you ran npm install
npm install --production
```

### "EACCES: permission denied"
- Windows: Run Command Prompt/PowerShell as Administrator
- macOS/Linux: Use `sudo` or fix directory permissions

### "Port 3001 is already in use"
- Change `"port"` in config.json to another value (e.g., 3002)
- Or find and stop the process using port 3001

### Service starts but immediately stops
- Check logs: `type logs/service.log` (Windows) or `cat logs/service.log` (Linux/Mac)
- Verify config.json is valid JSON
- Verify storage path exists and is writable

### Cannot connect from network
- Verify `"host": "0.0.0.0"` in config.json (not `"127.0.0.1"`)
- Check Windows Firewall allows port 3001
- Verify service is running: `sc query AESFileService`

### Files not appearing in storage
- Check storage path exists: `dir \\server\uploads` (Windows)
- Check permissions - service must have write access
- Check logs for errors
- Verify directory name in filename matches config.json

---

## 📚 Next Steps

1. **Read the full API documentation:** See `README.md`
2. **Learn production deployment:** See `GITHUB_SETUP.md`
3. **Understand configuration:** See `FIRST_TIME_SETUP.md` (this file)
4. **Deploy to production:** See deployment guides in README.md

---

## 🆘 Getting Help

1. **Check the logs:**
   ```bash
   # Windows
   type logs/service.log
   
   # Linux/macOS
   cat logs/service.log
   ```

2. **Verify configuration:**
   ```bash
   # Make sure config.json is valid JSON
   type config/config.json
   ```

3. **Test connectivity:**
   ```bash
   curl http://127.0.0.1:3001/api/health
   ```

4. **Check service status:**
   ```bash
   sc query AESFileService  # Windows
   systemctl status aes-file-service  # Linux
   ```

---

## ✅ Common Setup Issues Checklist

- [ ] npm install completed without errors
- [ ] config/config.json created (from root config.example.json)
- [ ] API key is set to a strong random value
- [ ] Storage path exists and is accessible
- [ ] Health check returns `status: ok`
- [ ] Test file upload succeeds
- [ ] File appears in storage directory
- [ ] Windows Service installed (if on Windows)
- [ ] Service auto-starts on reboot (Windows Service)

---

**You're all set!** The service is ready to use. 🚀

