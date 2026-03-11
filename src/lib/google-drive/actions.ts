"use server";

import { google } from 'googleapis';
import { Readable } from 'stream';

// Helper to convert File to readable stream
function fileToStream(file: File) {
    const stream = new Readable();
    stream._read = () => { };
    file.arrayBuffer().then(buffer => {
        stream.push(Buffer.from(buffer));
        stream.push(null);
    });
    return stream;
}

export async function uploadFileToGoogleDrive(formData: FormData, folderId: string, fileName: string) {
    console.log('--- Google Drive File Upload Started ---');
    console.log('File Name:', fileName);
    console.log('Target Folder ID:', folderId);

    try {
        const file = formData.get('file') as File;
        if (!file) throw new Error('No file provided in FormData');

        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
            throw new Error('Google OAuth credentials missing in environment variables');
        }

        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
        );

        auth.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });

        const drive = google.drive({ version: 'v3', auth });

        // Convert the File/Blob to a dynamic buffer
        const buffer = Buffer.from(await file.arrayBuffer());
        const media = {
            mimeType: file.type,
            body: Readable.from(buffer),
        };

        const fileMetadata = {
            name: fileName,
            parents: [folderId],
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink, parents',
            supportsAllDrives: true,
        });

        console.log('SUCCESS: Uploaded file to Drive');
        console.log('File ID:', response.data.id);
        console.log('File URL:', response.data.webViewLink);
        console.log('Parent Folder:', response.data.parents?.[0]);

        return { success: true, fileId: response.data.id, fileUrl: response.data.webViewLink };
    } catch (error: any) {
        console.error('ERROR: Google Drive Upload Failed');
        console.error('Message:', error.message);
        return { success: false, error: error.message };
    } finally {
        console.log('--- Google Drive File Upload Ended ---');
    }
}

export async function createGoogleDriveFolder(folderName: string) {
    console.log('--- Google Drive Folder Creation Started ---');
    console.log('Folder Name:', folderName);
    console.log('Parent ID:', process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID);

    try {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
            throw new Error('Google OAuth credentials missing in environment variables');
        }

        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
        );

        auth.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });

        const drive = google.drive({ version: 'v3', auth });

        const timestamp = new Date().toISOString().replace(/T/, '-').replace(/\..+/, '').replace(/:/g, '').slice(0, 13);
        const uniqueFolderName = `${folderName} (${timestamp})`;

        const parentId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID?.trim();
        const fileMetadata = {
            name: uniqueFolderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parentId ? [parentId] : [],
        };

        const folder = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id, webViewLink',
            supportsAllDrives: true,
        });

        console.log('Successfully created folder:', folder.data.id);
        return { success: true, folderId: folder.data.id, folderUrl: folder.data.webViewLink };
    } catch (error: any) {
        console.error('CRITICAL: Google Drive Error:', error.message);
        if (error.response?.data) {
            console.error('Detailed Error Feedback:', JSON.stringify(error.response.data, null, 2));
        }
        return { success: false, error: error.message };
    } finally {
        console.log('--- Google Drive Process Ended ---');
    }
}
