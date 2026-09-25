# AES File Service - GitHub Repository Setup

This repository contains the **AES File Service V0** - a Node.js file upload and management service for the AES Lighting Group logistics application.

---

## What's in This Repository

- **Root JS modules** — Express app (`server.js`, `index.js`), filename-encoded upload helpers, auth/config/logger (as-built; nested `src/` layout is Target)
- **`src/services/uploadService.js`** — Project-bound packing-slip / intake upload logic
- **`config.example.json`** — Configuration template (copy locally; never commit secrets)
- **`.specify/`** — Binding Spec Kit + `files:` ontology (start at [`.specify/README.md`](.specify/README.md))
- **`spec-kit/`** — Non-binding human architecture notes
- **`package.json`** — Node.js dependencies
- **`.gitignore`** — Excludes secrets, venv, runtime data
- **`README.md`** — API and deployment overview

Product MVP acceptance is **Deferred** — see [`.specify/mvp-definition.md`](.specify/mvp-definition.md).

---

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/aes-lighting/file-service-client.git
cd file-service-client
```

### 2. Install Dependencies
```bash
npm install --production
```

### 3. Create Configuration File
```bash
# Copy the example config (path expected by config.js is config/config.json)
mkdir -p config
cp config.example.json config/config.json

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

## Important Files

- **`config.example.json`** — Copy into `config/config.json` (do not commit real keys)
- **`.gitignore`** — Prevents accidental commits of secrets / ontology venv
- **`index.js` / `server.js`** — Process entry and Express app (as-built)
- **`.specify/`** — Binding Spec Kit, specs 001/002, ontology validation
- **`README.md`** — API and production deployment guide

### Spec Kit / ontology validation (optional for operators)

```bash
python3 -m venv .specify/scripts/.venv
.specify/scripts/.venv/bin/pip install -r .specify/scripts/requirements.txt
.specify/scripts/run_validate_spec.sh
```

---

## Version History

- **V0 (Current)** — File upload surfaces + Spec Kit / ontology baseline
- V1 (Planned) — Web dashboard for config management
- V2 (Planned) — Database audit logging, webhook callbacks

---

**Last Updated:** September 25, 2026

