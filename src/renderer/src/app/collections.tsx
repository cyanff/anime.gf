import { useEffect, useState } from "react";
import { queries } from "@/lib/queries";
import { toast } from "sonner";
import { CardBundle } from "@shared/types";
import Card from "@/components/Card";
import CardModal from "@/components/CardModal";
import { DialogConfig, useApp } from "@/components/AppContext";

export default function CollectionsPage({ setPage, setChatID }) {
  const [cardBundles, setCardBundles] = useState<CardBundle[]>([]);
  const { createModal, closeModal, createDialog: createAlert } = useApp();

  const syncCards = async () => {
    const res = await queries.getAllExtantCardBundles();
    if (res.kind == "err") {
      toast.error("Error fetching card bundle.");
      return;
    }
    setCardBundles(res.value);
  };

  useEffect(() => {
    syncCards();
  }, []);

  async function onCreateChat(cardID: number, greeting: string) {
    const res = await queries.createChat(1, cardID);
    if (res.kind == "ok") {
      const chatCards = await queries.getRecentChats();
      if (chatCards.kind == "ok") {
        const message = await queries.insertMessage(chatCards.value[0].chat_id, greeting, "character");
        if (message.kind == "err") {
          toast.error("Error inserting character greeting message.");
        }
        setChatID(chatCards.value[0].chat_id);
      }
      setPage("chats");
    } else {
      toast.error("Error creating new chat.");
    }
    closeModal();
  }

  return (
    <div className="h-full w-full bg-neutral-800 antialiased lg:text-base">
      {/* Collection Area */}
      <div className="scroll-primary flex flex-wrap overflow-y-scroll scroll-smooth transition duration-500 ease-out">
        {cardBundles?.map((cardBundle, idx) => {
          return (
            <Card
              key={idx}
              deleteCard={() => {
                const alertConfig: DialogConfig = {
                  title: `Delete ${cardBundle.data.character.name}`,
                  description: `Are you sure you want to delete ${cardBundle.data.character.name}?\nThis action will also delete corresponding chats with ${cardBundle.data.character.name} and cannot be undone.`,
                  actionLabel: "Delete",
                  onAction: async () => {
                    await queries.deleteCard(cardBundle.id);
                    syncCards();
                  }
                };
                createAlert(alertConfig);
              }}
              avatar={cardBundle.avatarURI || ""}
              name={cardBundle.data.character.name}
              openCardModal={() => {
                createModal(<CardModal cardBundle={cardBundle} onCreateChat={onCreateChat} />);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
