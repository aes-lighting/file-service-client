const fs = require('fs');
const path = require('path');

class Config {
  constructor() {
    const configPath = path.join(__dirname, '../config/config.json');
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  get(key) {
    const keys = key.split('.');
    let value = this.config;
    for (const k of keys) {
      value = value?.[k];
    }
    return value;
  }

  getDirectories() {
    return this.config.directories || [];
  }

  isValidDirectory(dirName) {
    return this.getDirectories().some(
      d => d.path.toUpperCase() === dirName.toUpperCase()
    );
  }
}

module.exports = new Config();
