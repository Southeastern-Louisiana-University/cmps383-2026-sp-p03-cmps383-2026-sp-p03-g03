import React, { useEffect, useState } from "react";

const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

interface ImageWithFallbackProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src"
> {
  src: string;
  fallbackSrc?: string;
}

export function ImageWithFallback({
  fallbackSrc,
  ...props
}: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  const { src, alt, style, className } = props;
  
  const handleError = () => {
    setDidError(true);
  };

  const handleFallbackError = () => {
    setFallbackError(true);
  };

  
  useEffect(() => {
    setDidError(false);
    setFallbackError(false);
  }, [src, fallbackSrc]);
  
  if (didError) {
    if (fallbackSrc && !fallbackError) {
      return (
        <img
          src={fallbackSrc}
          alt={alt}
          className={className}
          style={style}
          onError={handleFallbackError}
        />
      );
    }

    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ""}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img
            src={ERROR_IMG_SRC}
            alt="Error loading image"
            data-original-url={src}
          />
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        console.error(`Error loading image: ${src}`, e);
        handleError();
      }}
    />
  );
}
