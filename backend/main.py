import os
import cv2
import numpy as np
from keras.models import load_model
from keras.applications.xception import Xception
from keras.applications.xception import preprocess_input
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from PIL import Image
import io
from typing import List
import pandas as pd
import base64
from fastapi.responses import StreamingResponse
import tempfile
import zipfile
from pydantic import BaseModel

# Import Google Drive authentication module
from google_drive_auth import initialize_google_drive_auth, process_google_drive_image

# Initialize the FastAPI app
app = FastAPI(title="VEXO Image Validation API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variables
xception_model = None
classification_model = None
model_path = "vexo_v4_2.keras"


# Pydantic models
class GoogleDriveRequest(BaseModel):
    drive_url: str


class GoogleDriveMultipleRequest(BaseModel):
    drive_urls: List[str]


def initialize_models():
    """Initialize the models once at startup"""
    global xception_model, classification_model

    try:
        print("Loading Xception model...")
        xception_model = Xception(weights="imagenet", include_top=False, pooling="avg")

        print("Loading classification model...")
        if os.path.exists(model_path):
            classification_model = load_model(model_path)
            print("Successfully loaded vexo_v4_2.keras model")
        else:
            raise FileNotFoundError(
                "Model file 'vexo_v4_2.keras' not found. Please ensure the model file exists in the current directory."
            )

        print("Models loaded successfully!")

    except Exception as e:
        print(f"Error loading models: {e}")
        raise e


def load_and_preprocess_image(image_array=None, pil_image=None):
    """
    Load and preprocess image from various sources
    """
    if image_array is not None:
        x = cv2.resize(image_array, (299, 299))
    elif pil_image is not None:
        # Convert PIL image to numpy array (RGB to BGR for OpenCV)
        img_array = np.array(pil_image)
        if len(img_array.shape) == 3 and img_array.shape[2] == 3:
            img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        x = cv2.resize(img_array, (299, 299))
    else:
        raise ValueError("Either image_array or pil_image must be provided.")

    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)
    return x


def extract_features(image_array=None, pil_image=None):
    """
    Extract features using the Xception model
    """
    if xception_model is None:
        raise RuntimeError("Xception model not initialized")

    if pil_image is not None:
        img = load_and_preprocess_image(pil_image=pil_image)
    elif image_array is not None:
        img = load_and_preprocess_image(image_array=image_array)
    else:
        raise ValueError("One of pil_image or image_array must be provided")

    features = xception_model.predict(img)
    return features


def predict_image_validity(features):
    """
    Predict if an image is valid using the classification model
    """
    if classification_model is None:
        raise RuntimeError("Classification model not initialized")

    features = np.squeeze(features)
    score = classification_model.predict(np.expand_dims(features, axis=0))[0][0]
    return float(score)


