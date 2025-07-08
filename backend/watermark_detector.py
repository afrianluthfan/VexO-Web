"""
Watermark detection utilities for the VEXO Image Validation API.
"""

import cv2
import numpy as np
import easyocr
import re
from PIL import Image
from typing import List, Optional

from config import SUSPICIOUS_WATERMARKS, OCR_CONFIDENCE_THRESHOLD, OCR_LANGUAGES
from exceptions import ModelNotInitializedException
from logger import get_logger

logger = get_logger(__name__)


class WatermarkDetector:
    """Handles watermark detection in images using OCR."""

    def __init__(self):
        self.ocr_reader: Optional[easyocr.Reader] = None
        self._ocr_initialized = False

    def initialize_ocr(self) -> None:
        """Initialize the OCR reader."""
        try:
            logger.info("Initializing OCR reader...")
            self.ocr_reader = easyocr.Reader(OCR_LANGUAGES)
            self._ocr_initialized = True
            logger.info("OCR reader initialized successfully!")
        except Exception as e:
            logger.error(f"Error initializing OCR reader: {e}")
            raise e

    def is_ocr_initialized(self) -> bool:
        """Check if OCR reader is properly initialized."""
        return self._ocr_initialized and self.ocr_reader is not None

    def detect_watermarks(self, pil_image: Image.Image) -> bool:
        """
        Detect watermarks in an image using OCR.

        Args:
            pil_image: PIL Image object to scan for watermarks

        Returns:
            True if suspicious watermarks are found, False otherwise

        Raises:
            ModelNotInitializedException: If OCR reader is not initialized
        """
        if not self.is_ocr_initialized():
            raise ModelNotInitializedException("OCR reader not initialized")

        try:
            image_array = np.array(pil_image)

            # Check different orientations of the image
            orientations = [
                ("original", image_array),
                ("horizontal_flip", cv2.flip(image_array, 1)),
                ("vertical_flip", cv2.flip(image_array, 0)),
                ("both_flip", cv2.flip(image_array, -1)),
            ]

            for orientation_name, oriented_image in orientations:
                if self._scan_image_for_watermarks(oriented_image):
                    logger.info(f"Watermark detected in {orientation_name} orientation")
                    return True

            return False

        except Exception as e:
            logger.error(f"Error during watermark detection: {str(e)}")
            # Return False to avoid false positives when OCR fails
            return False

    def _scan_image_for_watermarks(self, image_array: np.ndarray) -> bool:
        """
        Helper function to scan an image array for watermarks using OCR.

        Args:
            image_array: Numpy array representation of the image

        Returns:
            True if watermarks are detected, False otherwise
        """
        try:
            # Extract text using EasyOCR
            results = self.ocr_reader.readtext(image_array)

            # Collect text with sufficient confidence
            extracted_texts = []
            for bbox, text, confidence in results:
                if confidence > OCR_CONFIDENCE_THRESHOLD:
                    extracted_texts.append(text.lower().strip())

            # Combine all extracted text
            full_text = " ".join(extracted_texts).lower()

            # Check for suspicious watermark patterns
            return self._check_for_suspicious_patterns(full_text)

        except Exception as e:
            logger.error(f"Error in OCR scanning: {str(e)}")
            return False

    def _check_for_suspicious_patterns(self, text: str) -> bool:
        """
        Check for suspicious watermark patterns in the extracted text.

        Args:
            text: Extracted text from the image

        Returns:
            True if suspicious patterns are found
        """
        # Check for exact word matches
        for watermark in SUSPICIOUS_WATERMARKS:
            pattern = re.compile(
                r"\b" + re.escape(watermark.lower()) + r"\b", re.IGNORECASE
            )
            if pattern.search(text):
                logger.info(f"Watermark detected: '{watermark}' found in text: {text}")
                return True

        # Check for partial matches
        for watermark in SUSPICIOUS_WATERMARKS:
            if watermark.lower() in text:
                logger.info(
                    f"Partial watermark detected: '{watermark}' found in text: {text}"
                )
                return True

        return False


# Global watermark detector instance
watermark_detector = WatermarkDetector()
