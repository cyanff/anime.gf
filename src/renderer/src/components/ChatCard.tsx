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
    <div {...rest} className={cn("h-16 flex items-center w-full", className)}>
      <img className="h-12 w-12 shrink-0 rounded-full object-cover object-top" src={avatar} alt="avatar" />
      <div className="h-full flex flex-col justify-center p-2">
        <h3 className="text-gray-100 font-normal ">{name}</h3>
        <p className="text-gray-400">{msg}</p>
      </div>
    </div>
  );
}
