import { useApp } from "@/components/AppContext";
import CardForm from "@/components/CardForm";
import { cardFormDataToCardData } from "@/lib/utils";
import { CardFormData } from "@shared/forms";
import { UICardBundle } from "@shared/types";
import { toast } from "sonner";

interface EditCardModalProps {
  cardBundle: UICardBundle;
}

export default function EditCardModal({ cardBundle }: EditCardModalProps) {
  const { closeModal, syncCardBundles } = useApp();

  const handleSuccessfulSubmit = async (data: CardFormData) => {
    const cardData = cardFormDataToCardData(data);

    const res = await window.api.blob.cards.update(
      cardBundle.id,
      cardData,
      data.character.bannerFilePath ?? null,
      data.character.avatarFilePath ?? null
    );
    syncCardBundles();
    if (res.kind === "err") {
      toast.error("Error updating card.");
      console.error("An error occurred while running the update function:", res.error);
      return;
    }
    closeModal();
  };

  return (
    <div className="h-[80vh] w-[50rem] overflow-hidden rounded-3xl">
      <CardForm cardBundle={cardBundle} formType="edit" onSuccessfulSubmit={handleSuccessfulSubmit} />
    </div>
  );
}
