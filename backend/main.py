"""
VEXO Image Validation API

A FastAPI-based service for validating images using AI detection and watermark analysis.
"""

import os
import io
import tempfile
import zipfile
import base64
import uuid
from typing import List

import pandas as pd
import uvicorn
from fastapi import (
    FastAPI,
    File,
    UploadFile,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
)
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
    CORS_ORIGINS,
    CORS_CREDENTIALS,
    CORS_METHODS,
    CORS_HEADERS,
)
from models import (
    GoogleDriveRequest,
    GoogleDriveMultipleRequest,
    HealthCheckResponse,
    APIInfoResponse,
    InvalidImageFormatException,
    FileLimitExceededException,
    InvalidFileTypeException,
)
from services import (
    model_manager,
    watermark_detector,
    validation_service,
    progress_manager,
    initialize_google_drive_auth,
    process_google_drive_image,
)
from utils import (
    validate_image_format,
    validate_file_extension,
    setup_logging,
    get_logger,
    decode_base64_image,
    create_excel_response,
    format_validation_note,
)

# Set up logging
setup_logging()
logger = get_logger(__name__)

# Initialize the FastAPI app
app = FastAPI(title=API_TITLE, version=API_VERSION)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=CORS_CREDENTIALS,
    allow_methods=CORS_METHODS,
    allow_headers=CORS_HEADERS,
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
            "WS /ws/progress/{session_id}": "WebSocket for real-time progress updates",
        },
    )


@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint."""
    models_loaded = model_manager.are_models_loaded()
    return HealthCheckResponse(
        status="healthy" if models_loaded else "unhealthy", models_loaded=models_loaded
    )


@app.websocket("/ws/progress/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time progress updates."""
    try:
        await progress_manager.connect(websocket, session_id)

        # Keep the connection alive
        while True:
            # Wait for any message from client (like ping/pong)
            await websocket.receive_text()
    except WebSocketDisconnect:
        progress_manager.disconnect(session_id)
    except Exception as e:
        logger.error(f"WebSocket error for session {session_id}: {e}")
        progress_manager.disconnect(session_id)


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


@app.post("/validate_multiple_with_progress/{session_id}")
async def validate_multiple_images_with_progress(
    session_id: str, files: List[UploadFile] = File(...)
):
    """Validate multiple uploaded images with real-time progress updates."""
    if MAX_FILES_PER_REQUEST is not None and len(files) > MAX_FILES_PER_REQUEST:
        raise FileLimitExceededException(
            f"Maximum {MAX_FILES_PER_REQUEST} files allowed per request"
        )

    # Initialize progress tracking
    await progress_manager.start_task(session_id, len(files), "Image Validation")

    results = []
    processed_count = 0

    try:
        for i, file in enumerate(files):
            # Update progress with current file
            await progress_manager.update_progress(
                session_id, processed_count, f"Processing {file.filename}"
            )

            if not validate_image_format(file.content_type):
                results.append(
                    {"filename": file.filename, "error": "File must be an image"}
                )
            else:
                try:
                    result = await validation_service.validate_uploaded_image(file)
                    results.append(result)
                except Exception as e:
                    results.append({"filename": file.filename, "error": str(e)})

            processed_count += 1
            # Update progress after processing each file
            await progress_manager.update_progress(
                session_id, processed_count, f"Completed {file.filename}"
            )

        # Mark task as completed
        await progress_manager.complete_task(
            session_id, f"Successfully processed {len(files)} images"
        )

        return JSONResponse(content={"results": results, "session_id": session_id})

    except Exception as e:
        await progress_manager.error_task(session_id, str(e))
        raise HTTPException(
            status_code=500, detail=f"Error processing images: {str(e)}"
        )


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
        result = process_google_drive_image(request.drive_url)
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

    try:
        # Step 1: Download all images first
        from services.google_drive_auth import download_google_drive_images_batch

        downloaded_images = download_google_drive_images_batch(request.drive_urls)

        # Step 2: Process all downloaded images using the same validation service
        results = []

        for item in downloaded_images:
            if "error" in item:
                # Add error result
                results.append({"drive_url": item["drive_url"], "error": item["error"]})
            else:
                # Validate the image using the same service as regular uploads
                try:
                    from services.validation_service import validation_service

                    result = validation_service.validate_pil_image(
                        item["pil_image"], item["filename"]
                    )

                    # Add Google Drive specific fields
                    result["file_id"] = item["file_id"]
                    result["drive_url"] = item["drive_url"]

                    results.append(result)

                except Exception as e:
                    results.append(
                        {
                            "drive_url": item["drive_url"],
                            "error": f"Validation error: {str(e)}",
                        }
                    )

        return JSONResponse(content={"results": results})

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing Google Drive images: {str(e)}"
        )


