import { cn } from "@/lib/utils";

interface MessageProps {
  className?: string;
  avatarURL: string | null;
  username: string;
  timestamp: string;
  content: string;
  // Type for ...rest
  [x: string]: any;
}

function Message({ className, avatarURL, username, timestamp, content, ...rest }: MessageProps) {
  return (
    <div {...rest} className={cn("h-30 flex w-full", className)}>
      <img
        className="h-12 w-12 shrink-0 rounded-full object-cover object-top"
        src={avatarURL ?? "/default_avatar.png"}
        alt="Avatar"
      />
      <div className="ml-4">
        <div className="flex h-fit flex-row items-baseline space-x-2">
          <div className="text-lg font-bold">{username}</div>
          <div className="text-[0.60rem]">{timestamp}</div>
        </div>
        <div className="whitespace-pre-line">{content}</div>
      </div>
    </div>
  );
}

export default Message;
