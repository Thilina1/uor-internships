import { google } from 'googleapis';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

import { fileURLToPath } from 'url';

const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'client_secret.json');

async function main() {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        console.error('Error: client_secret.json not found in scripts directory.');
        process.exit(1);
    }

    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const config = credentials.installed || credentials.web;

    if (!config) {
        console.error('Error: Unknown client_secret.json format. Expected "installed" or "web" root object.');
        process.exit(1);
    }

    const { client_secret, client_id, redirect_uris } = config;

    // Use http://localhost:3000 as a default if none are provided
    const redirectUri = (redirect_uris && redirect_uris.length > 0)
        ? redirect_uris[0]
        : 'http://localhost:3000';

    console.log('\n--- Script Configuration ---');
    console.log('Using Redirect URI:', redirectUri);
    console.log('--- Please ensure this URI is added to your Google Cloud Console ---\n');

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
    });

    console.log('Authorize this app by visiting this url:');
    console.log('\x1b[36m%s\x1b[0m', authUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter the code from that page here: ', async (code) => {
        rl.close();
        try {
            const { tokens } = await oAuth2Client.getToken(code);
            console.log('\n--- SUCCESS! ---');
            console.log('Refresh Token:', tokens.refresh_token);
            console.log('\nAdd these to your .env.local:');
            console.log(`GOOGLE_CLIENT_ID=${client_id}`);
            console.log(`GOOGLE_CLIENT_SECRET=${client_secret}`);
            console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
        } catch (err) {
            console.error('Error retrieving access token', err);
        }
    });
}

main().catch(console.error);
