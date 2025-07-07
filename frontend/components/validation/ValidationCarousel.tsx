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
    <section>
      <div className="relative mb-8">
        <Carousel className="w-full max-w-6xl mx-auto">
          <CarouselContent className="min-h-[450px]">
            {/* Image Upload Slide */}
            <CarouselItem>
              <div className="px-2">
                <ImageUploadValidation
                  isDarkMode={isDarkMode}
                  onResultsChange={onImageResultsChange}
                  onClearFunctionReady={onImageClearFunctionReady}
                />
              </div>
            </CarouselItem>

            {/* Excel Upload Slide */}
            <CarouselItem>
              <div className="px-2">
                <ExcelValidation isDarkMode={isDarkMode} />
              </div>
            </CarouselItem>

            {/* Google Drive Slide */}
            <CarouselItem>
              <div className="px-2">
                <GoogleDriveValidation
                  isDarkMode={isDarkMode}
                  onResultsChange={onGoogleDriveResultsChange}
                  onClearFunctionReady={onGoogleDriveClearFunctionReady}
                />
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious
            className={`${
              isDarkMode ? "bg-gray-800/80 border-gray-600" : "bg-white/80"
            }`}
          />
          <CarouselNext
            className={`${
              isDarkMode ? "bg-gray-800/80 border-gray-600" : "bg-white/80"
            }`}
          />
        </Carousel>
      </div>
    </section>
  );
};
