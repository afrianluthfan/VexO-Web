"""
Image processing utilities for the VEXO Image Validation API.
"""

import cv2
import numpy as np
from PIL import Image
from keras.applications.xception import preprocess_input
from typing import Optional, Tuple

from config import XCEPTION_INPUT_SIZE
from models.exceptions import ImageProcessingException


def load_and_preprocess_image(
    image_array: Optional[np.ndarray] = None, pil_image: Optional[Image.Image] = None
) -> np.ndarray:
    """
    Load and preprocess image from various sources.

    Args:
        image_array: Numpy array representation of the image
        pil_image: PIL Image object

    Returns:
        Preprocessed image array ready for model inference

    Raises:
        ImageProcessingException: If neither image_array nor pil_image is provided
    """
    if image_array is not None:
        resized_image = cv2.resize(image_array, XCEPTION_INPUT_SIZE)
    elif pil_image is not None:
        img_array = np.array(pil_image)
        if len(img_array.shape) == 3 and img_array.shape[2] == 3:
            img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        resized_image = cv2.resize(img_array, XCEPTION_INPUT_SIZE)
    else:
        raise ImageProcessingException(
            "Either image_array or pil_image must be provided"
        )

    # Expand dimensions and preprocess for Xception
    preprocessed_image = np.expand_dims(resized_image, axis=0)
    preprocessed_image = preprocess_input(preprocessed_image)

    return preprocessed_image


def convert_pil_to_rgb(pil_image: Image.Image) -> Image.Image:
    """
    Convert PIL image to RGB format if necessary.

    Args:
        pil_image: PIL Image object

    Returns:
        PIL Image in RGB format
    """
    if pil_image.mode != "RGB":
        return pil_image.convert("RGB")
    return pil_image


def validate_image_format(content_type: str) -> bool:
    """
    Validate if the content type is a supported image format.

    Args:
        content_type: MIME type of the uploaded file

    Returns:
        True if the content type is a supported image format
    """
    return content_type.startswith("image/")


def validate_file_extension(filename: str, allowed_extensions: Tuple[str, ...]) -> bool:
    """
    Validate if the file extension is allowed.

    Args:
        filename: Name of the file
        allowed_extensions: Tuple of allowed file extensions

    Returns:
        True if the file extension is allowed
    """
    return filename.lower().endswith(allowed_extensions)
