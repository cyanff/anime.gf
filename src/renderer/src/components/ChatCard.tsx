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
        "duration-400 flex h-[70px] w-full cursor-pointer items-center space-x-2 rounded-md p-1 transition ease-out hover:bg-neutral-600",
        className
      )}
    >
      <img className="h-12 w-12 shrink-0 rounded-full object-cover object-top" src={avatar} alt="avatar" />
      <div className="flex h-full max-w-full flex-col justify-center">
        <h3 className="line-clamp-1 font-normal text-gray-100">{name}</h3>
        <p className="line-clamp-1 text-[15px]  text-gray-400">{msg}</p>
      </div>
    </div>
  );
}
