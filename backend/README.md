# � VEXO Backend - Image Validation API

<div align="center">

![VEXO Backend](https://img.shields.io/badge/VEXO-Backend%20API-blue?style=for-the-badge&logo=fastapi&logoColor=white)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.12+-005571?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.19.0+-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://tensorflow.org/)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.11.0+-27338e?style=for-the-badge&logo=opencv&logoColor=white)](https://opencv.org/)

[![UV](https://img.shields.io/badge/UV-Package%20Manager-purple?style=for-the-badge)](https://github.com/astral-sh/uv)
[![Pydantic](https://img.shields.io/badge/Pydantic-V2-e92063?style=for-the-badge&logo=pydantic&logoColor=white)](https://pydantic.dev/)
[![EasyOCR](https://img.shields.io/badge/EasyOCR-1.7.1+-4CAF50?style=for-the-badge)](https://github.com/JaidedAI/EasyOCR)

![Status](https://img.shields.io/badge/status-In%20Development-orange?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)

</div>

## 🎯 **Overview**

The **VEXO Backend** is a powerful FastAPI-based REST API that combines artificial intelligence and computer vision techniques to detect AI-generated images and watermarks. Built with modern Python architecture, it provides high-performance async processing with comprehensive validation capabilities.

### ✨ **Key Features**

- 🤖 **AI-Generated Image Detection** - Xception CNN + custom Keras classification model
- 🔍 **Watermark Detection** - EasyOCR-based text extraction with pattern matching
- 📊 **Batch Processing** - Unlimited simultaneous image validation
- 📈 **Excel Integration** - Process Excel files with embedded base64 images
- ☁️ **Google Drive Integration** - Direct validation from Google Drive URLs
- 🚀 **High Performance** - Async FastAPI with optimized image processing
- 🔧 **Modular Architecture** - Clean separation with services, models, and utilities

## �️ **Architecture**

```
backend/
├── 🚀 main.py                 # FastAPI application entry point
├── ⚙️ config.py              # Configuration settings and constants
├── 📊 models/                 # Pydantic models and exceptions
│   ├── __init__.py           # Package exports
│   ├── models.py             # Request/response models
│   └── exceptions.py         # Custom exception classes
│
├── 🔧 services/               # Business logic and core services
│   ├── __init__.py           # Service exports
│   ├── model_manager.py      # ML model loading and management
│   ├── validation_service.py # Image validation orchestration
│   ├── watermark_detector.py # OCR-based watermark detection
│   └── google_drive_auth.py  # Google Drive API integration
│
├── �️ utils/                  # Utility functions and helpers
│   ├── __init__.py           # Utility exports
│   ├── image_utils.py        # Image processing utilities
│   ├── logger.py             # Logging configuration
│   └── utils.py              # General helper functions
│
├── 📦 requirements.txt        # Python dependencies
├── � pyproject.toml          # UV project configuration
├── 🔑 credentials.json.example # Google Drive credentials template
├── 🤖 vexo_v4_2.keras         # Pre-trained ML model
└── 📄 logs/                   # Application logs directory
```

## 🚀 **Quick Start**

### Prerequisites

- **Python 3.12+** with [UV package manager](https://github.com/astral-sh/uv)
- **TensorFlow model file** (`vexo_v4_2.keras`)
- **Google Drive credentials** (optional, for Google Drive features)

### 🔧 Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies with UV
uv pip install -r requirements.txt

# Start the API server
uv run python main.py
# or
uv run uvicorn main:app --reload

# API will be available at http://localhost:8000
```

## 📊 **API Endpoints**

| Method | Endpoint                          | Description             | Frontend UI | Limits       |
| ------ | --------------------------------- | ----------------------- | ----------- | ------------ |
| `GET`  | `/`                               | API information         | -           | -            |
| `GET`  | `/health`                         | Health check            | -           | -            |
| `POST` | `/validate`                       | Single image validation | ✅          | -            |
| `POST` | `/validate_multiple`              | Multiple images         | ✅          | **No Limit** |
| `POST` | `/process_excel`                  | Excel file processing   | ✅          | -            |
| `POST` | `/upload_zip`                     | ZIP file processing     | ❌          | -            |
| `POST` | `/validate_google_drive`          | Google Drive single     | ✅          | -            |
| `POST` | `/validate_google_drive_multiple` | Google Drive multiple   | ✅          | **No Limit** |

**Note**: ZIP file processing endpoint exists but frontend interface is not implemented yet.

## � **Validation Process**

### **Two-Stage Validation Pipeline**

1. **🤖 AI Detection Stage**

   - Uses Xception CNN model pre-trained on ImageNet
   - Custom classification model (`vexo_v4_2.keras`) trained on AI-generated images
   - Confidence score threshold: 50% (configurable in `config.py`)
   - Supports multiple image orientations and color spaces

2. **🔍 Watermark Detection Stage**
   - EasyOCR text extraction in multiple orientations (original, horizontal flip, vertical flip, both)
   - Pattern matching against suspicious watermark database
   - OCR confidence threshold: 30% (configurable)
   - Detects AI generation tool watermarks (FaceApp, ManyCam, etc.)

### **Validation Response Format**

```json
{
  "filename": "image.jpg",
  "validity_score": 0.85,
  "percentage": 85.0,
  "is_valid": true,
  "message": "Image is valid",
  "invalid_reason": null // Only present if invalid ("AI Generated" or "Watermark Detected")
}
```

## 🛠️ **Technology Stack**

### **Core Framework**

- **FastAPI** - High-performance async web framework with automatic API documentation
- **Uvicorn** - Lightning-fast ASGI server implementation
- **Pydantic V2** - Data validation and serialization with type hints

### **Machine Learning & Computer Vision**

- **TensorFlow 2.19+** - Deep learning framework for AI model inference
- **Keras 3.10+** - High-level neural network API
- **OpenCV 4.11+** - Computer vision library for image transformations
- **NumPy 2.1+** - Numerical computing for array operations

### **Specialized Libraries**

- **EasyOCR 1.7+** - Optical character recognition for watermark detection
- **Pillow 11.2+** - Python Imaging Library for image processing
- **Pandas 2.0+** - Data manipulation for Excel file processing
- **Google API Client** - Google Drive integration and authentication

### **Development Tools**

- **UV** - Fast Python package manager and project manager
- **Python-multipart** - Multipart form data parsing
- **Typing-extensions** - Extended type hints support

## 📈 **Performance**

- **⚡ Async Processing** - Non-blocking image validation with FastAPI
- **🚀 Optimized Pipeline** - Efficient image preprocessing and model inference
- **📊 Unlimited Scaling** - No artificial limits on batch processing
- **💾 Memory Efficient** - Streaming file processing and cleanup
- **🔧 Development Ready** - Comprehensive error handling and logging

## 🔧 **Configuration**

### **Environment Variables**

```bash
# API Configuration
LOG_LEVEL=INFO
API_HOST=0.0.0.0
API_PORT=8000

# Model Configuration
MODEL_PATH=vexo_v4_2.keras
VALIDITY_THRESHOLD=0.5
XCEPTION_INPUT_SIZE=299,299

# OCR Configuration
OCR_CONFIDENCE_THRESHOLD=0.3
OCR_LANGUAGES=en
```

### **Model Configuration (`config.py`)**

```python
# Model settings
MODEL_PATH = "vexo_v4_2.keras"
VALIDITY_THRESHOLD = 0.5
XCEPTION_INPUT_SIZE = (299, 299)

# Upload limits (None = no limit)
MAX_FILES_PER_REQUEST = None
MAX_URLS_PER_REQUEST = None

# Watermark detection
SUSPICIOUS_WATERMARKS = [
    "manycam", "faceapp", "reface", "deepfake",
    "ai generated", "artificial intelligence", "synthetic"
]
```

## 🧪 **Development**

### **Development Commands**

```bash
# Start development server with auto-reload
uv run uvicorn main:app --reload

# Run with custom host/port
uv run uvicorn main:app --host 0.0.0.0 --port 8000

# Direct Python execution
uv run python main.py

# Install development dependencies
uv add --dev pytest pytest-asyncio black flake8 mypy
```

### **Module Structure**

- **`main.py`** - FastAPI app initialization, CORS, middleware, and route definitions
- **`config.py`** - Centralized configuration management
- **`models/`** - Pydantic models for request/response validation and custom exceptions
- **`services/`** - Business logic including ML model management and validation orchestration
- **`utils/`** - Helper functions for image processing, logging, and utilities

### **Adding New Features**

1. **Create service logic** in `services/`
2. **Add request/response models** in `models/models.py`
3. **Define new endpoint** in `main.py`
4. **Add configuration** in `config.py`
5. **Update documentation** and test thoroughly

## � **Security Features**

- ✅ **Input Validation** - Comprehensive file type and size validation via Pydantic
- ✅ **Error Handling** - Sanitized error messages and proper HTTP status codes
- ✅ **CORS Protection** - Configurable cross-origin requests (currently permissive for development)
- ✅ **File Processing Security** - Temporary file cleanup and safe image processing
- ✅ **Type Safety** - Full Pydantic validation for all API inputs/outputs

**Note**: Rate limiting and authentication are planned for future implementation.

## 📝 **API Documentation**

Interactive API documentation is automatically generated and available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## 🌟 **Use Cases**

- **🔍 Content Moderation** - Detect AI-generated content in user uploads
- **📱 Social Media Platforms** - Validate profile pictures and user-generated images
- **🏢 Enterprise Solutions** - Batch validation of employee photos and documents
- **🎨 Digital Art Authentication** - Identify synthetic artwork and deep fakes
- **📰 News Verification** - Verify authenticity of news images and media content

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by the VEXO Team**

[![FastAPI](https://img.shields.io/badge/Powered%20by-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Built%20with-Python-3776AB?style=flat&logo=python)](https://python.org/)
[![TensorFlow](https://img.shields.io/badge/AI%20with-TensorFlow-FF6F00?style=flat&logo=tensorflow)](https://tensorflow.org/)

</div>
