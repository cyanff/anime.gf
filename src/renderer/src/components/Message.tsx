import { cn } from "@/lib/utils";
import { Squircle } from "@squircle-js/react";

interface Props {
  className?: string;
  avatar: string | null;
  name: string;
  timestamp: string;
  msg: string;
  byUser: boolean;
  // Type for ...rest
  [x: string]: any;
}

const base = "max-w-3/4 h-fit flex shrink-0 items-center space-x-4 self-start pl-3 pr-8 py-2.5 font-[430]";
function Message({ className, avatar, name, timestamp, msg, byUser, ...rest }: Props) {
  const userStyles = "self-end bg-grad-magenta text-neutral-50";
  const otherStyles = "self-start bg-neutral-700 text-neutral-100";
  const roleStyles = byUser ? userStyles : otherStyles;

  return (
    <Squircle cornerRadius={25} cornerSmoothing={1} {...rest} className={cn(base, roleStyles, className)}>
      <img
        className="size-11 shrink-0 rounded-full object-cover object-top"
        src={avatar || "default_avatar.png"}
        alt="Avatar"
      />
      <div className="flex flex-col justify-start space-y-0.5">
        {/* Username and Timestamp */}
        <div className="flex h-fit flex-row items-baseline space-x-3">
          <div className=" text-base font-semibold text-white">{name}</div>
          {/* <div className="font- text-[.68rem] font-semibold opacity-40">{timestamp}</div> */}
        </div>
        <p className="text-left">{msg}</p>
      </div>
    </Squircle>
  );
}

export default Message;
