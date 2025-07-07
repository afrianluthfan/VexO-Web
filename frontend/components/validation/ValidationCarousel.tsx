import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ImageUploadValidation } from "./ImageUploadValidation";
import { ExcelValidation } from "./ExcelValidation";
import { GoogleDriveValidation } from "./GoogleDriveValidation";
import { ValidationResult, GoogleDriveResult } from "@/types/validation";

interface ValidationCarouselProps {
  isDarkMode: boolean;
  onImageResultsChange?: (
    results: ValidationResult[],
    loading: boolean
  ) => void;
  onGoogleDriveResultsChange?: (
    results: GoogleDriveResult[],
    loading: boolean
  ) => void;
  onImageClearFunctionReady?: (clearFn: () => void) => void;
  onGoogleDriveClearFunctionReady?: (clearFn: () => void) => void;
}

export const ValidationCarousel: React.FC<ValidationCarouselProps> = ({
  isDarkMode,
  onImageResultsChange,
  onGoogleDriveResultsChange,
  onImageClearFunctionReady,
  onGoogleDriveClearFunctionReady,
}) => {
  return (
    <section className="mb-8">
      <div className="relative">
        <Carousel className="w-full max-w-6xl mx-auto">
          <CarouselContent className="min-h-[400px] sm:min-h-[450px] lg:min-h-[500px]">
            {/* Image Upload Slide */}
            <CarouselItem>
              <div className="px-1 sm:px-2 lg:px-4">
                <ImageUploadValidation
                  isDarkMode={isDarkMode}
                  onResultsChange={onImageResultsChange}
                  onClearFunctionReady={onImageClearFunctionReady}
                />
              </div>
            </CarouselItem>

            {/* Excel Upload Slide */}
            <CarouselItem>
              <div className="px-1 sm:px-2 lg:px-4">
                <ExcelValidation isDarkMode={isDarkMode} />
              </div>
            </CarouselItem>

            {/* Google Drive Slide */}
            <CarouselItem>
              <div className="px-1 sm:px-2 lg:px-4">
                <GoogleDriveValidation
                  isDarkMode={isDarkMode}
                  onResultsChange={onGoogleDriveResultsChange}
                  onClearFunctionReady={onGoogleDriveClearFunctionReady}
                />
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious
            className={`hidden sm:flex ${
              isDarkMode ? "bg-gray-800/80 border-gray-600" : "bg-white/80"
            }`}
          />
          <CarouselNext
            className={`hidden sm:flex ${
              isDarkMode ? "bg-gray-800/80 border-gray-600" : "bg-white/80"
            }`}
          />
        </Carousel>

        {/* Mobile Navigation Dots */}
        <div className="flex justify-center mt-4 sm:hidden">
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
