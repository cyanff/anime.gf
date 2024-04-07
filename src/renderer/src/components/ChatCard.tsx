import { cn } from "@/lib/utils";
interface Props {
  id: string;
  name: string;
  avatarURI: string;
  msg: string;
  active: boolean;
  className?: string;
  [x: string]: any;
}

export default function ChatCard({ id, name, avatarURI, msg, active, className, ...rest }: Props) {
  return (
    <div
      {...rest}
      className={cn(
        `group flex h-[70px] w-full cursor-pointer items-center space-x-3 
        rounded-xl p-1 transition duration-150 ease-out hover:bg-accent 
        ${active ? "bg-neutral-700 text-gray-100" : "text-gray-400"}`,
        className
      )}
    >
      <img className="size-12 shrink-0 rounded-full object-cover object-top" src={avatarURI} alt="avatar" />
      <div className={`flex h-full max-w-full flex-col justify-center group-hover:text-gray-100 `}>
        <h3 className="line-clamp-1 font-[550]">{name}</h3>
        <p className="line-clamp-1 text-[15px] font-[430]">{msg}</p>
      </div>
    </div>
  );
}
