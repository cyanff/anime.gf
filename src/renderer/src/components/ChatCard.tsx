import { cn } from "@/lib/utils";
interface Props {
  id: string;
  name: string;
  avatar: string;
  msg: string;
  className?: string;
  [x: string]: any;
}

// Todo add hover effects
export default function ChatCard({ id, name, avatar, msg, className, ...rest }: Props) {
  return (
    <div
      {...rest}
      className={cn(
        "h-[70px] flex items-center space-x-2 w-full p-1 hover:bg-neutral-600 transition ease-out duration-400 rounded-md cursor-pointer",
        className
      )}
    >
      <img className="h-12 w-12 shrink-0 rounded-full object-cover object-top" src={avatar} alt="avatar" />
      <div className="h-full max-w-full flex flex-col justify-center">
        <h3 className="text-gray-100 font-normal line-clamp-1">{name}</h3>
        <p className="text-gray-400 text-[15px] text-sm line-clamp-1">{msg}</p>
      </div>
    </div>
  );
}
