import CharacterForm from "@/components/CharacterForm";
import { cardFormDataToCardData } from "@/lib/utils";
import { CardData, CardFormData } from "@shared/types";

interface CreationPageProps {
  setPage: (page: string) => void;
  syncCardBundles: () => void;
}

export default function CreationPage({ setPage, syncCardBundles }: CreationPageProps) {
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
      <div className="h-5/6 w-1/3 min-w-[30rem] overflow-hidden rounded-2xl border border-line">
        <CharacterForm onSuccessfulSubmit={onSuccessfulSubmit} formType="create" />
      </div>
    </div>
  );
}
