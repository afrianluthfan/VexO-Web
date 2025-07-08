"""
Data models for the VEXO Image Validation API.
"""

from pydantic import BaseModel
from typing import List, Optional


class GoogleDriveRequest(BaseModel):
    """Request model for single Google Drive image validation."""

    drive_url: str


class GoogleDriveMultipleRequest(BaseModel):
    """Request model for multiple Google Drive images validation."""

    drive_urls: List[str]


class ValidationResult(BaseModel):
    """Result model for image validation."""

    filename: str
    validity_score: float
    percentage: float
    is_valid: bool
    message: str
    invalid_reason: Optional[str] = None


class MultipleValidationResult(BaseModel):
    """Result model for multiple image validation."""

    results: List[ValidationResult]


class HealthCheckResponse(BaseModel):
    """Response model for health check."""

    status: str
    models_loaded: bool


class APIInfoResponse(BaseModel):
    """Response model for API information."""

    message: str
    version: str
    endpoints: dict
