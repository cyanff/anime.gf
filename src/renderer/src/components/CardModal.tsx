import { useApp } from "@/components/AppContext";
import Dropdown from "@/components/Dropdown";
import EditCardModal from "@/components/EditCardModal";
import Tag from "@/components/Tag";
import { Button } from "@/components/ui/button";
import { card } from "@/lib/card";
import { time } from "@/lib/time";
import { ArrowUpOnSquareIcon, ChatBubbleLeftRightIcon, PencilIcon } from "@heroicons/react/24/solid";
import { CardBundle } from "@shared/types";
import { toast } from "sonner";
interface CardModalProps {
  cardBundle: CardBundle;
  onCreateChat: () => void;
}

function CardModal({ cardBundle, onCreateChat }: CardModalProps) {
  const { createModal, closeModal } = useApp();

  const handleExport = async () => {
    const res = await card.exportToZip(cardBundle.id);
    if (res.kind === "err") {
      toast.error(`Error exporting card. ${res.error}`);
      return;
    }
    toast.success("Card exported successfully.");
  };

  const handleEdit = () => {
    closeModal();
    createModal(<EditCardModal cardBundle={cardBundle} />);
  };

  return (
    <div className="flex h-[80vh] w-[40rem] items-center justify-center overflow-hidden rounded-3xl">
      <div className="scroll-secondary h-full w-full overflow-auto">
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
            className="absolute -bottom-12 left-4 h-24 w-24 select-none rounded-full border-4 border-float object-cover"
          />
        </div>
        {/* Character details container */}
        <div className="px-6 pb-6 pt-12">
          <div className="flex flex-row">
            <div className="w-[30rem] pr-10">
              <div className="pb-2 text-2xl font-semibold text-tx-primary">
                {cardBundle.data.character.name}
                {cardBundle.data.character.handle &&
                  <p className="text-tx-tertiary pb-1 text-sm font-medium">
                    {`@${cardBundle.data.character.handle}`}
                  </p> }
              </div>
              <p className="text-tx-tertiary pb-1 text-sm font-medium">
                {`created: ${time.isoToFriendly(cardBundle.data.meta.created_at)}`}
              </p>
              {cardBundle.data.meta.updated_at && (
                <p className="text-tx-tertiary pb-1 text-sm font-medium">{`Updated: ${cardBundle.data.meta.updated_at}`}</p>
              )}{" "}
              <p className="text-tx-tertiary text-sm font-semibold">by @{cardBundle.data.meta.creator.card}</p>
            </div>
            {/* Character tags */}
            <div className="mr-4 text-2xl font-medium text-tx-primary">Tags:</div>
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
                <PencilIcon className="size-6 text-tx-secondary transition duration-200 ease-out group-hover:text-tx-primary" />
              </Button>

              <Button className="group h-12 w-14 rounded-xl border-none bg-transparent p-0" onClick={handleExport}>
                <ArrowUpOnSquareIcon className="size-6 text-tx-secondary transition duration-200 ease-out group-hover:text-tx-primary" />
              </Button>
            </div>

            <Button
              size="icon"
              className="h-12 w-16 rounded-xl bg-action-primary transition ease-out"
              onClick={onCreateChat}
            >
              <ChatBubbleLeftRightIcon className="size-6 text-tx-primary" />
            </Button>
          </div>
          {/* Character details dropdowns */}
          <div className="mt-6">
            <Dropdown label="Character Description" content={cardBundle.data.character.description} />
            <Dropdown label="Character Notes" content={cardBundle.data.meta.notes ?? ""} />
            <Dropdown label="Greeting Message" content={cardBundle.data.character.greeting} />
            <Dropdown label="Example Messages" content={cardBundle.data.character.msg_examples} />
            <Dropdown label="World" content={cardBundle.data.world.description} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardModal;
