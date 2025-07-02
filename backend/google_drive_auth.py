"""
Google Drive Authentication and File Processing Module for VEXO API
"""

import os
import io
import json
import pickle
from typing import Optional
from urllib.parse import urlparse, parse_qs

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow, InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaIoBaseDownload

from PIL import Image
from fastapi import HTTPException
import tempfile


class GoogleDriveAuth:
    """Google Drive Authentication and File Access Manager"""

    # Required scopes for Google Drive API
    SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]

    def __init__(
        self,
        credentials_file: str = "credentials.json",
        token_file: str = "token.pickle",
    ):
        """
        Initialize Google Drive authentication

        Args:
            credentials_file: Path to Google OAuth2 credentials JSON file
            token_file: Path to store authentication tokens
        """
        self.credentials_file = credentials_file
        self.token_file = token_file
        self.creds = None
        self.service = None

    def authenticate(self) -> bool:
        """
        Authenticate with Google Drive API using OAuth2

        Returns:
            bool: True if authentication successful, False otherwise
        """
        try:
            # Load existing token if available
            if os.path.exists(self.token_file):
                with open(self.token_file, "rb") as token:
                    self.creds = pickle.load(token)

            # If no valid credentials, request user authorization
            if not self.creds or not self.creds.valid:
                if self.creds and self.creds.expired and self.creds.refresh_token:
                    # Refresh expired token
                    self.creds.refresh(Request())
                else:
                    # Run OAuth2 flow
                    if not os.path.exists(self.credentials_file):
                        raise FileNotFoundError(
                            f"Credentials file '{self.credentials_file}' not found. "
                            "Please download it from Google Cloud Console and place it in the backend directory."
                        )

                    flow = InstalledAppFlow.from_client_secrets_file(
                        self.credentials_file, self.SCOPES
                    )

                    try:
                        self.creds = flow.run_local_server(port=8080)
                    except Exception as auth_error:
                        print(f"❌ OAuth2 Authentication failed: {auth_error}")
                        print("\n🔧 Common solutions:")
                        print("1. Check OAuth consent screen configuration")
                        print("2. Add your email to test users in Google Cloud Console")
                        print("3. Ensure Google Drive API is enabled")
                        print("4. Run: python fix_google_auth.py")
                        raise auth_error

                # Save credentials for next run
                with open(self.token_file, "wb") as token:
                    pickle.dump(self.creds, token)

            # Build the service
            self.service = build("drive", "v3", credentials=self.creds)
            return True

        except Exception as e:
            print(f"Authentication failed: {str(e)}")
            return False

    def extract_file_id_from_url(self, drive_url: str) -> Optional[str]:
        """
        Extract Google Drive file ID from various URL formats

        Args:
            drive_url: Google Drive URL (view, edit, or direct link)

        Returns:
            str: File ID if found, None otherwise
        """
        try:
            # Parse the URL
            parsed_url = urlparse(drive_url)

            # Handle different Google Drive URL formats
            if "drive.google.com" in parsed_url.netloc:
                # Format: https://drive.google.com/file/d/FILE_ID/view
                if "/file/d/" in parsed_url.path:
                    file_id = parsed_url.path.split("/file/d/")[1].split("/")[0]
                    return file_id

                # Format: https://drive.google.com/open?id=FILE_ID
                elif "open" in parsed_url.path:
                    query_params = parse_qs(parsed_url.query)
                    if "id" in query_params:
                        return query_params["id"][0]

                # Format: https://docs.google.com/document/d/FILE_ID/edit
                elif parsed_url.netloc.startswith("docs.google.com"):
                    if "/d/" in parsed_url.path:
                        file_id = parsed_url.path.split("/d/")[1].split("/")[0]
                        return file_id

            return None

        except Exception as e:
            print(f"Error extracting file ID: {str(e)}")
            return None

    def get_file_info(self, file_id: str) -> Optional[dict]:
        """
        Get file information from Google Drive

        Args:
            file_id: Google Drive file ID

        Returns:
            dict: File information or None if error
        """
        try:
            if not self.service:
                raise RuntimeError("Google Drive service not authenticated")

            file_info = (
                self.service.files()
                .get(
                    fileId=file_id,
                    fields="id,name,mimeType,size,createdTime,modifiedTime",
                )
                .execute()
            )

            return file_info

        except HttpError as e:
            if e.resp.status == 404:
                print(f"File not found: {file_id}")
            elif e.resp.status == 403:
                print(f"Access denied: {file_id}")
            else:
                print(f"HTTP Error: {e}")
            return None
        except Exception as e:
            print(f"Error getting file info: {str(e)}")
            return None

    def download_file(self, file_id: str) -> Optional[bytes]:
        """
        Download file content from Google Drive

        Args:
            file_id: Google Drive file ID

        Returns:
            bytes: File content or None if error
        """
        try:
            if not self.service:
                raise RuntimeError("Google Drive service not authenticated")

            # Get file info first to check if it's an image
            file_info = self.get_file_info(file_id)
            if not file_info:
                return None

            # Check if file is an image
            mime_type = file_info.get("mimeType", "")
            if not mime_type.startswith("image/"):
                raise ValueError(f"File is not an image. MIME type: {mime_type}")

            # Download the file
            request = self.service.files().get_media(fileId=file_id)
            file_io = io.BytesIO()
            downloader = MediaIoBaseDownload(file_io, request)

            done = False
            while done is False:
                status, done = downloader.next_chunk()
                if status:
                    print(f"Download progress: {int(status.progress() * 100)}%")

            file_io.seek(0)
            return file_io.getvalue()

        except HttpError as e:
            if e.resp.status == 404:
                print(f"File not found: {file_id}")
            elif e.resp.status == 403:
                print(f"Access denied to file: {file_id}")
            else:
                print(f"HTTP Error downloading file: {e}")
            return None
        except Exception as e:
            print(f"Error downloading file: {str(e)}")
            return None

    def download_image_from_url(self, drive_url: str) -> Optional[Image.Image]:
        """
        Download and return PIL Image from Google Drive URL

        Args:
            drive_url: Google Drive URL

        Returns:
            PIL.Image: Downloaded image or None if error
        """
        try:
            # Extract file ID from URL
            file_id = self.extract_file_id_from_url(drive_url)
            if not file_id:
                raise ValueError("Could not extract file ID from URL")

            # Download file content
            file_content = self.download_file(file_id)
            if not file_content:
                return None

            # Convert to PIL Image
            image = Image.open(io.BytesIO(file_content))

            # Convert to RGB if necessary
            if image.mode != "RGB":
                image = image.convert("RGB")

            return image

        except Exception as e:
            print(f"Error downloading image from URL: {str(e)}")
            return None


