#!/usr/bin/env node
/**
 * VEXO Frontend Environment Validation Script
 * Checks if the frontend environment is properly configured.
 */

import fs from "fs";
import path from "path";

// Colors for console output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function checkEnvVar(varName, defaultValue = null, required = false) {
  const value = process.env[varName];
  const status = value ? "✓" : required ? "✗" : "⚠";
  const color = value ? colors.green : required ? colors.red : colors.yellow;

  const displayValue =
    value || (defaultValue ? `(default: ${defaultValue})` : "(not set)");
  console.log(`  ${color}${status}${colors.reset} ${varName}: ${displayValue}`);

  return Boolean(value) || !required;
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  const status = exists ? "✓" : "✗";
  const color = exists ? colors.green : colors.red;

  console.log(`  ${color}${status}${colors.reset} ${description}: ${filePath}`);
  return exists;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=").trim();
      process.env[key.trim()] = value;
    }
  }

  return true;
}

function main() {
  console.log("🔍 VEXO Frontend Environment Validation");
  console.log("=======================================");

  // Try to load .env.local first, then .env
  const envFiles = [".env.local", ".env"];
  let envLoaded = false;

  for (const envFile of envFiles) {
    if (loadEnvFile(envFile)) {
      console.log(`📄 Loading environment from: ${path.resolve(envFile)}`);
      envLoaded = true;
      break;
    }
  }

  if (!envLoaded) {
    console.log(
      "⚠  No .env.local or .env file found, using system environment variables only"
    );
  }

  console.log();

  // Check API configuration
  console.log("🌐 API Configuration:");
  let allGood = true;
  allGood &= checkEnvVar("NEXT_PUBLIC_API_URL", "http://localhost:8000", true);
  allGood &= checkEnvVar("NEXT_PUBLIC_API_TIMEOUT", "30000");
  allGood &= checkEnvVar("NEXT_PUBLIC_API_RETRY_ATTEMPTS", "3");

  console.log();

  // Check app configuration
  console.log("🎨 App Configuration:");
  checkEnvVar("NEXT_PUBLIC_APP_TITLE", "VEXO Image Validation");
  checkEnvVar(
    "NEXT_PUBLIC_APP_DESCRIPTION",
    "AI-powered image validation and analysis tool"
  );
  checkEnvVar("NEXT_PUBLIC_DEFAULT_THEME", "system");

  console.log();

  // Check feature flags
  console.log("🚀 Feature Flags:");
  checkEnvVar("NEXT_PUBLIC_ENABLE_GOOGLE_DRIVE", "true");
  checkEnvVar("NEXT_PUBLIC_ENABLE_EXCEL_PROCESSING", "true");
  checkEnvVar("NEXT_PUBLIC_ENABLE_BATCH_VALIDATION", "true");
  checkEnvVar("NEXT_PUBLIC_ENABLE_DARK_MODE", "true");

  console.log();

  // Check development settings
  console.log("🛠  Development Settings:");
  checkEnvVar("NEXT_PUBLIC_DEBUG_MODE", "false");
  checkEnvVar("NEXT_PUBLIC_SHOW_DEV_TOOLS", "false");

  console.log();

  // Check essential files
  console.log("📁 Essential Files:");
  allGood &= checkFileExists("package.json", "Package configuration");
  allGood &= checkFileExists("next.config.ts", "Next.js configuration");

  // Check for Tailwind configuration (could be in different places)
  const tailwindConfigs = [
    "tailwind.config.ts",
    "tailwind.config.js",
    "postcss.config.mjs",
  ];
  let tailwindFound = false;
  for (const config of tailwindConfigs) {
    if (fs.existsSync(config)) {
      checkFileExists(config, "Tailwind/PostCSS configuration");
      tailwindFound = true;
      break;
    }
  }
  if (!tailwindFound) {
    console.log(
      `  ${colors.yellow}⚠${colors.reset} Tailwind configuration: Not found (using default config)`
    );
  }

  console.log();

  // Summary
  if (allGood) {
    console.log(
      "🎉 Environment validation passed! Your frontend should be ready to run."
    );
    console.log("💡 To start the development server: bun dev");
  } else {
    console.log(
      "❌ Environment validation failed. Please check the issues above."
    );
    console.log(
      "💡 Make sure you have copied .env.example to .env.local and configured it properly."
    );
    process.exit(1);
  }
}

// Run the main function
main();
