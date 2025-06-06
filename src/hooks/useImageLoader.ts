// src/hooks/useImageLoader.ts
import { useState, useEffect } from 'react';

const useImageLoader = (src: string, placeholder: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    
    const loadImage = () => {
      setIsLoading(true);
      img.src = src;
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
      };
      
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
        setIsLoading(false);
      };
    };

    // تحميل الصورة فقط إذا كانت ضمن viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadImage();
          observer.disconnect();
        }
      },
      { threshold: 0.01 }
    );

    const dummyElement = document.createElement('div');
    observer.observe(dummyElement);

    return () => {
      img.onload = null;
      img.onerror = null;
      observer.disconnect();
    };
  }, [src]);

  return { src: imageSrc, isLoading };
};

export default useImageLoader;