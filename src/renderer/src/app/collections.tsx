import { useEffect, useState } from "react";
import { queries } from "@/lib/queries";
import { toast } from "sonner";
import { CardBundle } from "@shared/types";
import Card from "@/components/Card";
import CardModal from "@/components/CardModal";
import { useApp } from "@/components/AppContext";

export default function CollectionsPage() {
  const [cardBundles, setCardBundles] = useState<CardBundle[]>([]);
  const { createModal } = useApp();

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
                createModal(<CardModal cardBundle={cardBundle} />);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
