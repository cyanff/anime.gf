import { cn } from "@/lib/utils";

interface AvatarProps {
  avatarURI: string;
  className?: string;
  [rest: string]: any;
}

export default function Avatar({ avatarURI, className, rest }: AvatarProps) {
  return (
    <img
      className={cn("size-12 select-none rounded-full object-cover object-top", className)}
      draggable="false"
      src={avatarURI || "default_avatar.png"}
      alt="Avatar"
      {...rest}
    />
  );
}
