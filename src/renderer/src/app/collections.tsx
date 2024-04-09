import { useEffect, useState } from "react";
import SideBar from "@/components/SideBar";
import { queries } from "@/lib/queries";
import { toast } from "sonner";
import { CardBundle } from "@shared/types";

export default function CollectionsPage() {
  const [cardBundles, setCardBundles] = useState<CardBundle[]>([]);

  const fetchCardBundles = async () => {
    // const res = await queries.getCardBundles();
    // if (res.kind == "err") {
    //   toast.error("Error fetching card bundle.");
    //   return;
    // }
    // setCardBundles(res.value);
  };
  return (
    <div className="flex h-screen bg-neutral-800 pb-6 pl-6 pt-6 text-sm text-neutral-100 antialiased lg:text-base"></div>
  );
}
