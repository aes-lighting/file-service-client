# AES File Service - GitHub Repository Setup

This repository contains the **AES File Service V0** - a Node.js file upload and management service for the AES Lighting Group logistics application.

---

## 📋 What's in This Repository

- **src/** - Source code (Express server, routes, middleware, services)
- **config/config.example.json** - Configuration template (copy to config.json and fill in)
- **package.json** - Node.js dependencies
- **.gitignore** - Git ignore patterns (config files are excluded for security)
- **README.md** - Detailed API and deployment documentation

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/aes-file-service.git
cd aes-file-service
```

### 2. Install Dependencies
```bash
npm install --production
```

### 3. Create Configuration File
```bash
# Copy the example config
cp config/config.example.json config/config.json

# Edit config/config.json and fill in:
# - API key (use a strong random value)
# - Storage path (e.g., \\aes-dc1\uploads)
# - Directories (INTAKE, DELIVERY, IN-TRANSIT, etc.)
```

### 4. Start the Service (Development)
```bash
npm start
```

Service will run on `http://localhost:3001`

### 5. Test Health Check
```bash
curl http://localhost:3001/api/health
```

---

## 🔐 Configuration

**IMPORTANT:** Never commit `config/config.json` to git!

Your config file contains:
- API keys (sensitive)
- Storage paths (internal)
- Directory listings (internal)

The `.gitignore` file prevents accidental commits of `config/*.json`.

### Creating Your Config

1. Copy the template: `cp config/config.example.json config/config.json`
2. Edit `config/config.json`:
   ```json
   {
     "service": {
       "port": 3001,
       "host": "0.0.0.0"  // or "127.0.0.1" for localhost only
     },
     "storage": {
       "rootDirectory": "\\\\your-server\\uploads",  // Windows network path
       "maxFileSize": 52428800  // 50MB
     },
     "directories": [
       {"name": "INTAKE", "path": "INTAKE"},
       {"name": "DELIVERY", "path": "DELIVERY"}
     ],
     "authentication": {
       "apiKey": "your-secret-api-key-here"
     }
   }
   ```

---

## 📦 Production Deployment

### On Windows Server (Using NSSM)

```bash
# 1. Navigate to service directory
cd C:\AESFileService

# 2. Install dependencies
npm install --production

# 3. Download and extract NSSM
# (See README.md for detailed instructions)

# 4. Install as Windows Service
nssm install AESFileService node "C:\AESFileService\src\index.js"
nssm set AESFileService AppDirectory "C:\AESFileService"
nssm start AESFileService

# 5. Verify service is running
sc query AESFileService
```

### Service Management Commands
```bash
net start AESFileService     # Start
net stop AESFileService      # Stop
nssm restart AESFileService  # Restart
sc query AESFileService      # Check status
```

---

## 🛠️ Development

### Project Structure
```
src/
├── index.js                  # Entry point, graceful shutdown
├── server.js                 # Express app setup
├── config.js                 # Config loader
├── routes/
│   └── files.js             # API endpoints
├── middleware/
│   └── auth.js              # API key validation
├── services/
│   └── fileService.js       # File operations
└── utils/
    └── logger.js            # Logging
```

### Running Tests
```bash
npm test  # (if tests are added)
```

### Linting
```bash
npm run lint  # (if configured)
```

---

## 📚 API Reference

### Health Check (No Auth Required)
```bash
curl http://localhost:3001/api/health
```

### Upload File (Requires API Key)
```bash
curl -X POST http://localhost:3001/api/upload \
  -H "X-API-Key: your-api-key" \
  -F file=@file.jpg \
  -F filename=INTAKE_SHIP-001_2026-08-28T00-00-00_abc123.jpg
```

### List Directory (Requires API Key)
```bash
curl http://localhost:3001/api/list/INTAKE \
  -H "X-API-Key: your-api-key"
```

See **README.md** for full API documentation.

---

## 🔒 Security Best Practices

1. **API Keys**
   - Use strong, random API keys (64+ characters)
   - Rotate keys periodically
   - Never commit keys to git
   - Use environment variables in production (future enhancement)

2. **Network**
   - Only expose port 3001 to trusted networks
   - Use HTTPS with TLS certificate in production
   - Consider VPN tunnel for remote access

3. **File Validation**
   - Service validates directory whitelist
   - Prevents path traversal attacks
   - Enforces file size limits

4. **Access Control**
   - All file operations require API key authentication
   - Audit logs track all uploads (future enhancement)

---

## 🐛 Troubleshooting

### Service Won't Start
```bash
# Check logs
type C:\AESFileService\logs\service.log

# Verify Node.js is installed
node --version

# Verify config.json is valid JSON
type config/config.json
```

### Can't Connect
- Verify service is running: `sc query AESFileService`
- Verify host is `0.0.0.0` in config.json (not `127.0.0.1`)
- Check firewall settings
- Verify API key in request header

### Upload Fails
- Check API key is correct
- Verify directory exists in config.json
- Verify storage path is accessible
- Check file size (default 50MB limit)

---

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

### Rules
- **Never commit config/config.json** - .gitignore protects this
- **Never commit API keys** - use config.example.json as template
- Keep source code clean and commented
- Test changes before submitting PR

---

## 📄 License

[Add your license here - e.g., MIT, Apache 2.0, etc.]

---

## 👥 Support

For issues or questions:
1. Check the **README.md** documentation
2. Review **GITHUB_SETUP.md** (this file) for setup help
3. Check logs: `type logs/service.log`
4. Contact: [your-email@example.com]

---

## 🗂️ Important Files

- **config/config.example.json** - Copy this to create your config.json
- **.gitignore** - Prevents accidental commits of secrets
- **src/index.js** - Main entry point
- **README.md** - Full API and production deployment guide

---

## 🚀 Version History

- **V0 (Current)** - Initial release with core file upload functionality
- V1 (Planned) - Web dashboard for config management
- V2 (Planned) - Database audit logging, webhook callbacks

---

**Last Updated:** August 28, 2026