# Global Google Drive authentication instance
drive_auth = GoogleDriveAuth()


def initialize_google_drive_auth() -> bool:
    """
    Initialize Google Drive authentication

    Returns:
        bool: True if successful, False otherwise
    """
    return drive_auth.authenticate()


def process_google_drive_image(
    drive_url: str, extract_features_func, predict_validity_func
) -> dict:
    """
    Process an image from Google Drive URL using VEXO validation functions

    Args:
        drive_url: Google Drive URL containing the image
        extract_features_func: Function to extract features from image
        predict_validity_func: Function to predict image validity

    Returns:
        dict: Processing results with validation score and status
    """
    try:
        # Authenticate if not already done
        if not drive_auth.service:
            if not drive_auth.authenticate():
                raise RuntimeError("Failed to authenticate with Google Drive")

        # Download image from Google Drive
        pil_image = drive_auth.download_image_from_url(drive_url)
        if not pil_image:
            raise ValueError("Failed to download image from Google Drive")

        # Extract file ID for filename
        file_id = drive_auth.extract_file_id_from_url(drive_url)
        file_info = drive_auth.get_file_info(file_id) if file_id else None
        filename = (
            file_info.get("name", f"drive_image_{file_id}")
            if file_info
            else "drive_image"
        )

        # Extract features using provided function
        features = extract_features_func(pil_image=pil_image)

        # Get prediction score using provided function
        score = predict_validity_func(features)

        # Determine validity
        is_valid = score >= 0.5

        return {
            "filename": filename,
            "file_id": file_id,
            "drive_url": drive_url,
            "validity_score": score,
            "percentage": score * 100,
            "is_valid": is_valid,
            "message": "Image is valid" if is_valid else "Image is not valid",
        }

    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error processing Google Drive image: {str(e)}"
        )
