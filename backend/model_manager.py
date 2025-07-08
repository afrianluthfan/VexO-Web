"""
Model management for the VEXO Image Validation API.
"""

import os
import numpy as np
from keras.models import load_model
from keras.applications.xception import Xception
from PIL import Image
from typing import Optional

from config import MODEL_PATH, VALIDITY_THRESHOLD
from exceptions import ModelNotInitializedException
from image_utils import load_and_preprocess_image
from logger import get_logger

logger = get_logger(__name__)


class ModelManager:
    """Manages the ML models used for image validation."""

    def __init__(self):
        self.xception_model: Optional[Xception] = None
        self.classification_model = None
        self._models_initialized = False

    def initialize_models(self) -> None:
        """Initialize the ML models."""
        try:
            logger.info("Loading Xception model...")
            self.xception_model = Xception(
                weights="imagenet", include_top=False, pooling="avg"
            )

            logger.info("Loading classification model...")
            if not os.path.exists(MODEL_PATH):
                raise FileNotFoundError(
                    f"Model file '{MODEL_PATH}' not found. "
                    "Please ensure the model file exists in the current directory."
                )

            self.classification_model = load_model(MODEL_PATH)
            logger.info(f"Successfully loaded {MODEL_PATH} model")

            self._models_initialized = True
            logger.info("Models loaded successfully!")

        except Exception as e:
            logger.error(f"Error loading models: {e}")
            raise e

    def are_models_loaded(self) -> bool:
        """Check if models are properly loaded."""
        return (
            self._models_initialized
            and self.xception_model is not None
            and self.classification_model is not None
        )

    def extract_features(
        self,
        image_array: Optional[np.ndarray] = None,
        pil_image: Optional[Image.Image] = None,
    ) -> np.ndarray:
        """
        Extract features using the Xception model.

        Args:
            image_array: Numpy array representation of the image
            pil_image: PIL Image object

        Returns:
            Extracted features as numpy array

        Raises:
            ModelNotInitializedException: If Xception model is not initialized
        """
        if self.xception_model is None:
            raise ModelNotInitializedException("Xception model not initialized")

        if pil_image is not None:
            preprocessed_image = load_and_preprocess_image(pil_image=pil_image)
        elif image_array is not None:
            preprocessed_image = load_and_preprocess_image(image_array=image_array)
        else:
            raise ValueError("One of pil_image or image_array must be provided")

        features = self.xception_model.predict(preprocessed_image)
        return features

    def predict_image_validity(self, features: np.ndarray) -> float:
        """
        Predict if an image is valid using the classification model.

        Args:
            features: Extracted features from the image

        Returns:
            Validity score as float

        Raises:
            ModelNotInitializedException: If classification model is not initialized
        """
        if self.classification_model is None:
            raise ModelNotInitializedException("Classification model not initialized")

        features_squeezed = np.squeeze(features)
        score = self.classification_model.predict(
            np.expand_dims(features_squeezed, axis=0)
        )[0][0]

        return float(score)

    def is_image_valid(self, score: float) -> bool:
        """
        Determine if an image is valid based on the validity score.

        Args:
            score: Validity score from the model

        Returns:
            True if the image is considered valid
        """
        return score >= VALIDITY_THRESHOLD


# Global model manager instance
model_manager = ModelManager()
