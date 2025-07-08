# VEXO Backend - Organized Structure

## 📁 **Directory Structure**

```
backend/
├── 📄 main.py                    # FastAPI application entry point
├── ⚙️ config.py                  # Configuration settings
├── 📋 requirements.txt           # Python dependencies
├── 🔑 credentials.json.example   # Google Drive API credentials template
├── 🤖 vexo_v4_2.keras           # TensorFlow model file
│
├── 📦 models/                    # Data models and exceptions
│   ├── __init__.py              # Package exports
│   ├── models.py                # Pydantic request/response models
│   └── exceptions.py            # Custom exception classes
│
├── 🔧 services/                  # Business logic and services
│   ├── __init__.py              # Package exports
│   ├── model_manager.py         # ML model management
│   ├── watermark_detector.py    # OCR-based watermark detection
│   ├── validation_service.py    # Core validation logic
│   └── google_drive_auth.py     # Google Drive integration
│
├── 🛠️ utils/                     # Utility functions
│   ├── __init__.py              # Package exports
│   ├── image_utils.py           # Image processing utilities
│   ├── logger.py                # Logging configuration
│   └── utils.py                 # General helper functions
│
└── 📁 logs/                     # Application logs (auto-created)
```

## 🎯 **Architecture Overview**

### **Separation of Concerns**

- **`models/`** - Data validation and exception handling
- **`services/`** - Core business logic and external integrations
- **`utils/`** - Reusable helper functions and utilities
- **`main.py`** - API routes and application setup
- **`config.py`** - Centralized configuration

### **Import Structure**

All packages are properly organized with `__init__.py` files that expose the public APIs:

```python
# Import from organized packages
from models import GoogleDriveRequest, InvalidImageFormatException
from services import model_manager, validation_service
from utils import setup_logging, validate_image_format
```

## 🚀 **Quick Start**

```bash
# Install dependencies
uv pip install -r requirements.txt

# Run the API
python main.py
# or
uv run uvicorn main:app --reload
```

## 📋 **Benefits of Organization**

- ✅ **Clear separation of concerns**
- ✅ **Easy to navigate and maintain**
- ✅ **Proper Python package structure**
- ✅ **Scalable for future features**
- ✅ **Better code reusability**
- ✅ **Simplified testing**

## 🧪 **Testing Structure**

```bash
# Test imports
python -c "import main; print('✅ All imports successful!')"

# Run the application
python main.py
```

## 📝 **File Descriptions**

| File/Directory                   | Purpose                                 |
| -------------------------------- | --------------------------------------- |
| `main.py`                        | FastAPI app with all route definitions  |
| `config.py`                      | Application configuration and constants |
| `models/models.py`               | Pydantic models for request/response    |
| `models/exceptions.py`           | Custom exception classes                |
| `services/model_manager.py`      | TensorFlow/Keras model management       |
| `services/watermark_detector.py` | OCR watermark detection                 |
| `services/validation_service.py` | Main validation business logic          |
| `services/google_drive_auth.py`  | Google Drive API integration            |
| `utils/image_utils.py`           | Image processing functions              |
| `utils/logger.py`                | Logging setup and configuration         |
| `utils/utils.py`                 | General utility functions               |

This organization follows Python best practices and makes the codebase more maintainable and scalable.
