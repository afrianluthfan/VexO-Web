"""
Configuration settings for the VEXO Image Validation API.
"""

from typing import List

# Model configuration
MODEL_PATH = "vexo_v4_2.keras"
XCEPTION_INPUT_SIZE = (299, 299)
VALIDITY_THRESHOLD = 0.5

# API configuration
API_TITLE = "VEXO Image Validation API"
API_VERSION = "1.0.0"
HOST = "0.0.0.0"
PORT = 8000

# File upload limits (set to None for no limit)
# You can set these to specific numbers if you want to limit uploads
# MAX_FILES_PER_REQUEST = 100  # Example: limit to 100 files
# MAX_URLS_PER_REQUEST = 50    # Example: limit to 50 URLs
MAX_FILES_PER_REQUEST = None
MAX_URLS_PER_REQUEST = None

# OCR configuration
OCR_CONFIDENCE_THRESHOLD = 0.3
OCR_LANGUAGES = ["en"]

# Excel configuration
REQUIRED_EXCEL_COLUMNS = [
    "PROVIDER",
    "NOMOR REKENING",
    "NOMOR HP",
    "NAMA",
    "TANGGAL PEMBUKAAN",
    "KTP",
    "SELFIE",
]

# Watermark detection
SUSPICIOUS_WATERMARKS: List[str] = [
    "manycam",
    "faceapp",
    "reface",
    "deepfake",
    "ai generated",
    "artificial intelligence",
    "synthetic",
    "fake",
    "generated",
    "deepface",
    "faceswap",
    "deepfacelab",
    "avatarify",
    "face2face",
    "artbreeder",
    "thispersondoesnotexist",
    "ai face",
    "synthetic face",
]

# Supported image formats
SUPPORTED_IMAGE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".bmp", ".gif")
SUPPORTED_EXCEL_EXTENSIONS = (".xlsx", ".xls")
