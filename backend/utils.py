"""
Utility functions for the VEXO Image Validation API.
"""

import base64
import io
from typing import Optional, Any, Dict
from PIL import Image
import pandas as pd
from fastapi.responses import StreamingResponse

from logger import get_logger

logger = get_logger(__name__)


def decode_base64_image(image_data: str) -> Optional[Image.Image]:
    """
    Decode base64 image data and return PIL Image.

    Args:
        image_data: Base64 encoded image string

    Returns:
        PIL Image object or None if decoding fails
    """
    try:
        if image_data.startswith("data:image"):
            # Extract base64 data from data URL
            base64_data = image_data.split(",")[1] if "," in image_data else image_data
            image_bytes = base64.b64decode(base64_data)
        else:
            # Treat as raw base64
            image_bytes = base64.b64decode(image_data)

        pil_image = Image.open(io.BytesIO(image_bytes))
        return pil_image.convert("RGB") if pil_image.mode != "RGB" else pil_image

    except Exception as e:
        logger.error(f"Error decoding base64 image: {e}")
        return None


def create_excel_response(
    df: pd.DataFrame, original_filename: str
) -> StreamingResponse:
    """
    Create Excel file response from DataFrame.

    Args:
        df: DataFrame to export
        original_filename: Original filename for the response

    Returns:
        StreamingResponse with Excel file
    """
    output_buffer = io.BytesIO()
    with pd.ExcelWriter(output_buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Processed Data")

    output_buffer.seek(0)

    return StreamingResponse(
        io.BytesIO(output_buffer.getvalue()),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename=processed_{original_filename}"
        },
    )


def format_validation_note(result: Dict[str, Any]) -> str:
    """
    Format validation result as a note string for Excel.

    Args:
        result: Validation result dictionary

    Returns:
        Formatted note string
    """
    if result["is_valid"]:
        return f"VALID - Score: {result['percentage']:.1f}%"
    else:
        return (
            f"INVALID - {result['invalid_reason']} - "
            f"Score: {result['percentage']:.1f}%"
        )


def safe_filename(filename: str) -> str:
    """
    Make filename safe for file system.

    Args:
        filename: Original filename

    Returns:
        Safe filename
    """
    # Remove or replace dangerous characters
    safe_chars = "-_.() abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return "".join(char for char in filename if char in safe_chars)
