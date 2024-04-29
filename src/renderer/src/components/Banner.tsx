import { cn } from "@/lib/utils";

interface BannerProps {
  bannerURI?: string;
  className?: string;
  [rest: string]: any;
}

export default function Banner({ bannerURI, className, rest }: BannerProps) {
  return (
    <img
      src={bannerURI || "default_banner.png"}
      alt="Banner"
      className={cn("h-36 w-full object-cover select-none", className)}
      draggable="false"
      {...rest}
    />
  );
}