async def process_uploaded_image(file: UploadFile):
    """
    Process an uploaded image file and return validation results
    """
    try:
        # Read the uploaded file
        contents = await file.read()

        # Convert to PIL Image
        pil_image = Image.open(io.BytesIO(contents))

        # Convert to RGB if necessary
        if pil_image.mode != "RGB":
            pil_image = pil_image.convert("RGB")

        # Extract features
        features = extract_features(pil_image=pil_image)

        # Get prediction score
        score = predict_image_validity(features)

        # Determine validity
        is_valid = score >= 0.5

        return {
            "filename": file.filename,
            "validity_score": score,
            "percentage": score * 100,
            "is_valid": is_valid,
            "message": "Image is valid" if is_valid else "Image is not valid",
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")


# API Endpoints
@app.on_event("startup")
async def startup_event():
    """Initialize models and Google Drive authentication when the API starts"""
    initialize_models()

    # Initialize Google Drive authentication (optional - will work without it)
    try:
        print("Initializing Google Drive authentication...")
        if initialize_google_drive_auth():
            print("Google Drive authentication successful!")
        else:
            print(
                "Google Drive authentication failed - Google Drive features will be unavailable"
            )
    except Exception as e:
        print(f"Google Drive authentication error: {e}")
        print("Google Drive features will be unavailable")


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "VEXO Image Validation API",
        "version": "1.0.0",
        "endpoints": {
            "POST /validate": "Upload a single image for validation",
            "POST /validate_multiple": "Upload multiple images for validation",
            "POST /validate_google_drive": "Validate image from Google Drive URL",
            "POST /validate_google_drive_multiple": "Validate multiple images from Google Drive URLs",
            "POST /process_excel": "Process Excel file with image validation",
            "POST /upload_zip": "Upload and process zip file with images",
            "GET /health": "Health check endpoint",
        },
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    models_loaded = xception_model is not None and classification_model is not None
    return {
        "status": "healthy" if models_loaded else "unhealthy",
        "models_loaded": models_loaded,
    }


@app.post("/validate")
async def validate_single_image(file: UploadFile = File(...)):
    """
    Validate a single uploaded image
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    result = await process_uploaded_image(file)
    return JSONResponse(content=result)


@app.post("/validate_multiple")
async def validate_multiple_images(files: List[UploadFile] = File(...)):
    """
    Validate multiple uploaded images
    """
    if len(files) > 100:  # Limit to 10 files per request
        raise HTTPException(
            status_code=400, detail="Maximum 10 files allowed per request"
        )

    results = []

    for file in files:
        if not file.content_type.startswith("image/"):
            results.append(
                {"filename": file.filename, "error": "File must be an image"}
            )
            continue

        try:
            result = await process_uploaded_image(file)
            results.append(result)
        except HTTPException as e:
            results.append({"filename": file.filename, "error": e.detail})

    return JSONResponse(content={"results": results})


@app.post("/process_excel")
async def process_excel_file(file: UploadFile = File(...)):
    """
    Process Excel file with SELFIE column images
    """
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=400, detail="File must be an Excel file (.xlsx or .xls)"
        )

    try:
        # Read Excel file
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))

        # Validate required columns
        required_columns = [
            "PROVIDER",
            "NOMOR REKENING",
            "NOMOR HP",
            "NAMA",
            "TANGGAL PEMBUKAAN",
            "KTP",
            "SELFIE",
        ]
        missing_columns = [col for col in required_columns if col not in df.columns]

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

                # Assume SELFIE column contains base64 encoded images or file paths
                # For base64 images
                if isinstance(selfie_data, str) and selfie_data.startswith(
                    "data:image"
                ):
                    # Extract base64 data
                    base64_data = (
                        selfie_data.split(",")[1] if "," in selfie_data else selfie_data
                    )
                    image_bytes = base64.b64decode(base64_data)
                elif isinstance(selfie_data, str):
                    # Treat as base64 without prefix
                    try:
                        image_bytes = base64.b64decode(selfie_data)
                    except:
                        df.at[index, "NOTES"] = "Invalid image format"
                        continue
                else:
                    df.at[index, "NOTES"] = "Invalid image format"
                    continue

                # Convert to PIL Image
                pil_image = Image.open(io.BytesIO(image_bytes))

                # Convert to RGB if necessary
                if pil_image.mode != "RGB":
                    pil_image = pil_image.convert("RGB")

                # Extract features and predict
                features = extract_features(pil_image=pil_image)
                score = predict_image_validity(features)
                is_valid = score >= 0.5

                # Set notes based on validation result
                percentage = score * 100
                if is_valid:
                    df.at[index, "NOTES"] = f"VALID - Score: {percentage:.1f}%"
                else:
                    df.at[index, "NOTES"] = f"INVALID - Score: {percentage:.1f}%"

            except Exception as e:
                df.at[index, "NOTES"] = f"Error processing image: {str(e)}"

        # Convert dataframe to Excel bytes
        output_buffer = io.BytesIO()
        with pd.ExcelWriter(output_buffer, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Processed Data")

        output_buffer.seek(0)

        # Return Excel file
        return StreamingResponse(
            io.BytesIO(output_buffer.getvalue()),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=processed_{file.filename}"
            },
        )

    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error processing Excel file: {str(e)}"
        )


@app.post("/upload_zip")
async def upload_zip_file(file: UploadFile = File(...)):
    """
    Upload and process a zip file containing images
    """
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="File must be a zip archive")

    try:
        # Create a temporary directory
        with tempfile.TemporaryDirectory() as tmpdirname:
            # Save the uploaded zip file
            zip_path = os.path.join(tmpdirname, "uploaded.zip")
            with open(zip_path, "wb") as zip_file:
                zip_file.write(await file.read())

            # Extract the zip file
            with zipfile.ZipFile(zip_path, "r") as zip_ref:
                zip_ref.extractall(tmpdirname)

                # Process each extracted file
                results = []
                for extracted_file in os.listdir(tmpdirname):
                    if extracted_file.endswith(
                        (".png", ".jpg", ".jpeg", ".bmp", ".gif")
                    ):
                        file_path = os.path.join(tmpdirname, extracted_file)

                        # Read and validate the image
                        with open(file_path, "rb") as img_file:
                            contents = img_file.read()
                            pil_image = Image.open(io.BytesIO(contents))

                            # Extract features
                            features = extract_features(pil_image=pil_image)

                            # Get prediction score
                            score = predict_image_validity(features)

                            # Determine validity
                            is_valid = score >= 0.5

                            results.append(
                                {
                                    "filename": extracted_file,
                                    "validity_score": score,
                                    "percentage": score * 100,
                                    "is_valid": is_valid,
                                    "message": (
                                        "Image is valid"
                                        if is_valid
                                        else "Image is not valid"
                                    ),
                                }
                            )

                return JSONResponse(content={"results": results})

    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error processing zip file: {str(e)}"
        )


@app.post("/validate_google_drive")
async def validate_google_drive_image(request: GoogleDriveRequest):
    """
    Validate an image from Google Drive URL
    """
    try:
        result = process_google_drive_image(
            request.drive_url, extract_features, predict_image_validity
        )
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error processing Google Drive image: {str(e)}"
        )


@app.post("/validate_google_drive_multiple")
async def validate_google_drive_multiple_images(request: GoogleDriveMultipleRequest):
    """
    Validate multiple images from Google Drive URLs
    """
    if len(request.drive_urls) > 10:  # Limit to 10 URLs per request
        raise HTTPException(
            status_code=400, detail="Maximum 10 URLs allowed per request"
        )

    results = []

    for drive_url in request.drive_urls:
        try:
            result = process_google_drive_image(
                drive_url, extract_features, predict_image_validity
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
    print("Starting VEXO Image Validation API server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
