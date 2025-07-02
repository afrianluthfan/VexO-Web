# 🖼️ VEXO Frontend - Image Validation UI

A modern Next.js frontend for the VEXO Image Validation API with Google Drive integration.

## ✨ Features

- 🚀 **File Upload**: Drag & drop or select images for validation
- 🔗 **Google Drive Integration**: Validate images directly from Google Drive URLs
- 📊 **Excel Processing**: Upload Excel files with image data for batch validation
- 📱 **Responsive Design**: Modern UI with Tailwind CSS and shadcn/ui components
- ⚡ **Real-time Processing**: Live progress indicators and results display
- 🎯 **Multiple Validation Modes**: Single, multiple, and batch processing

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- VEXO Backend API running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Configuration

The frontend automatically connects to the backend API at `http://localhost:8000`.

If your backend is running on a different port, update the `API_BASE_URL` in `app/page.tsx`:

```typescript
const API_BASE_URL = "http://localhost:YOUR_PORT";
```

## 📋 Usage

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
└── lib/
    └── utils.ts         # Utility functions
```

### Adding New Features

1. Create new components in `components/`
2. Add API calls to `app/page.tsx`
3. Update UI state management
4. Add error handling

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
