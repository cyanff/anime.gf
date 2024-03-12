import { cn } from "@/lib/utils";
import { Squircle } from "@squircle-js/react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { EllipsisHorizontalIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/solid";

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

function Message({ className, avatar, name, timestamp, msg, byUser, ...rest }: Props) {
  const roleAlign = byUser ? "self-end" : "self-start";
  const roleColor = byUser ? "bg-grad-magenta text-neutral-50" : "bg-neutral-700 text-neutral-100";

  const base =
    "h-fit flex items-center space-x-4 pl-3 pr-8 py-2.5 font-[430] hover:brightness-90 transition duration-200 ease-in";
  return (
    <ContextMenu>
      <ContextMenuTrigger className={cn("group/msg max-w-3/4 shrink-0", roleAlign)}>
        <Squircle cornerRadius={25} cornerSmoothing={1} {...rest} className={cn(base, roleColor, className)}>
          <img
            className="size-11 shrink-0 rounded-full object-cover object-top"
            src={avatar || "default_avatar.png"}
            alt="Avatar"
          />
          <div className="flex flex-col justify-start space-y-0.5">
            {/* Username and Timestamp */}
            <div className="flex h-fit flex-row items-center justify-between space-x-3">
              <div className=" text-base font-semibold text-white">{name}</div>
              <EllipsisHorizontalIcon className="size-6 cursor-pointer  opacity-0 transition duration-75 ease-out group-hover/msg:opacity-100" />
            </div>
            <p className="text-left">{msg}</p>
          </div>
        </Squircle>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44">
        <ContextMenuItem inset className="cursor-pointer transition duration-150 ease-out hover:bg-neutral-300">
          Copy
          <ContextMenuShortcut></ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem inset disabled>
          Delete
          <ContextMenuShortcut>
            <WrenchScrewdriverIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset disabled>
          Regenerate
          <ContextMenuShortcut>
            <WrenchScrewdriverIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset disabled>
          Rewind
          <ContextMenuShortcut>
            <WrenchScrewdriverIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset disabled>
          Speak
          <ContextMenuShortcut>
            <WrenchScrewdriverIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default Message;

/*

*/
