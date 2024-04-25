import Dropdown from "@/components/Dropdown";
import { Button } from "@/components/ui/button";
import { ArrowUpOnSquareIcon, ChatBubbleLeftRightIcon, PencilIcon } from "@heroicons/react/24/solid";
import { CardBundle } from "@shared/types";
import { queries } from "../lib/queries";
import { toast } from "sonner";
import Tag from "@/components/Tag";
import { time } from "@/lib/time";
import EditCardModal from "@/components/EditCardModal";
import { useApp } from "@/components/AppContext";
interface CardModalProps {
  cardBundle: CardBundle;
  onCreateChat: (cardID: number, greeting: string) => void;
}

function CardModal({ cardBundle, onCreateChat }: CardModalProps) {
  const { createModal, closeModal, syncCardBundles } = useApp();

  const handleExport = async () => {
    const cardDirRes = await queries.getCardDir(cardBundle.id);

    if (cardDirRes.kind === "err") {
      toast.error("Error fetching card directory to start the export process.");
      console.error(cardDirRes.error);
      return;
    }

    const res = await window.api.blob.cards.exportToZip(cardDirRes.value);
    if (res.kind === "err") {
      toast.error("Error exporting card bundle to zip.");
      console.error(res.error);
      return;
    }
    toast.success("Card successfully exported to zip!");
  };

  const handleEdit = () => {
    closeModal();
    createModal(<EditCardModal cardBundle={cardBundle} />);
  };

  return (
    <div className="flex h-[80vh] w-[36rem] items-center justify-center overflow-hidden rounded-xl bg-background-secondary">
      <div className="scroll-secondary h-full w-full overflow-y-scroll rounded-xl">
        {/* Banner and profile picture */}
        <div className="relative rounded-xl">
          <img
            src={cardBundle.bannerURI || "default_banner.png"}
            alt="Banner"
            draggable="false"
            className="h-48 w-full select-none rounded-t-xl object-cover"
          />
          <img
            src={cardBundle.avatarURI || "default_avatar.png"}
            alt="Profile"
            draggable="false"
            className="absolute -bottom-12 left-4 h-24 w-24 select-none rounded-full border-4 border-card object-cover"
          />
        </div>
        {/* Character details container */}
        <div className="px-6 pb-6 pt-12">
          <div className="flex flex-row">
            <div className="w-[30rem] pr-10">
              <div className="pb-2 text-2xl font-semibold text-primary">{cardBundle.data.character.name}</div>
              <p className="pb-1 text-sm font-semibold text-tertiary">{`created: ${time.isoToFriendly(cardBundle.data.meta.created_at)}`}</p>
              {cardBundle.data.meta.updated_at && <p>{`Updated: ${cardBundle.data.meta.updated_at}`}</p>}{" "}
              <p className="text-sm font-semibold text-tertiary">by @{cardBundle.data.meta.creator.card}</p>
            </div>
            {/* Character tags */}
            <div className="mr-4 text-2xl font-semibold text-primary">Tags:</div>
            <div className="flex h-20 flex-wrap gap-1.5">
              {cardBundle.data.meta.tags.map((tag) => (
                <Tag key={tag} text={tag} />
              ))}
            </div>
          </div>

          {/* Buttons Bar */}
          <div className="item-center mb-10 mt-14 flex justify-between">
            {/* Left Button Group */}
            <div className="flex flex-row">
              <Button className="group h-12 w-14 rounded-xl border-none bg-transparent p-0" onClick={handleEdit}>
                <PencilIcon className="size-6 text-neutral-400 transition duration-200 ease-out group-hover:text-neutral-200" />
              </Button>

              <Button className="group h-12 w-14 rounded-xl border-none bg-transparent p-0" onClick={handleExport}>
                <ArrowUpOnSquareIcon className="size-6 text-neutral-400 transition duration-200 ease-out group-hover:text-neutral-200" />
              </Button>
            </div>

            <Button
              size="icon"
              className="h-12 w-16 rounded-xl bg-action-primary transition ease-out"
              onClick={() => onCreateChat(cardBundle.id, cardBundle.data.character.greeting)}
            >
              <ChatBubbleLeftRightIcon className="size-6 text-primary" />
            </Button>
          </div>
          {/* Character details dropdowns */}
          <div className="mt-6">
            <Dropdown label="Character Description" content={cardBundle.data.character.description} />
            <Dropdown label="Character Persona" content={cardBundle.data.meta.notes ?? ""} />
            <Dropdown label="Greeting Message" content={cardBundle.data.character.greeting} />
            <Dropdown label="Example Messages" content={cardBundle.data.character.msg_examples} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardModal;
