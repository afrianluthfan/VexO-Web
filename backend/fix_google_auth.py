"""
Quick fix script for Google Drive authentication issues
This script helps diagnose and fix common OAuth2 setup problems
"""

import os
import json
import sys


def check_credentials_file():
    """Check if credentials file exists and is valid"""
    creds_file = "credentials.json"

    if not os.path.exists(creds_file):
        print("❌ credentials.json not found!")
        print("   Please download it from Google Cloud Console:")
        print("   1. Go to https://console.cloud.google.com/")
        print("   2. Navigate to APIs & Services > Credentials")
        print("   3. Download your OAuth2 client credentials")
        print("   4. Save as 'credentials.json' in this directory")
        return False

    try:
        with open(creds_file, "r") as f:
            creds = json.load(f)

        # Check if it's the right type of credentials
        if "installed" in creds:
            print("✅ Desktop application credentials found")
            client_id = creds["installed"]["client_id"]
            print(f"   Client ID: {client_id}")
        elif "web" in creds:
            print("⚠️  Web application credentials detected")
            print("   You need Desktop application credentials for this setup")
            print("   Please create new OAuth2 credentials as 'Desktop application'")
            return False
        else:
            print("❌ Invalid credentials format")
            return False

        return True

    except json.JSONDecodeError:
        print("❌ credentials.json is not valid JSON")
        return False
    except Exception as e:
        print(f"❌ Error reading credentials: {e}")
        return False


def check_oauth_consent_screen():
    """Provide instructions for OAuth consent screen setup"""
    print("\n🔧 OAuth Consent Screen Checklist:")
    print("   Please verify these settings in Google Cloud Console:")
    print("   📍 Go to: APIs & Services > OAuth consent screen")
    print("")
    print("   ✓ App name: Set (e.g., 'VEXO Image Validator')")
    print("   ✓ User support email: Your email address")
    print("   ✓ Developer contact: Your email address")
    print("   ✓ Scopes: https://www.googleapis.com/auth/drive.readonly")
    print("   ✓ Test users: Add your Gmail address")
    print("")
    print("   🚨 CRITICAL: Make sure to add your email to 'Test users'!")


def check_api_enabled():
    """Instructions to check if Google Drive API is enabled"""
    print("\n📡 Google Drive API Checklist:")
    print("   📍 Go to: APIs & Services > Library")
    print("   🔍 Search for: Google Drive API")
    print("   ✓ Status should show: 'API enabled' (green checkmark)")
    print("   If not enabled, click 'Enable'")


def clean_token_file():
    """Remove existing token file to force re-authentication"""
    token_file = "token.pickle"

    if os.path.exists(token_file):
        try:
            os.remove(token_file)
            print(f"✅ Removed {token_file} - will force fresh authentication")
        except Exception as e:
            print(f"❌ Could not remove {token_file}: {e}")
    else:
        print("ℹ️  No existing token file found")


def main():
    """Main diagnostic function"""
    print("🔍 VEXO Google Drive Authentication Diagnostic Tool")
    print("=" * 60)

    # Check credentials file
    print("\n1. Checking credentials.json...")
    creds_ok = check_credentials_file()

    # Check OAuth consent screen setup
    check_oauth_consent_screen()

    # Check API enabled
    check_api_enabled()

    # Clean token file if requested
    if len(sys.argv) > 1 and sys.argv[1] == "--clean-token":
        print("\n4. Cleaning authentication token...")
        clean_token_file()

    print("\n" + "=" * 60)

    if creds_ok:
        print("🎯 Next Steps:")
        print("   1. Verify OAuth consent screen settings above")
        print("   2. Ensure Google Drive API is enabled")
        print("   3. Add your email to test users")
        print("   4. Run: python main.py")
        print("   5. If still failing, run: python fix_google_auth.py --clean-token")
    else:
        print("🚨 Fix the credentials file first, then re-run this script")

    print("\n💡 For detailed setup instructions, see: GOOGLE_DRIVE_SETUP.md")


if __name__ == "__main__":
    main()
