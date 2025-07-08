"""
VEXO Image Validation API

A FastAPI-based service for validating images using AI detection and watermark analysis.
"""

import os
import io
import tempfile
import zipfile
import base64
from typing import List

import pandas as pd
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from PIL import Image

# Import custom modules
from config import (
    API_TITLE,
    API_VERSION,
    HOST,
    PORT,
    MAX_FILES_PER_REQUEST,
    MAX_URLS_PER_REQUEST,
    REQUIRED_EXCEL_COLUMNS,
    SUPPORTED_IMAGE_EXTENSIONS,
    SUPPORTED_EXCEL_EXTENSIONS,
)
from models import (
    GoogleDriveRequest,
    GoogleDriveMultipleRequest,
    HealthCheckResponse,
    APIInfoResponse,
)
from exceptions import (
    InvalidImageFormatException,
    FileLimitExceededException,
    InvalidFileTypeException,
)
from model_manager import model_manager
from watermark_detector import watermark_detector
from validation_service import validation_service
from image_utils import validate_image_format, validate_file_extension
from google_drive_auth import initialize_google_drive_auth, process_google_drive_image
from logger import setup_logging, get_logger
from utils import decode_base64_image, create_excel_response, format_validation_note

# Set up logging
setup_logging()
logger = get_logger(__name__)

# Initialize the FastAPI app
app = FastAPI(title=API_TITLE, version=API_VERSION)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize models and services when the API starts."""
    logger.info("Starting VEXO Image Validation API...")

    try:
        # Initialize ML models
        logger.info("Initializing ML models...")
        model_manager.initialize_models()

        # Initialize OCR for watermark detection
        logger.info("Initializing OCR for watermark detection...")
        watermark_detector.initialize_ocr()

        # Initialize Google Drive authentication (optional)
        logger.info("Initializing Google Drive authentication...")
        if initialize_google_drive_auth():
            logger.info("Google Drive authentication successful!")
        else:
            logger.warning(
                "Google Drive authentication failed - Google Drive features will be unavailable"
            )

        logger.info("VEXO Image Validation API startup completed successfully!")

    except Exception as e:
        logger.error(f"Error during startup: {e}")
        # Continue startup even if some components fail
        pass


@app.get("/", response_model=APIInfoResponse)
async def root():
    """Root endpoint with API information."""
    return APIInfoResponse(
        message="VEXO Image Validation API",
        version=API_VERSION,
        endpoints={
            "POST /validate": "Upload a single image for validation",
            "POST /validate_multiple": "Upload multiple images for validation (no limit)",
            "POST /validate_google_drive": "Validate image from Google Drive URL",
            "POST /validate_google_drive_multiple": "Validate multiple images from Google Drive URLs (no limit)",
            "POST /process_excel": "Process Excel file with image validation",
            "POST /upload_zip": "Upload and process zip file with images",
            "GET /health": "Health check endpoint",
        },
    )


@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint."""
    models_loaded = model_manager.are_models_loaded()
    return HealthCheckResponse(
        status="healthy" if models_loaded else "unhealthy", models_loaded=models_loaded
    )


@app.post("/validate")
async def validate_single_image(file: UploadFile = File(...)):
    """Validate a single uploaded image."""
    if not validate_image_format(file.content_type):
        raise InvalidImageFormatException()

    result = await validation_service.validate_uploaded_image(file)
    return JSONResponse(content=result)


@app.post("/validate_multiple")
async def validate_multiple_images(files: List[UploadFile] = File(...)):
    """Validate multiple uploaded images."""
    if MAX_FILES_PER_REQUEST is not None and len(files) > MAX_FILES_PER_REQUEST:
        raise FileLimitExceededException(
            f"Maximum {MAX_FILES_PER_REQUEST} files allowed per request"
        )

    results = []
    for file in files:
        if not validate_image_format(file.content_type):
            results.append(
                {"filename": file.filename, "error": "File must be an image"}
            )
            continue

        try:
            result = await validation_service.validate_uploaded_image(file)
            results.append(result)
        except Exception as e:
            results.append({"filename": file.filename, "error": str(e)})

    return JSONResponse(content={"results": results})


