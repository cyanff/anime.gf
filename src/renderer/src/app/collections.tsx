import { useEffect, useState } from "react";
import { queries } from "@/lib/queries";
import { toast } from "sonner";
import { CardBundle } from "@shared/types";

export default function CollectionsPage() {
  const [cardBundles, setCardBundles] = useState<CardBundle[]>([]);

  const fetchCardBundles = async () => {
    const res = await queries.getCardBundles();
    if (res.kind == "err") {
      toast.error("Error fetching card bundle.");
      return;
    }
    setCardBundles(res.value);
  };
  return (
    <div className="flex h-screen bg-neutral-800 pb-6 pl-6 pt-6 text-sm text-neutral-100 antialiased lg:text-base">
      {/* Chat Area */}
      <div className="scroll-primary flex space-y-4 overflow-y-scroll scroll-smooth px-5 transition duration-500 ease-out">
        {/* {cardBundles?.map((cardBundle, idx) => {
          return (
            <Card
              key={idx}
              avatar={cardBundle.avatarURI}
              name={cardBundle.data.character.name}
            />
          );
        })} */}
      </div>
    </div>
  );
}
