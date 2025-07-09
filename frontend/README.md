# 🎨 VEXO Frontend - Image Validation UI

<div align="center">

![VEXO Frontend](https://img.shields.io/badge/VEXO-Frontend-blue?style=for-the-badge&logo=react&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[![Bun](https://img.shields.io/badge/Bun-Runtime-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
[![ESLint](https://img.shields.io/badge/ESLint-Enabled-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Components-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

![Status](https://img.shields.io/badge/status-In%20Development-orange?style=for-the-badge)
![Version](https://img.shields.io/badge/version-0.1.0-blue?style=for-the-badge)

</div>

## 🎯 **Overview**

The **VEXO Frontend** is a modern, responsive web application built with Next.js 15 and React 19. It provides an intuitive interface for the VEXO Image Validation API, featuring drag-and-drop uploads, Google Drive integration, Excel processing, and real-time validation results.

### ✨ **Key Features**

- �️ **Image Upload Validation** - Drag & drop or select multiple images for AI validation
- ☁️ **Google Drive Integration** - Validate images directly from Google Drive URLs
- 📊 **Excel Processing** - Upload and process Excel files with embedded base64 images
- 🎠 **Validation Carousel** - Interactive carousel display of validation results
- 🌙 **Dark Mode Support** - Toggle between light and dark themes
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- ⚡ **Real-time Results** - Live progress indicators and instant validation feedback

## 🏗️ **Architecture**

```
frontend/
├── 🖥️ app/                    # Next.js App Router
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Main application page
│   ├── globals.css           # Global styles
│   └── favicon.ico           # App icon
│
├── 🧩 components/             # React components
│   ├── common/               # Shared components
│   │   ├── AppHeader.tsx     # Application header
│   │   ├── LoadingProgress.tsx # Progress indicators
│   │   └── ValidationResults.tsx # Result displays
│   ├── validation/           # Validation-specific components
│   │   ├── AllValidationResults.tsx # Combined results view
│   │   ├── ExcelValidation.tsx     # Excel upload interface
│   │   ├── GoogleDriveValidation.tsx # Google Drive interface
│   │   ├── ImageUploadValidation.tsx # Image upload interface
│   │   └── ValidationCarousel.tsx   # Results carousel
│   └── ui/                   # shadcn/ui components
│       ├── button.tsx        # Button component
│       ├── card.tsx          # Card component
│       ├── input.tsx         # Input component
│       └── progress.tsx      # Progress component
│
├── 🎣 lib/                    # Utilities and hooks
│   ├── hooks/                # Custom React hooks
│   │   ├── useApiHealth.ts   # API health monitoring
│   │   ├── useDarkMode.ts    # Dark mode management
│   │   ├── useExcelValidation.ts # Excel processing logic
│   │   ├── useGoogleDriveValidation.ts # Google Drive logic
│   │   └── useImageValidation.ts # Image validation logic
│   └── utils.ts              # Utility functions
│
├── 🎨 public/                 # Static assets
└── 📄 types/                  # TypeScript type definitions
    └── validation.ts         # Validation response types
```

## 🚀 **Quick Start**

### Prerequisites

- **Node.js 18.18+** with [Bun runtime](https://bun.sh/)
- **VEXO Backend API** running on `http://localhost:8000`

### 🎨 Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies with Bun
bun install

# Start development server
bun dev

# Frontend will be available at http://localhost:3000
```

## � **Validation Components**

The frontend provides four main validation interfaces:

| Component            | Description                   | Features                                         |
| -------------------- | ----------------------------- | ------------------------------------------------ |
| **Image Upload**     | Direct file upload validation | Drag & drop, multiple files, progress tracking   |
| **Google Drive**     | URL-based validation          | Single/multiple URLs, direct Google Drive access |
| **Excel Processing** | Batch validation from Excel   | Base64 image processing, downloadable results    |
| **All Results**      | Combined results view         | Unified interface, validation carousel           |

## �️ **Technology Stack**

### **Frontend Framework**

- **Next.js 15** - React framework with App Router and Turbopack
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe JavaScript development

### **UI & Styling**

- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful SVG icons
- **Embla Carousel** - Smooth carousel component

### **State Management & Hooks**

- **Custom React Hooks** - Specialized hooks for each validation type
- **Dark Mode Support** - Theme switching with persistence
- **API Health Monitoring** - Backend connectivity status

### **Development Tools**

- **Bun** - Fast JavaScript runtime and package manager
- **ESLint** - Code linting and quality enforcement
- **TypeScript** - Static type checking

## � **Performance**

- **⚡ Fast Runtime** - Bun runtime for improved performance
- **🚀 Turbopack** - Next.js blazing-fast bundler
- **📱 Responsive Design** - Optimized for all device sizes
- **🎯 Code Splitting** - Automatic component-level splitting
- **🔧 Development Ready** - Hot reload and fast refresh

## 🔧 **Configuration**

### **Environment Variables**

Create a `.env.local` file in the frontend directory:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### **API Integration**

The frontend automatically connects to the backend API endpoints:

- `GET /health` - API health monitoring
- `POST /validate` - Single image validation
- `POST /validate_multiple` - Multiple image validation
- `POST /validate_google_drive` - Google Drive single image
- `POST /validate_google_drive_multiple` - Google Drive multiple images
- `POST /process_excel` - Excel file processing

**Note**: ZIP file processing endpoint exists in backend but frontend interface is not implemented.

## 🧪 **Development**

### **Development Commands**

```bash
# Start development server
bun dev

# Build for production
bun build

# Start production server
bun start

# Run linting
bun lint

# Type checking (if configured)
bunx tsc --noEmit
```

### **Project Structure Details**

- **`app/`** - Next.js App Router with layout and main page
- **`components/common/`** - Reusable UI components across the app
- **`components/validation/`** - Specialized validation interface components
- **`components/ui/`** - Base UI components from shadcn/ui
- **`lib/hooks/`** - Custom React hooks for validation logic
- **`lib/utils.ts`** - Utility functions and helpers
- **`types/`** - TypeScript type definitions

### **Adding New Features**

1. **Create validation component** in `components/validation/`
2. **Add custom hook** in `lib/hooks/` for logic
3. **Update main page** in `app/page.tsx`
4. **Add type definitions** in `types/validation.ts`
5. **Test responsiveness** across devices

## 🔒 **Security Features**

- ✅ **Type Safety** - Full TypeScript implementation
- ✅ **Input Validation** - Client-side validation before API calls
- ✅ **Error Boundaries** - Graceful error handling
- ✅ **Secure API Calls** - Proper error handling and sanitization

## 🌟 **Use Cases**

- **📱 Mobile Validation** - Touch-friendly interface for mobile users
- **🖥️ Desktop Workflows** - Drag & drop for efficient batch processing
- **📊 Business Integration** - Excel file processing for enterprise use
- **☁️ Cloud Storage** - Direct Google Drive integration
- **🎨 Visual Feedback** - Carousel display for result comparison

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made by Afrian Luthfan**

[![Next.js](https://img.shields.io/badge/Powered%20by-Next.js-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![Bun](https://img.shields.io/badge/Runtime-Bun-000000?style=flat&logo=bun)](https://bun.sh/)
[![TypeScript](https://img.shields.io/badge/Built%20with-TypeScript-007ACC?style=flat&logo=typescript)](https://typescriptlang.org/)

</div>
