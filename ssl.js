const fs = require('fs');
require('dotenv').config();

module.exports = function() {
  const privateKey = fs.readFileSync(process.env.cbprivkey, 'utf8');
  const certificate = fs.readFileSync(process.env.cbcert, 'utf8');
  const ca = fs.readFileSync(process.env.cbca, 'utf8');
  return {
    key: privateKey,
    cert: certificate,
    ca: ca
  };
}