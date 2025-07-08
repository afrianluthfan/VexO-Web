"""
Models package for VEXO Image Validation API.

Contains Pydantic models and custom exceptions.
"""

from .models import (
    GoogleDriveRequest,
    GoogleDriveMultipleRequest,
    ValidationResult,
    MultipleValidationResult,
    HealthCheckResponse,
    APIInfoResponse,
)

from .exceptions import (
    ModelNotInitializedException,
    ImageProcessingException,
    InvalidImageFormatException,
    FileLimitExceededException,
    InvalidFileTypeException,
)

__all__ = [
    "GoogleDriveRequest",
    "GoogleDriveMultipleRequest",
    "ValidationResult",
    "MultipleValidationResult",
    "HealthCheckResponse",
    "APIInfoResponse",
    "ModelNotInitializedException",
    "ImageProcessingException",
    "InvalidImageFormatException",
    "FileLimitExceededException",
    "InvalidFileTypeException",
]
