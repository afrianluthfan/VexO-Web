"""
Image validation service for the VEXO Image Validation API.
"""

import io
from PIL import Image
from fastapi import UploadFile
from typing import Dict, Any

from models import ValidationResult
from model_manager import model_manager
from watermark_detector import watermark_detector
from image_utils import convert_pil_to_rgb
from exceptions import ImageProcessingException


class ImageValidationService:
    """Service class for handling image validation operations."""

    def __init__(self):
        self.model_manager = model_manager
        self.watermark_detector = watermark_detector

    async def validate_uploaded_image(self, file: UploadFile) -> Dict[str, Any]:
        """
        Validate an uploaded image file with two-stage validation.

        Stage 1: AI Generated detection using Keras model
        Stage 2: Watermark detection using OCR (only for images that pass stage 1)

        Args:
            file: Uploaded file object

        Returns:
            Dictionary containing validation results

        Raises:
            ImageProcessingException: If image processing fails
        """
        try:
            # Read and prepare the image
            contents = await file.read()
            pil_image = Image.open(io.BytesIO(contents))
            pil_image = convert_pil_to_rgb(pil_image)

            # Stage 1: AI Generated detection
            features = self.model_manager.extract_features(pil_image=pil_image)
            score = self.model_manager.predict_image_validity(features)

            # Check if image passes first validation
            if not self.model_manager.is_image_valid(score):
                return self._create_validation_result(
                    filename=file.filename,
                    score=score,
                    is_valid=False,
                    invalid_reason="AI Generated",
                )

            # Stage 2: Watermark detection
            has_watermarks = self.watermark_detector.detect_watermarks(pil_image)

            if has_watermarks:
                return self._create_validation_result(
                    filename=file.filename,
                    score=score,
                    is_valid=False,
                    invalid_reason="Watermarked",
                )

            # Image passed both validations
            return self._create_validation_result(
                filename=file.filename, score=score, is_valid=True
            )

        except Exception as e:
            raise ImageProcessingException(f"Error processing image: {str(e)}")

    def validate_pil_image(
        self, pil_image: Image.Image, filename: str = "image"
    ) -> Dict[str, Any]:
        """
        Validate a PIL image with two-stage validation.

        Args:
            pil_image: PIL Image object
            filename: Name of the image file

        Returns:
            Dictionary containing validation results
        """
        try:
            pil_image = convert_pil_to_rgb(pil_image)

            # Stage 1: AI Generated detection
            features = self.model_manager.extract_features(pil_image=pil_image)
            score = self.model_manager.predict_image_validity(features)

            # Check if image passes first validation
            if not self.model_manager.is_image_valid(score):
                return self._create_validation_result(
                    filename=filename,
                    score=score,
                    is_valid=False,
                    invalid_reason="AI Generated",
                )

            # Stage 2: Watermark detection
            has_watermarks = self.watermark_detector.detect_watermarks(pil_image)

            if has_watermarks:
                return self._create_validation_result(
                    filename=filename,
                    score=score,
                    is_valid=False,
                    invalid_reason="Watermarked",
                )

            # Image passed both validations
            return self._create_validation_result(
                filename=filename, score=score, is_valid=True
            )

        except Exception as e:
            raise ImageProcessingException(f"Error processing image: {str(e)}")

    def _create_validation_result(
        self, filename: str, score: float, is_valid: bool, invalid_reason: str = None
    ) -> Dict[str, Any]:
        """
        Create a standardized validation result dictionary.

        Args:
            filename: Name of the image file
            score: Validity score from the model
            is_valid: Whether the image is valid
            invalid_reason: Reason for invalidity (if applicable)

        Returns:
            Dictionary containing validation results
        """
        result = {
            "filename": filename,
            "validity_score": score,
            "percentage": score * 100,
            "is_valid": is_valid,
            "message": "Image is valid" if is_valid else "Image is not valid",
        }

        if invalid_reason:
            result["invalid_reason"] = invalid_reason

        return result


# Global validation service instance
validation_service = ImageValidationService()
