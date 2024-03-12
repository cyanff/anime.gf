import { cn } from "@/lib/utils";

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

// function Message({ className, avatar: avatarURL, username, timestamp, msg, ...rest }: Props) {
//   return (
//     <div {...rest} className={cn("h-30 flex w-full", className)}>
//       <img
//         className="h-12 w-12 shrink-0 rounded-full object-cover object-top"
//         src={avatarURL ?? "/default_avatar.png"}
//         alt="Avatar"
//       />
//       <div className="ml-4">
//         <div className="flex h-fit flex-row items-baseline space-x-2">
//           <div className="text-lg font-bold">{username}</div>
//           <div className="text-[0.60rem]">{timestamp}</div>
//         </div>
//         <div className="whitespace-pre-line">{msg}</div>
//       </div>
//     </div>
//   );
// }

const base =
  "max-w-3/4 flex shrink-0 items-center space-x-4 self-start rounded-2xl pl-3 pr-8 py-2.5 font-[420] text-slate-100";
function Message({ className, avatar, name, timestamp, msg, byUser, ...rest }: Props) {
  const userStyles = "self-end bg-grad-magenta";
  const otherStyles = "self-start bg-neutral-700";
  const roleStyles = byUser ? userStyles : otherStyles;

  return (
    <div {...rest} className={cn(base, roleStyles, className)}>
      <img
        className="size-11 shrink-0 rounded-full object-cover object-top"
        src={avatar || "default_avatar.png"}
        alt="Avatar"
      />
      <div className="flex flex-col space-y-0.5">
        {/* Username and Timestamp */}
        <div className="flex h-fit flex-row items-baseline space-x-3">
          <div className=" text-base font-semibold text-white">{name}</div>
          {/* <div className="font- text-[.68rem] font-semibold opacity-40">{timestamp}</div> */}
        </div>
        <p className="">{msg}</p>
      </div>
    </div>
  );
}

export default Message;