@app.post("/validate_google_drive_multiple_with_progress/{session_id}")
async def validate_google_drive_multiple_images_with_progress(
    session_id: str, request: GoogleDriveMultipleRequest
):
    """Validate multiple images from Google Drive URLs with real-time progress updates."""
    if (
        MAX_URLS_PER_REQUEST is not None
        and len(request.drive_urls) > MAX_URLS_PER_REQUEST
    ):
        raise FileLimitExceededException(
            f"Maximum {MAX_URLS_PER_REQUEST} URLs allowed per request"
        )

    # Calculate total steps: download + validation for each URL
    total_steps = len(request.drive_urls) * 2  # Download + validate each image

    # Initialize progress tracking
    await progress_manager.start_task(
        session_id, total_steps, "Google Drive Validation"
    )

    results = []
    processed_count = 0

    try:
        # Step 1: Download all images first
        await progress_manager.update_progress(
            session_id, processed_count, "Starting Google Drive downloads..."
        )

        from services.google_drive_auth import download_google_drive_images_batch

        downloaded_images = download_google_drive_images_batch(request.drive_urls)

        # Update progress for downloads
        for i, downloaded_item in enumerate(downloaded_images):
            processed_count += 1
            drive_url = downloaded_item.get("drive_url", f"URL {i+1}")
            if "error" in downloaded_item:
                await progress_manager.update_progress(
                    session_id, processed_count, f"Download failed: {drive_url}"
                )
            else:
                await progress_manager.update_progress(
                    session_id, processed_count, f"Downloaded: {drive_url}"
                )

        # Step 2: Process all downloaded images using the same validation service
        valid_images = [item for item in downloaded_images if "pil_image" in item]

        for i, item in enumerate(downloaded_images):
            processed_count += 1

            if "error" in item:
                # Add error result
                results.append({"drive_url": item["drive_url"], "error": item["error"]})
                await progress_manager.update_progress(
                    session_id,
                    processed_count,
                    f"Skipped due to error: {item['drive_url']}",
                )
            else:
                # Validate the image using the same service as regular uploads
                try:
                    from services.validation_service import validation_service

                    result = validation_service.validate_pil_image(
                        item["pil_image"], item["filename"]
                    )

                    # Add Google Drive specific fields
                    result["file_id"] = item["file_id"]
                    result["drive_url"] = item["drive_url"]

                    results.append(result)

                    await progress_manager.update_progress(
                        session_id, processed_count, f"Validated: {item['drive_url']}"
                    )

                except Exception as e:
                    results.append(
                        {
                            "drive_url": item["drive_url"],
                            "error": f"Validation error: {str(e)}",
                        }
                    )
                    await progress_manager.update_progress(
                        session_id,
                        processed_count,
                        f"Validation failed: {item['drive_url']}",
                    )

        # Mark task as completed
        await progress_manager.complete_task(
            session_id,
            f"Successfully processed {len(request.drive_urls)} Google Drive images",
        )

        return JSONResponse(content={"results": results, "session_id": session_id})

    except Exception as e:
        await progress_manager.error_task(session_id, str(e))
        raise HTTPException(
            status_code=500, detail=f"Error processing Google Drive images: {str(e)}"
        )


if __name__ == "__main__":
    logger.info("Starting VEXO Image Validation API server...")
    uvicorn.run(app, host=HOST, port=PORT)
