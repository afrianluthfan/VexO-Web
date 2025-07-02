# 🖼️ VEXO Frontend - Image Validation UI

> A modern Next.js frontend for the VEXO Image Validation API with Google Drive integration.

[![Frontend Status](https://img.shields.io/badge/Frontend-Live-brightgreen)]()
[![Next.js](https://img.shields.io/badge/Next.js-14+-black)]()
[![React](https://img.shields.io/badge/React-18+-61DAFB)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-Latest-3178C6)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Latest-38B2AC)]()

---

## 📋 Table of Contents

- [Features](#-features)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Google Drive Setup](#-google-drive-setup)
- [UI Components](#-ui-components)
- [Responsive Design](#-responsive-design)
- [Error Handling](#-error-handling)
- [Troubleshooting](#-troubleshooting)
- [API Endpoints](#-api-endpoints-used)
- [Development](#-development)
- [Learn More](#learn-more)
- [Deploy](#deploy-on-vercel)

---

## ✨ Features

- 🚀 **File Upload**: Drag & drop or select images for validation
- 🔗 **Google Drive Integration**: Validate images directly from Google Drive URLs
- 📊 **Excel Processing**: Upload Excel files with image data for batch validation
- 📱 **Responsive Design**: Modern UI with Tailwind CSS and shadcn/ui components
- ⚡ **Real-time Processing**: Live progress indicators and results display
- 🎯 **Multiple Validation Modes**: Single, multiple, and batch processing

---

## 🚀 Getting Started

Get the frontend running in under 2 minutes:

```bash
# Clone the repository (if not already done)
cd frontend

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Your frontend will be available at:

- **Frontend URL:** `http://localhost:3000`
- **Backend API:** `http://localhost:8000` (required)

---

## 📦 Installation

### Prerequisites

- **Node.js 18+**
- **PNPM package manager** (recommended) or npm
- **VEXO Backend API** running on `http://localhost:8000`

### Step-by-Step Installation

1. **Navigate to frontend directory:**

   ```bash
   cd d:/codes/vexo/frontend
   ```

2. **Install dependencies:**

   ```bash
   # Install all dependencies
   pnpm install

   # Or with npm
   npm install
   ```

3. **Start development server:**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open the application:**

   Navigate to `http://localhost:3000` in your browser

---

## 🔧 Configuration

The frontend automatically connects to the backend API at `http://localhost:8000`.

### Custom Backend URL

If your backend is running on a different port, update the `API_BASE_URL` in `app/page.tsx`:

```typescript
const API_BASE_URL = "http://localhost:YOUR_PORT";
```

### Environment Variables

You can also use environment variables by creating a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## � Usage

### 1. **File Upload Validation**

- Drag and drop images or click "Select Images"
- Supports multiple image formats (JPEG, PNG, etc.)
- Real-time validation results with confidence scores

### 2. **Google Drive Integration**

- **Single Image**: Paste a Google Drive sharing URL
- **Multiple Images**: Add multiple Google Drive URLs
- Requires backend Google Drive authentication setup

#### Supported Google Drive URL Formats:

- `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
- `https://drive.google.com/file/d/FILE_ID/edit`
- `https://drive.google.com/open?id=FILE_ID`

### 3. **Excel File Processing**

- Upload Excel files with SELFIE column containing base64 images
- Required columns: PROVIDER, NOMOR REKENING, NOMOR HP, NAMA, TANGGAL PEMBUKAAN, KTP, SELFIE
- Download processed file with validation results

## 🔗 Google Drive Setup

For Google Drive functionality to work, ensure your backend is configured with:

1. Google Cloud Project with Drive API enabled
2. OAuth2 credentials configured
3. Backend authentication successful

See the backend's `GOOGLE_DRIVE_SETUP.md` for detailed setup instructions.

## 🎨 UI Components

Built with modern React components:

- **shadcn/ui**: High-quality UI components
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Beautiful SVG icons
- **Progress Indicators**: Real-time loading states
- **Responsive Cards**: Clean result displays

## 📱 Responsive Design

The interface is fully responsive and works on:

- 💻 Desktop computers
- 📱 Mobile devices
- 📋 Tablets

## 🔍 Error Handling

Comprehensive error handling for:

- ❌ Invalid file formats
- 🌐 API connection issues
- 🔑 Authentication failures
- 📊 Processing errors

## 🚨 Troubleshooting

### Common Issues:

**API Connection Failed**

- Ensure backend is running on `http://localhost:8000`
- Check CORS settings in backend
- Verify health endpoint: `http://localhost:8000/health`

**Google Drive Not Working**

- Check backend Google Drive authentication
- Ensure proper URL format
- Verify file permissions in Google Drive

**File Upload Issues**

- Check supported file formats
- Ensure files are valid images
- Check file size limits

## 📚 API Endpoints Used

The frontend connects to these backend endpoints:

- `GET /health` - API health check
- `POST /validate` - Single image validation
- `POST /validate_multiple` - Multiple image validation
- `POST /validate_google_drive` - Google Drive single image
- `POST /validate_google_drive_multiple` - Google Drive multiple images
- `POST /process_excel` - Excel file processing

## 🛠️ Development

### Project Structure

```
frontend/
├── app/
│   ├── page.tsx          # Main application component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   └── ui/              # Reusable UI components
│       ├── button.tsx   # Button component
│       ├── card.tsx     # Card component
│       ├── input.tsx    # Input component
│       └── progress.tsx # Progress indicator
└── lib/
    └── utils.ts         # Utility functions
```

### Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Type checking
pnpm type-check
```

### Adding New Features

1. **Create new components** in `components/ui/`
2. **Add API calls** to `app/page.tsx`
3. **Update UI state management** with React hooks
4. **Add error handling** for new features
5. **Test responsiveness** across devices

---

## 🤝 Contributing

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/your-username/vexo.git
cd vexo/frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run linting and type checking
pnpm lint && pnpm type-check
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

- 📖 **Documentation:** Check the component documentation
- 🐛 **Bug Reports:** [Open an issue](https://github.com/your-repo/issues)
- 💬 **Questions:** [Start a discussion](https://github.com/your-repo/discussions)
- 📧 **Email:** support@yourcompany.com

### Common Issues

<details>
<summary><strong>API Connection Failed</strong></summary>

```
Error: Failed to fetch from API
```

**Solution:**

- Ensure backend is running on `http://localhost:8000`
- Check CORS settings in backend
- Verify health endpoint: `http://localhost:8000/health`

</details>

<details>
<summary><strong>Google Drive URLs Not Working</strong></summary>

```
Error: Invalid Google Drive URL format
```

**Solution:**

- Use proper Google Drive sharing URLs
- Ensure backend Google Drive authentication is set up
- Check file permissions in Google Drive

</details>

<details>
<summary><strong>File Upload Issues</strong></summary>

```
Error: Unsupported file format
```

**Solution:**

- Check supported file formats (JPEG, PNG, etc.)
- Ensure files are valid images
- Check file size limits

</details>

---

## 🌟 Next.js Information

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Built With

- **Next.js 14+** - React framework for production
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Lucide Icons** - Beautiful SVG icons

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Next.js GitHub repository](https://github.com/vercel/next.js) - feedback and contributions welcome

---

## 🚀 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Deployment Steps

1. **Connect your repository** to Vercel
2. **Set environment variables** if needed
3. **Configure build settings** (automatic for Next.js)
4. **Deploy** with one click

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** for the excellent React framework
- **Vercel** for the deployment platform
- **shadcn** for the beautiful UI components
- **Tailwind CSS** for the utility-first styling
- **Contributors** who helped improve this project

---

<div align="center">
  <h3>⭐ Star this repo if you find it helpful!</h3>
  <p>Built with ❤️ for the developer community</p>
</div>
