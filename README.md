# 🖼️ VEXO Image Validation System

<div align="center">

![VEXO Logo](https://img.shields.io/badge/VEXO-Image%20Validation-blue?style=for-the-badge&logo=shield&logoColor=white)

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://tensorflow.org/)
[![OpenCV](https://img.shields.io/badge/OpenCV-27338e?style=for-the-badge&logo=opencv&logoColor=white)](https://opencv.org/)

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![UV](https://img.shields.io/badge/UV-Package%20Manager-purple?style=for-the-badge)](https://github.com/astral-sh/uv)

![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/status-In%20Development-orange?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)

</div>

## 🎯 **Overview**

**VEXO** is a cutting-edge image validation system that combines artificial intelligence and advanced computer vision techniques to detect AI-generated images and watermarks. Built with modern web technologies, it provides both a powerful API backend and an intuitive web interface.

### ✨ **Key Features**

- 🤖 **AI-Generated Image Detection** - Advanced neural network models to identify synthetic images
- 🔍 **Watermark Detection** - OCR-based scanning for suspicious watermarks and text
- 📊 **Batch Processing** - Validate multiple images simultaneously with no limits
- 📈 **Excel Integration** - Process Excel files with embedded base64 images
- ☁️ **Google Drive Integration** - Direct validation from Google Drive URLs
- 🎨 **Modern UI** - Clean, responsive React/Next.js frontend
- � **Development Ready** - Robust error handling and logging

## 🏗️ **Architecture**

```
VEXO/
├── 🖥️ frontend/          # Next.js React application
│   ├── components/       # Reusable UI components
│   ├── lib/             # Utilities and custom hooks
│   └── app/             # App router and pages
│
├── 🔧 backend/           # FastAPI Python backend
│   ├── main.py          # API application entry point
│   ├── config.py        # Configuration settings
│   ├── models/          # Pydantic models and exceptions
│   ├── services/        # Business logic and services
│   └── utils/           # Helper functions and utilities
│
└── 📄 README.md         # This file
```

## 🚀 **Quick Start**

### Prerequisites

- **Python 3.12+** with [UV package manager](https://github.com/astral-sh/uv)
- **Node.js 18.18+** with Bun
- **TensorFlow model file** (`vexo_v4_2.keras`)

### ⚙️ **Environment Configuration**

Both backend and frontend use environment variables for configuration:

**Backend Configuration:**

```bash
cd backend
cp .env.example .env
# Edit .env with your settings (API port, CORS origins, model thresholds, etc.)
```

**Frontend Configuration:**

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your API URL and feature toggles
```

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

### 🎨 Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
bun install

# Start development server
bun dev

# Frontend will be available at http://localhost:3000
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

**Note**: ZIP file processing endpoint exists in the backend but frontend interface is not implemented yet.

## 🔬 **Validation Process**

### **Two-Stage Validation Pipeline**

1. **🤖 AI Detection Stage**

   - Uses Xception CNN model pre-trained on ImageNet
   - Custom classification model trained on AI-generated images
   - Confidence score threshold: 50%

2. **🔍 Watermark Detection Stage**
   - EasyOCR text extraction in multiple orientations
   - Pattern matching against suspicious watermark database
   - Supports flipped and rotated images

### **Validation Response**

```json
{
  "filename": "image.jpg",
  "validity_score": 0.85,
  "percentage": 85.0,
  "is_valid": true,
  "message": "Image is valid",
  "invalid_reason": null // Only present if invalid
}
```

## 🛠️ **Technology Stack**

### **Backend**

- **FastAPI** - High-performance async web framework
- **TensorFlow/Keras** - Deep learning models
- **OpenCV** - Computer vision processing
- **EasyOCR** - Optical character recognition
- **Pandas** - Data manipulation for Excel files
- **Pydantic** - Data validation and serialization

### **Frontend**

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **React 19** - Latest React features

### **DevOps & Tools**

- **UV** - Fast Python package manager
- **Bun** - Fast JavaScript runtime and package manager
- **ESLint** - Code linting

## 📈 **Performance**

- **🚀 Fast Processing** - Optimized image preprocessing pipeline
- **📊 Scalable** - Async processing with no file limits
- **💾 Memory Efficient** - Streaming file processing
- **🔧 Development Ready** - Comprehensive error handling

## 🔧 **Configuration**

### **Environment Variables**

```bash
# Backend
LOG_LEVEL=INFO
API_HOST=0.0.0.0
API_PORT=8000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### **Model Configuration**

```python
# backend/config.py
MODEL_PATH = "vexo_v4_2.keras"
VALIDITY_THRESHOLD = 0.5
MAX_FILES_PER_REQUEST = None  # No limit
```

## 🧪 **Testing**

**Note**: Test suite is currently under development.

```bash
# Backend tests (planned)
cd backend
python -m pytest

# Frontend tests (planned)
cd frontend
bun test
```

## 📝 **API Documentation**

Interactive API documentation is available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔒 **Security Features**

- ✅ **Input Validation** - Comprehensive file type and size validation
- ✅ **Error Handling** - Sanitized error messages
- ✅ **CORS Protection** - Configurable cross-origin requests (currently permissive for development)
- ✅ **Secure File Processing** - Temporary file cleanup

**Note**: Rate limiting is planned for future implementation.
