import { useEffect, useState } from "react";
import { queries } from "@/lib/queries";
import { toast } from "sonner";
import { CardBundle } from "@shared/types";
import Card from "@/components/Card";
import CardModal from "@/components/CardModal";
import { useApp } from "@/components/AppContext";

export default function CollectionsPage({setPage, setChatID}) {
  const [cardBundles, setCardBundles] = useState<CardBundle[]>([]);
  const { createModal, closeModal } = useApp();

  useEffect(() => {
    const fetchData = async () => {
      const res = await queries.getCardBundles();
      if (res.kind == "err") {
        toast.error("Error fetching card bundle.");
        return;
      }
      setCardBundles(res.value);
    };

    fetchData();
  }, []);

  async function onCreateChat(cardID: number) {
    const res = await queries.createChat(1, cardID);
    if (res.kind == "ok") {
      setPage("chats");

      const res = await queries.getMostRecentChat();
      setChatID(res);
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
              avatar={cardBundle.avatarURI || ""}
              name={cardBundle.data.character.name}
              onClick={() => {
                createModal(<CardModal cardBundle={cardBundle} onCreateChat={onCreateChat} />);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
