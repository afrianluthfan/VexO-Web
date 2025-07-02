# 🖼️ VEXO Image Validation API

> A powerful REST API for validating images using deep learning models built with FastAPI and TensorFlow/Keras.

[![API Status](https://img.shields.io/badge/API-Live-brightgreen)]()
[![Python](https://img.shields.io/badge/Python-3.8+-blue)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688)]()
[![TensorFlow](https://img.shields.io/badge/TensorFlow-Latest-orange)]()

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [API Reference](#-api-reference)
- [Usage Examples](#-usage-examples)
- [Testing](#-testing)
- [Model Information](#-model-information)
- [Contributing](#-contributing)
- [Support](#-support)
- [License](#-license)

---

## 🔍 Overview

VEXO Image Validation API is a production-ready REST service that leverages machine learning to validate image authenticity and quality. Built with modern Python technologies, it provides fast, reliable image analysis through simple HTTP endpoints.

**Perfect for:**

- Content moderation systems
- Image quality assurance pipelines
- Automated validation workflows
- Developer integrations requiring image verification

---

## ✨ Features

- 🚀 **High Performance** - Async processing with FastAPI
- 🎯 **Accurate Validation** - Pre-trained Xception + custom classification model
- 📁 **Batch Processing** - Validate up to 10 images simultaneously
- 🔧 **Developer Friendly** - Interactive API documentation with Swagger UI
- 🌐 **CORS Enabled** - Ready for web applications
- 📊 **Health Monitoring** - Built-in health check endpoints
- 🛡️ **Type Safety** - Full TypeScript-style type hints
- 📱 **File Validation** - Automatic image format verification

---

## 🚀 Quick Start

Get the API running in under 2 minutes:

```bash
# Clone the repository
git clone <repository-url>
cd be-vexo

# Install dependencies with UV (recommended)
uv init --no-readme
uv add fastapi uvicorn python-multipart pillow opencv-python tensorflow keras numpy

# Start the API server
uv run python main.py
```

Your API will be available at:

- **API Base URL:** `http://localhost:8000`
- **Interactive Docs:** `http://localhost:8000/docs`
- **Health Check:** `http://localhost:8000/health`

---

## 📦 Installation

### Prerequisites

- **Python 3.8+** (3.12+ recommended)
- **UV package manager** (recommended) or pip
- **Model file:** `vexo_v4.keras` (required)

### Step-by-Step Installation

1. **Set up the project environment:**

   ```bash
   cd d:/codes/be-vexo
   uv init --no-readme
   ```

2. **Install all dependencies:**

   ```bash
   uv add fastapi uvicorn python-multipart pillow opencv-python tensorflow keras numpy
   ```

3. **Verify model file exists:**

   ```bash
   # Ensure vexo_v4.keras is in the project root
   ls vexo_v4.keras
   ```

4. **Start the server:**
   ```bash
   uv run python main.py
   ```

---

## 📚 API Reference

### Base URL

```
http://localhost:8000
```

### Endpoints

| Method | Endpoint             | Description               | Parameters       |
| ------ | -------------------- | ------------------------- | ---------------- |
| `GET`  | `/`                  | API information           | None             |
| `GET`  | `/health`            | Health status check       | None             |
| `POST` | `/validate`          | Single image validation   | `file: image`    |
| `POST` | `/validate_multiple` | Batch validation (max 10) | `files: image[]` |

### Response Format

#### Single Image Response

```json
{
  "filename": "image.jpg",
  "validity_score": 0.85,
  "percentage": 85.0,
  "is_valid": true,
  "message": "Image is valid"
}
```

#### Batch Response

```json
{
  "results": [
    {
      "filename": "image1.jpg",
      "validity_score": 0.75,
      "percentage": 75.0,
      "is_valid": true,
      "message": "Image is valid"
    }
  ]
}
```

#### Health Check Response

```json
{
  "status": "healthy",
  "models_loaded": true
}
```

---

## 💡 Usage Examples

### Using cURL

**Single Image Validation:**

```bash
curl -X POST \
  -F "file=@/path/to/your/image.jpg" \
  http://localhost:8000/validate
```

**Multiple Images:**

```bash
curl -X POST \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  http://localhost:8000/validate_multiple
```

### Using Python Requests

```python
import requests

# Single image
with open('image.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/validate',
        files={'file': f}
    )
    result = response.json()
    print(f"Valid: {result['is_valid']}, Score: {result['percentage']:.1f}%")
```

### Using JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);

const response = await fetch("http://localhost:8000/validate", {
  method: "POST",
  body: formData,
});

const result = await response.json();
console.log(`Image is ${result.is_valid ? "valid" : "invalid"}`);
```

---

## 🧪 Testing

### Interactive Testing

1. **Web Interface:** Open `frontend_example.html` in your browser for drag-and-drop testing
2. **Swagger UI:** Visit `http://localhost:8000/docs` for interactive API documentation
3. **Health Check:** `curl http://localhost:8000/health`

### Automated Testing

```python
# Example test script
import requests
import json

def test_api():
    # Test health endpoint
    health = requests.get('http://localhost:8000/health')
    assert health.json()['status'] == 'healthy'

    # Test with sample image
    with open('test_image.jpg', 'rb') as f:
        response = requests.post(
            'http://localhost:8000/validate',
            files={'file': f}
        )

    result = response.json()
    assert 'validity_score' in result
    assert 'is_valid' in result

test_api()
```

---

## 🤖 Model Information

### Architecture

- **Feature Extractor:** Xception (ImageNet pre-trained)
- **Classifier:** Custom trained model (`vexo_v4.keras`)
- **Input Size:** 299×299 pixels
- **Color Space:** RGB (auto-converted from various formats)

### Processing Pipeline

1. **Image Upload** → FastAPI receives multipart form data
2. **Format Conversion** → PIL processes various image formats
3. **Preprocessing** → Resize to 299×299, normalize for Xception
4. **Feature Extraction** → Xception model generates feature vectors
5. **Classification** → Custom model predicts validity score
6. **Validation** → Score ≥ 0.5 = Valid image

### Supported Formats

- JPEG/JPG
- PNG
- GIF
- BMP
- TIFF
- WebP

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/your-username/be-vexo.git
cd be-vexo

# Set up development environment
uv add --dev pytest black flake8 mypy

# Run tests
uv run pytest

# Format code
uv run black .
```

### Contribution Guidelines

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📞 Support

### Getting Help

- 📖 **Documentation:** Check the [API docs](http://localhost:8000/docs)
- 🐛 **Bug Reports:** [Open an issue](https://github.com/your-repo/issues)
- 💬 **Questions:** [Start a discussion](https://github.com/your-repo/discussions)
- 📧 **Email:** support@yourcompany.com

### Common Issues

<details>
<summary><strong>Model file not found error</strong></summary>

```bash
Error: Model file 'vexo_v4.keras' not found
```

**Solution:** Ensure `vexo_v4.keras` is in the project root directory.

</details>

<details>
<summary><strong>Port already in use</strong></summary>

```bash
Error: [Errno 98] Address already in use
```

**Solution:** Stop other processes using port 8000 or change the port in `main.py`.

</details>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **TensorFlow Team** for the excellent ML framework
- **FastAPI** for the modern, fast web framework
- **Keras Applications** for pre-trained models
- **Contributors** who helped improve this project

---

<div align="center">
  <h3>⭐ Star this repo if you find it helpful!</h3>
  <p>Built with ❤️ for the developer community</p>
</div>
