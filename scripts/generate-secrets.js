/**
 * JWT Secrets Generator for ta3lem
 *
 * Generates cryptographically secure 64-byte hex strings suitable for
 * JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in your .env.production file.
 *
 * Usage:
 *   node scripts/generate-secrets.js
 *
 * Output (copy-paste into .env):
 *   JWT_ACCESS_SECRET=a1b2c3...
 *   JWT_REFRESH_SECRET=d4e5f6...
 */

const crypto = require('crypto');

function generateSecret(label) {
  const bytes = crypto.randomBytes(64);
  const hex = bytes.toString('hex');
  console.log(`${label}=${hex}`);
}

function main() {
  generateSecret('JWT_ACCESS_SECRET');
  generateSecret('JWT_REFRESH_SECRET');
  console.log('\n# Copy the lines above into your .env.production file.');
  console.log('# Keep these secrets secure — never commit them to version control.');
}

main();
