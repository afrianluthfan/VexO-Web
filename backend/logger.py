"""
Logging configuration for the VEXO Image Validation API.
"""

import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path

# Create logs directory if it doesn't exist
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)


# Configure logging
def setup_logging(log_level: str = "INFO"):
    """
    Set up logging configuration.

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    # Create formatters
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    # Create file handler with rotation
    file_handler = RotatingFileHandler(
        log_dir / "vexo_api.log", maxBytes=10 * 1024 * 1024, backupCount=5  # 10MB
    )
    file_handler.setFormatter(formatter)

    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        handlers=[console_handler, file_handler],
    )

    # Configure specific loggers
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    logging.getLogger("tensorflow").setLevel(logging.WARNING)
    logging.getLogger("keras").setLevel(logging.WARNING)


# Get logger instance
def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the specified name.

    Args:
        name: Logger name

    Returns:
        Logger instance
    """
    return logging.getLogger(name)
