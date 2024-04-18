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
interface Props {
  avatar: string | null;
  name: string;
  deleteCard: () => void;
  openCardModal: () => void;
}

function Card({ deleteCard, avatar, name, openCardModal }: Props) {
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
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.1 }}>
        <div
          className="group/card w-30 justify-top relative m-2 flex h-52 min-w-max cursor-pointer flex-col items-center rounded-xl bg-neutral-700 p-4 transition ease-out hover:brightness-90"
          onClick={openCardModal}
          onMouseMove={onMouseMove}
        >
          <CardPattern mouseX={mouseX} mouseY={mouseY} />
          <img className=" z-10 h-32 w-32 rounded-xl object-cover" src={avatar || "default_avatar.png"} />
          <div className=" z-10 pt-2 text-center font-semibold text-neutral-200">{name}</div>
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
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default Card;

