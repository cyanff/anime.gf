import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { ArrowPathIcon, DocumentDuplicateIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useMotionValue } from "framer-motion";
import { CardPattern } from "./ui/card-pattern";
import { motion } from "framer-motion";
import { CardBundle } from "@shared/types";
interface Props {
  cardBundle: CardBundle;
  deleteCard: () => void;
  editCard: () => void;
  openCardModal: () => void;
}

function Card({ deleteCard, editCard, cardBundle, openCardModal }: Props) {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }: any) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.button
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          whileTap={{
            scale: 0.98,
            transition: { duration: 0.05, ease: "easeInOut" }
          }}
        >
          <div
            className="group/card justify-top relative m-2 flex h-64 w-[34rem] min-w-max cursor-pointer flex-row items-center rounded-xl bg-neutral-700 p-2"
            onClick={openCardModal}
            onMouseMove={onMouseMove}
          >
            <CardPattern mouseX={mouseX} mouseY={mouseY} />
            <img
              className=" z-10 h-60 w-40 rounded-xl object-cover"
              src={cardBundle.avatarURI || "default_avatar.png"}
              draggable="false"
            />

            <div className="relative flex flex-grow flex-col space-y-1">
            <div className="text-overflow-ellipsis absolute -top-28 z-10 overflow-hidden whitespace-nowrap w-full max-w-md pl-5 text-left text-lg font-semibold text-neutral-200">
                {cardBundle.data.character.name} 
              </div>
              <div
                className="absolute -top-20 z-10 overflow-hidden pl-5 text-left text-sm font-semibold text-neutral-200"
                style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}
              >
                {cardBundle.data.meta.notes}
              </div>
              <div className="absolute -top-2 h-16 space-x-0.5 space-y-1 overflow-hidden pl-5 text-left  text-sm font-semibold">
                {cardBundle.data.meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block whitespace-nowrap rounded-full bg-neutral-600 px-2 py-1.5 text-xs font-[550] text-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="absolute top-20 z-10 pl-5 text-left text-sm text-neutral-200">
                created by @{cardBundle.data.meta.creator.card}
              </div>
            </div>
          </div>
        </motion.button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-40 px-1 py-2">
        <ContextMenuItem onSelect={deleteCard}>
          Delete Card
          <ContextMenuShortcut>
            <TrashIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={editCard}>
          Edit Card
          <ContextMenuShortcut>
            <TrashIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default Card;
