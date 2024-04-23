import { DialogConfig, useApp } from "@/components/AppContext";
import EditCardModal from "@/components/EditCardModal";
import Tag from "@/components/Tag";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { queries } from "@/lib/queries";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { CardBundle } from "@shared/types";
import { motion, useMotionValue } from "framer-motion";
import { CardPattern } from "./ui/card-pattern";
interface CardProps {
  cardBundle: CardBundle;
  syncCardBundles: () => void;
  openCardModal: () => void;
}

function Card({ cardBundle, syncCardBundles, openCardModal }: CardProps) {
  const { createModal, createDialog } = useApp();
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }: any) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const onDelete = () => {
    const config: DialogConfig = {
      title: `Delete ${cardBundle.data.character.name}`,
      description: `Are you sure you want to delete ${cardBundle.data.character.name}?\nThis action will also delete corresponding chats with ${cardBundle.data.character.name} and cannot be undone.`,
      actionLabel: "Delete",
      onAction: async () => {
        await queries.deleteCard(cardBundle.id);
        syncCardBundles();
      }
    };
    createDialog(config);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.button
          className="focus:outline-none"
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
            className="group/card justify-top relative flex h-64 w-[34rem] min-w-max cursor-pointer flex-row items-center rounded-xl bg-card p-2"
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
              <div className="text-overflow-ellipsis absolute -top-28 z-10 w-full max-w-md overflow-hidden whitespace-nowrap pl-5 text-left text-lg font-semibold text-primary">
                {cardBundle.data.character.name}
              </div>
              <div className="absolute -top-20 z-10 overflow-hidden pl-5 text-left text-sm font-[530] text-secondary">
                {cardBundle.data.meta.tagline}
              </div>
              <div className="absolute -top-2 h-16 space-x-0.5 space-y-1 overflow-hidden pl-5 text-left">
                <div className="flex flex-wrap gap-1">
                  {cardBundle.data.meta.tags.map((tag, idx) => (
                    <Tag key={idx} text={tag} isClickable={false} />
                  ))}
                </div>
              </div>
              <div className="absolute top-20 z-10 pl-5 text-left text-sm font-medium text-secondary opacity-50">
                by @{cardBundle.data.meta.creator.card}
              </div>
            </div>
          </div>
        </motion.button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-40 px-1 py-2">
        <ContextMenuItem
          onSelect={() => {
            createModal(<EditCardModal cardBundle={cardBundle} syncCardBundles={syncCardBundles} />);
          }}
        >
          Edit
          <ContextMenuShortcut>
            <PencilIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={onDelete}>
          Delete
          <ContextMenuShortcut>
            <TrashIcon className="size-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default Card;