@app.post("/process_excel")
async def process_excel_file(file: UploadFile = File(...)):
    """Process Excel file with SELFIE column images."""
    if not validate_file_extension(file.filename, SUPPORTED_EXCEL_EXTENSIONS):
        raise InvalidFileTypeException(
            f"File must be an Excel file {SUPPORTED_EXCEL_EXTENSIONS}"
        )

    try:
        # Read and validate Excel file
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))

        # Check for required columns
        missing_columns = [
            col for col in REQUIRED_EXCEL_COLUMNS if col not in df.columns
        ]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing_columns)}",
            )

        # Add NOTES column
        df["NOTES"] = ""

        # Process each row's SELFIE image
        for index, row in df.iterrows():
            try:
                selfie_data = row["SELFIE"]

                if pd.isna(selfie_data) or selfie_data == "":
                    df.at[index, "NOTES"] = "No image provided"
                    continue

                # Process base64 image data
                pil_image = decode_base64_image(selfie_data)
                if pil_image is None:
                    df.at[index, "NOTES"] = "Invalid image format"
                    continue

                # Validate the image
                result = validation_service.validate_pil_image(
                    pil_image, f"row_{index}"
                )
                df.at[index, "NOTES"] = format_validation_note(result)

            except Exception as e:
                df.at[index, "NOTES"] = f"Error processing image: {str(e)}"

        # Create Excel response
        return create_excel_response(df, file.filename)

    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error processing Excel file: {str(e)}"
        )


@app.post("/upload_zip")
async def upload_zip_file(file: UploadFile = File(...)):
    """Upload and process a zip file containing images."""
    if not file.filename.endswith(".zip"):
        raise InvalidFileTypeException("File must be a zip archive")

    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            # Extract and process zip file
            zip_path = os.path.join(temp_dir, "uploaded.zip")

            with open(zip_path, "wb") as zip_file:
                zip_file.write(await file.read())

            results = []
            with zipfile.ZipFile(zip_path, "r") as zip_ref:
                zip_ref.extractall(temp_dir)

                # Process each image file
                for extracted_file in os.listdir(temp_dir):
                    if validate_file_extension(
                        extracted_file, SUPPORTED_IMAGE_EXTENSIONS
                    ):
                        file_path = os.path.join(temp_dir, extracted_file)

                        try:
                            with open(file_path, "rb") as img_file:
                                contents = img_file.read()
                                pil_image = Image.open(io.BytesIO(contents))

                                result = validation_service.validate_pil_image(
                                    pil_image, extracted_file
                                )
                                results.append(result)

                        except Exception as e:
                            results.append(
                                {
                                    "filename": extracted_file,
                                    "error": f"Error processing image: {str(e)}",
                                }
                            )

            return JSONResponse(content={"results": results})

    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error processing zip file: {str(e)}"
        )


@app.post("/validate_google_drive")
async def validate_google_drive_image(request: GoogleDriveRequest):
    """Validate an image from Google Drive URL."""
    try:
        result = process_google_drive_image(
            request.drive_url,
            model_manager.extract_features,
            model_manager.predict_image_validity,
            watermark_detector.detect_watermarks,
        )
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error processing Google Drive image: {str(e)}"
        )


@app.post("/validate_google_drive_multiple")
async def validate_google_drive_multiple_images(request: GoogleDriveMultipleRequest):
    """Validate multiple images from Google Drive URLs."""
    if (
        MAX_URLS_PER_REQUEST is not None
        and len(request.drive_urls) > MAX_URLS_PER_REQUEST
    ):
        raise FileLimitExceededException(
            f"Maximum {MAX_URLS_PER_REQUEST} URLs allowed per request"
        )

    results = []
    for drive_url in request.drive_urls:
        try:
            result = process_google_drive_image(
                drive_url,
                model_manager.extract_features,
                model_manager.predict_image_validity,
                watermark_detector.detect_watermarks,
            )
            results.append(result)
        except Exception as e:
            results.append(
                {
                    "drive_url": drive_url,
                    "error": f"Error processing Google Drive image: {str(e)}",
                }
            )

    return JSONResponse(content={"results": results})


if __name__ == "__main__":
    logger.info("Starting VEXO Image Validation API server...")
    uvicorn.run(app, host=HOST, port=PORT)
