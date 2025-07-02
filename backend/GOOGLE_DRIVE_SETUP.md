# Google Drive Integration Setup Guide

This guide explains how to set up Google Drive authentication for the VEXO Image Validation API.

## Prerequisites

1. **Google Cloud Project**: You need a Google Cloud Project with the Google Drive API enabled.
2. **OAuth2 Credentials**: You need to create OAuth2 credentials for a desktop application.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your project ID

## Step 2: Enable Google Drive API

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Google Drive API"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen (IMPORTANT!)

1. Navigate to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in the **App Information**:
   - **App name**: "VEXO Image Validator" (or any name you prefer)
   - **User support email**: Your email address
   - **App logo**: Optional
   - **App domain**: Leave blank for now
   - **Developer contact information**: Your email address
5. Click "Save and Continue"
6. **Scopes** section:
   - Click "Add or Remove Scopes"
   - Search for "Google Drive API"
   - Select: `https://www.googleapis.com/auth/drive.readonly`
   - Click "Update" then "Save and Continue"
7. **Test users** section (CRITICAL STEP):
   - Click "Add Users"
   - Add your Gmail address (the one you'll use to authenticate)
   - Click "Save and Continue"
8. **Summary** section:
   - Review your settings
   - Click "Back to Dashboard"

## Step 4: Create OAuth2 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. For Application type, choose "Desktop application"
4. Give it a name (e.g., "VEXO Image Validator Desktop")
5. Click "Create"

## Step 5: Download Credentials

1. After creating the OAuth client, click the download button (↓) next to your new credential
2. Save the downloaded JSON file as `credentials.json` in your `backend` directory
3. **Important**: Never commit this file to version control!

## Step 6: File Structure

Your backend directory should look like this:

```
backend/
├── main.py
├── google_drive_auth.py
├── credentials.json          # Your OAuth2 credentials (keep private!)
├── token.pickle             # Will be created automatically after first auth
├── requirements.txt
└── ...
```

## Step 7: Install Dependencies

Make sure you have installed the new dependencies:

```bash
pip install -r requirements.txt
```

## Step 8: First Run Authentication

1. Start your VEXO API server:

   ```bash
   python main.py
   ```

2. On first run, it will:

   - Open a browser window for Google OAuth2 authentication
   - Ask you to sign in to your Google account
   - Ask for permission to access your Google Drive (read-only)
   - Save the authentication token for future use

3. After successful authentication, the server will be ready to process Google Drive images

## Step 9: Test the Integration

You can test the Google Drive integration using the following endpoints:

### Single Image Validation

```bash
curl -X POST "http://localhost:8000/validate_google_drive" \
     -H "Content-Type: application/json" \
     -d '{"drive_url": "https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing"}'
```

### Multiple Images Validation

```bash
curl -X POST "http://localhost:8000/validate_google_drive_multiple" \
     -H "Content-Type: application/json" \
     -d '{"drive_urls": ["https://drive.google.com/file/d/FILE_ID_1/view", "https://drive.google.com/file/d/FILE_ID_2/view"]}'
```

## Supported Google Drive URL Formats

The system supports various Google Drive URL formats:

- `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
- `https://drive.google.com/file/d/FILE_ID/edit`
- `https://drive.google.com/open?id=FILE_ID`

## Security Considerations

1. **Credentials Security**: Never share or commit your `credentials.json` file
2. **Token Storage**: The `token.pickle` file contains access tokens - keep it secure
3. **Permissions**: The app only requests read-only access to Google Drive
4. **File Access**: Users can only process images they have access to in Google Drive

## Troubleshooting

### 🚨 Error 403: access_denied (Most Common Issue)

If you get this error:

```
Error 403: access_denied
Request details: access_type=offline response_type=code redirect_uri=http://localhost:8080/ ...
```

**Root Cause**: Your app is in testing mode but you haven't added yourself as a test user.

**Solution**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "OAuth consent screen"
3. Click "Edit App"
4. Go to the "Test users" section
5. Click "Add Users"
6. Add the Gmail address you're trying to authenticate with
7. Click "Save"
8. Try running your app again

**Alternative Solution** (if you want to make the app public):

1. In "OAuth consent screen", click "Publish App"
2. This will make your app available to any Google user
3. **Warning**: Only do this if you're comfortable with public access

### Authentication Issues

- Make sure `credentials.json` is in the correct location
- Ensure the Google Drive API is enabled in your Google Cloud Project
- Check that your OAuth2 consent screen is properly configured

### File Access Issues

- Verify the Google Drive file URL is correct
- Ensure the file is an image (JPEG, PNG, etc.)
- Make sure you have permission to access the file
- Check that the file is not restricted by organization policies

### API Errors

- Check the server logs for detailed error messages
- Verify all dependencies are installed correctly
- Ensure the authentication token hasn't expired

## Environment Variables (Optional)

You can set these environment variables to customize the authentication:

- `GOOGLE_CREDENTIALS_FILE`: Path to credentials.json (default: "credentials.json")
- `GOOGLE_TOKEN_FILE`: Path to token.pickle (default: "token.pickle")

## Example Usage in Python

```python
import requests

# Validate single Google Drive image
response = requests.post(
    "http://localhost:8000/validate_google_drive",
    json={"drive_url": "https://drive.google.com/file/d/1fVFzaykARNfmK0oIKV-Sarb111i4HGYu/view?usp=sharing"}
)

result = response.json()
print(f"Validity Score: {result['percentage']:.1f}%")
print(f"Is Valid: {result['is_valid']}")
```
