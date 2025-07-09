#!/usr/bin/env python3
"""
VEXO Environment Validation Script
Checks if the backend environment is properly configured.
"""

import os
import sys
from pathlib import Path


def check_env_var(
    var_name: str, default_value: str = None, required: bool = False
) -> bool:
    """Check if an environment variable is set."""
    value = os.getenv(var_name)
    status = "✓" if value else ("✗" if required else "⚠")
    color = "\033[92m" if value else ("\033[91m" if required else "\033[93m")
    reset = "\033[0m"

    display_value = (
        value
        if value
        else f"(default: {default_value})" if default_value else "(not set)"
    )
    print(f"  {color}{status}{reset} {var_name}: {display_value}")

    return bool(value) or not required


def check_file_exists(file_path: str, description: str) -> bool:
    """Check if a required file exists."""
    exists = Path(file_path).exists()
    status = "✓" if exists else "✗"
    color = "\033[92m" if exists else "\033[91m"
    reset = "\033[0m"

    print(f"  {color}{status}{reset} {description}: {file_path}")
    return exists


def main():
    """Main validation function."""
    print("🔍 VEXO Backend Environment Validation")
    print("=====================================")

    # Load .env file if it exists
    env_file = Path(".env")
    if env_file.exists():
        print(f"📄 Loading environment from: {env_file.absolute()}")
        # Simple .env file parser
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ[key.strip()] = value.strip()
    else:
        print("⚠  No .env file found, using system environment variables only")

    print()

    # Check API configuration
    print("🌐 API Configuration:")
    all_good = True
    all_good &= check_env_var("API_HOST", "0.0.0.0")
    all_good &= check_env_var("API_PORT", "8000")
    all_good &= check_env_var("API_TITLE", "VEXO Image Validation API")

    print()

    # Check CORS configuration
    print("🔒 CORS Configuration:")
    all_good &= check_env_var("CORS_ORIGINS", "*")
    all_good &= check_env_var("CORS_CREDENTIALS", "true")

    print()

    # Check model configuration
    print("🤖 Model Configuration:")
    all_good &= check_env_var("MODEL_PATH", "vexo_v4_2.keras")
    all_good &= check_env_var("VALIDITY_THRESHOLD", "0.5")

    # Check if model file exists
    model_path = os.getenv("MODEL_PATH", "vexo_v4_2.keras")
    all_good &= check_file_exists(model_path, "Model file")

    print()

    # Check optional configurations
    print("🔧 Optional Configuration:")
    check_env_var("GOOGLE_CREDENTIALS_FILE", "credentials.json")
    check_env_var("LOG_LEVEL", "INFO")
    check_env_var("OCR_CONFIDENCE_THRESHOLD", "0.3")

    print()

    # Check Google Drive credentials if configured
    credentials_file = os.getenv("GOOGLE_CREDENTIALS_FILE", "credentials.json")
    if credentials_file != "credentials.json" or Path(credentials_file).exists():
        print("📁 Google Drive Integration:")
        check_file_exists(credentials_file, "Google credentials")
        print()

    # Summary
    if all_good:
        print("🎉 Environment validation passed! Your backend should be ready to run.")
        print("💡 To start the server: uv run python main.py")
    else:
        print("❌ Environment validation failed. Please check the issues above.")
        print(
            "💡 Make sure you have copied .env.example to .env and configured it properly."
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
