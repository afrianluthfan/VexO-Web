"""
Custom exceptions for the VEXO Image Validation API.
"""

from fastapi import HTTPException


class ModelNotInitializedException(Exception):
    """Raised when models are not properly initialized."""

    pass


class ImageProcessingException(Exception):
    """Raised when image processing fails."""

    pass


class InvalidImageFormatException(HTTPException):
    """Raised when uploaded file is not a valid image."""

    def __init__(self, detail: str = "File must be an image"):
        super().__init__(status_code=400, detail=detail)


class FileLimitExceededException(HTTPException):
    """Raised when file upload limits are exceeded."""

    def __init__(self, detail: str):
        super().__init__(status_code=400, detail=detail)


class InvalidFileTypeException(HTTPException):
    """Raised when uploaded file type is not supported."""

    def __init__(self, detail: str):
        super().__init__(status_code=400, detail=detail)
