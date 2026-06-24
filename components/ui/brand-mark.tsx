import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  priority?: boolean;
};

export function BrandMark({ className, priority = false }: BrandMarkProps) {
  return (
    <Image
      src="/brand/deen-companion-mark.png"
      alt="Deen Companion"
      width={820}
      height={820}
      priority={priority}
      className={cn("shrink-0 rounded-lg object-cover", className)}
    />
  );
}
