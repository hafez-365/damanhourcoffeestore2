import { type FC } from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: "portrait" | "square" | "video";
  priority?: boolean;
  loading?: "eager" | "lazy";
}

export const ProductImage: FC<ProductImageProps> = ({
  src,
  alt,
  className,
  aspectRatio = "square",
  priority = false,
  loading = "lazy",
}) => {
  const aspectRatioValue = {
    portrait: "3/4",
    square: "1/1",
    video: "16/9",
  }[aspectRatio];

  return (
    <div className="overflow-hidden rounded-lg border bg-white dark:bg-gray-950">
      <AspectRatio ratio={parseInt(aspectRatioValue.split('/')[0]) / parseInt(aspectRatioValue.split('/')[1])}>
        <div className={cn("h-full w-full", className)}>
          <img
            src={src}
            alt={alt}
            loading={loading}
            className="h-full w-full object-cover transition-all hover:scale-105"
            style={{
              aspectRatio: aspectRatioValue,
            }}
          />
        </div>
      </AspectRatio>
    </div>
  );
}; 