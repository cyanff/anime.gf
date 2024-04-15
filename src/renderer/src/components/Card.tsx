import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { ArrowPathIcon, DocumentDuplicateIcon, TrashIcon } from "@heroicons/react/24/solid";

interface Props {
  avatar: string | null;
  name: string;
  deleteCard: () => void;
  openCardModal: () => void;
}

function Card({ deleteCard, avatar, name, openCardModal }: Props) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className="w-30 justify-top m-4 flex h-52 min-w-max flex-col items-center rounded-xl bg-neutral-700 p-4 transition ease-out hover:brightness-90"
          onClick={openCardModal}
        >
          <img className="h-32 w-32 rounded-xl object-cover" src={avatar || "default_avatar.png"} />
          <div className="pt-2 text-center font-semibold text-neutral-200">{name}</div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-40 px-1 py-2">
        <ContextMenuItem onSelect={deleteCard}>
          Delete Card
          <ContextMenuShortcut>
            <TrashIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default Card;
