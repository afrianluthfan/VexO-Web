"""
Configuration settings for the VEXO Image Validation API.
"""

import os
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


# Load environment variables
def get_env_bool(key: str, default: bool = False) -> bool:
    """Convert environment variable to boolean."""
    return os.getenv(key, str(default)).lower() in ("true", "1", "yes", "on")


def get_env_int(key: str, default: int) -> int:
    """Convert environment variable to integer."""
    try:
        return int(os.getenv(key, str(default)))
    except ValueError:
        return default


def get_env_float(key: str, default: float) -> float:
    """Convert environment variable to float."""
    try:
        return float(os.getenv(key, str(default)))
    except ValueError:
        return default


# Model configuration
MODEL_PATH = os.getenv("MODEL_PATH", "vexo_v4_2.keras")
XCEPTION_INPUT_SIZE = (
    get_env_int("XCEPTION_INPUT_WIDTH", 299),
    get_env_int("XCEPTION_INPUT_HEIGHT", 299),
)
VALIDITY_THRESHOLD = get_env_float("VALIDITY_THRESHOLD", 0.5)

# API configuration
API_TITLE = os.getenv("API_TITLE", "VEXO Image Validation API")
API_VERSION = os.getenv("API_VERSION", "1.0.0")
HOST = os.getenv("API_HOST", "0.0.0.0")
PORT = get_env_int("API_PORT", 8000)

# CORS configuration
CORS_ORIGINS = (
    os.getenv("CORS_ORIGINS", "*").split(",") if os.getenv("CORS_ORIGINS") else ["*"]
)
CORS_CREDENTIALS = get_env_bool("CORS_CREDENTIALS", True)
CORS_METHODS = (
    os.getenv("CORS_METHODS", "*").split(",") if os.getenv("CORS_METHODS") else ["*"]
)
CORS_HEADERS = (
    os.getenv("CORS_HEADERS", "*").split(",") if os.getenv("CORS_HEADERS") else ["*"]
)

# File upload limits (set to None for no limit)
MAX_FILES_PER_REQUEST = get_env_int("MAX_FILES_PER_REQUEST", 0) or None
MAX_URLS_PER_REQUEST = get_env_int("MAX_URLS_PER_REQUEST", 0) or None

# OCR configuration
OCR_CONFIDENCE_THRESHOLD = get_env_float("OCR_CONFIDENCE_THRESHOLD", 0.3)
OCR_LANGUAGES = os.getenv("OCR_LANGUAGES", "en").split(",")

# Logging configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_FORMAT = os.getenv(
    "LOG_FORMAT", "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

# Google Drive configuration
GOOGLE_CREDENTIALS_FILE = os.getenv("GOOGLE_CREDENTIALS_FILE", "credentials.json")

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
