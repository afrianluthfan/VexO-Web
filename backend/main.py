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
    """Initialize models when the API starts"""
    initialize_models()


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "VEXO Image Validation API",
        "version": "1.0.0",
        "endpoints": {
            "POST /validate": "Upload a single image for validation",
            "POST /validate_multiple": "Upload multiple images for validation",
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


if __name__ == "__main__":
    print("Starting VEXO Image Validation API server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
