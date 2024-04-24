import CharacterForm from "@/components/CharacterForm";
import { cardFormDataToCardData } from "@/lib/utils";
import { CardData, CardFormData } from "@shared/types";
import { useApp } from "@/components/AppContext";
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
      console.log("Post function ran successfully. File path:", res.value);
      setPage("collections");
    } else {
      console.error("An error occurred while running the post function:", res.error);
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
