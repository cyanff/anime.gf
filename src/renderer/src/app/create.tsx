import CharacterForm from "@/components/CharacterForm";
import { cardFormDataToCardData } from "@/lib/utils";
import { CardData, CardFormData } from "@shared/types";
import { useApp } from "@/components/AppContext";
import { toast } from "sonner";

interface CreationPageProps {
  setPage: (page: string) => void;
}

export default function CreationPage({ setPage }: CreationPageProps) {
  const { syncCardBundles } = useApp();
  async function onSuccessfulSubmit(data: CardFormData) {
    const cardData: CardData = cardFormDataToCardData(data);
    const res = await window.api.blob.cards.create(
      cardData,
      data.character.bannerURI ?? null,
      data.character.avatarURI ?? null
    );
    if (res.kind === "ok") {
      setPage("collections");
      toast.success(`Created ${data.character.name} ^-^`);
    } else {
      toast.error("Error creating character.");
      console.error("An error occurred while running the create function:", res.error);
    }
    syncCardBundles();
  }

  return (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-background">
      {/* Scroll Wrapper */}
      <div className="border-line h-5/6 w-1/3 min-w-[30rem] overflow-hidden rounded-2xl border">
        <CharacterForm onSuccessfulSubmit={onSuccessfulSubmit} formType="create" />
      </div>
    </div>
  );
}
