import { queries } from "@/lib/queries";
import { toast } from "sonner";
import Card from "@/components/Card";
import CardModal from "@/components/CardModal";
import { DialogConfig, useApp } from "@/components/AppContext";
import { CardBundle } from "@shared/types";
import { BarsArrowDownIcon, MagnifyingGlassCircleIcon } from "@heroicons/react/24/outline";
import { Bars3BottomLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface CollectionsPageProps {
  setPage: (page: string) => void;
  setChatID: (chatID: number) => void;
  cardBundles: CardBundle[];
  setCardBundle: (cardBundle: CardBundle) => void;
  syncCardBundles: () => void;
}

export default function CollectionsPage({
  setPage,
  setChatID,
  cardBundles,
  setCardBundle,
  syncCardBundles
}: CollectionsPageProps) {
  const { createModal, closeModal, createDialog: createAlert } = useApp();
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<CardBundle[]>([]);
  const [filter, setFilter] = useState<string>("");
  const filterNameAndValue = [
    { name: "Recently Added", value: "placeholder1" },
    { name: "Alphabetical", value: "placeholder2" },
    { name: "Newest", value: "placeholder3" },
    { name: "Oldest", value: "placeholder4" }
  ];

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
    <div className="scroll-primary h-full w-full overflow-y-scroll bg-neutral-800 antialiased  lg:text-base">
      <div className="flex flex-row space-x-4 py-2 pb-8">
        {/* Search Bar*/}
        <div className="flex h-12 w-[30rem] shrink-0 items-center space-x-2 rounded-lg bg-neutral-700 p-2">
          <MagnifyingGlassIcon className="ml-2 size-6 shrink-0 text-neutral-400" />
          <input
            className="h-9 w-full grow bg-neutral-700 text-gray-100 caret-white focus:outline-none"
            placeholder="Search for a chat"
            value={searchInput}
            onChange={(e) => {}}
          ></input>
        </div>
        {/* Filter Selection*/}
        <div className="space-y-1 pr-8">
          <Select onValueChange={(v) => setFilter(v)} value={filter}>
            <SelectTrigger className="h-12 space-x-2 rounded-xl bg-neutral-700 text-neutral-200">
              <Bars3BottomLeftIcon height="24px" />
              <SelectValue placeholder={filter === "" ? "Select a filter" : filter} />
            </SelectTrigger>
            <SelectContent className="bg-neutral-700">
              {filterNameAndValue.map((nameAndValue, idx) => (
                <SelectItem key={idx} value={nameAndValue.value}>
                  {nameAndValue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Collection Area */}
      <div className="flex flex-wrap  scroll-smooth transition duration-500 ease-out">
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
                    syncCardBundles();
                  }
                };
                createAlert(alertConfig);
              }}
              editCard={() => {
                setCardBundle(cardBundle);
                setPage("edit");
              }}
              cardBundle={cardBundle}
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
