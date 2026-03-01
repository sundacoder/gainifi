const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
    const apiKey = process.env.CIRCLE_API_KEY;
    if (!apiKey || apiKey === 'placeholder-circle-api-key') {
        console.error("❌ ERROR: Please add your valid CIRCLE_API_KEY to your .env.local file first.");
        console.log("Get it from: https://console.circle.com/api-keys");
        return;
    }

    console.log("Starting Entity Secret Ciphertext registration process...");

    // 1. Generate or read the 32-byte (64 char) hex entity secret
    let entitySecret = process.env.CIRCLE_ENTITY_SECRET;
    if (!entitySecret || entitySecret === 'placeholder-entity-secret' || entitySecret.length !== 64) {
        console.log("Generating a NEW secure 32-byte Entity Secret...");
        entitySecret = crypto.randomBytes(32).toString('hex');
        console.log("\n=======================================================");
        console.log("🛑 IMPORTANT: YOUR NEW ENTITY SECRET 🛑");
        console.log("=======================================================");
        console.log(entitySecret);
        console.log("\n⚠️  Copy this and save it to CIRCLE_ENTITY_SECRET in your .env.local file immediately.");
        console.log("=======================================================\n");
    } else {
        console.log("Using existing 32-byte Entity Secret from .env.local");
    }

    // 2. Fetch Entity Public Key from Circle
    console.log('Fetching Entity Public Key from Circle (Testnet)...');
    const response = await fetch('https://api-sandbox.circle.com/v1/w3s/config/entity/publicKey', {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });

    const data = await response.json();
    if (!data.data || !data.data.publicKey) {
        console.error("❌ Failed to fetch public key. Check your API Key!");
        console.error(data);
        return;
    }

    const publicKeyString = data.data.publicKey;
    const publicKey = crypto.createPublicKey({
        key: publicKeyString,
        format: 'pem',
        type: 'pkcs1'
    });

    // 3. Encrypt the entity secret using RSA-OAEP with SHA-256
    const bufferToEncrypt = Buffer.from(entitySecret, 'hex');
    const encrypted = crypto.publicEncrypt({
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
    }, bufferToEncrypt);

    // 4. Encode as Base64 (This will be exactly 684 characters)
    const ciphertext = encrypted.toString('base64');

    console.log("\n=======================================================");
    console.log("✅ YOUR ENTITY SECRET CIPHERTEXT ✅");
    console.log("=======================================================");
    console.log(ciphertext);
    console.log("=======================================================");
    console.log(`\nLength: ${ciphertext.length} characters.`);
    console.log(`\n👉 Next Step: Copy the Ciphertext above and paste it into the "Entity Secret Ciphertext" field in the Circle Console.\n`);
}

main().catch(console.error);
