import { google } from 'googleapis';
import { auth, clerkClient } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.OAUTH2_REDIRECT_URI
  );

  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ message: 'User not found' }, { status: 401 });
  }

  const clerkResponse = await clerkClient.users.getUserOauthAccessToken(
    userId,
    'oauth_google'
  );

  const accessToken = clerkResponse[0].token;
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
  });

  try {
    const response = await drive.files.list({
      pageSize: 50,
      fields: 'files(id, name, mimeType, webViewLink)',
      orderBy: 'modifiedTime desc',
    });

    return NextResponse.json(
      {
        files: response.data.files,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { message: 'Failed to fetch files' },
      { status: 500 }
    );
  }
} 