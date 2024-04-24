import { DialogConfig, useApp } from "@/components/AppContext";
import CardDeleted from "@/components/CardDeleted";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queries } from "@/lib/queries";
import { ArrowUpIcon, Bars3BottomLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { CardBundle } from "@shared/types";
import Fuse from "fuse.js";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface CollectionsPageProps {
  setPage: (page: string) => void;
  setChatID: (chatID: number) => void;
  cardBundles: CardBundle[];
  syncCardBundles: () => void;
}

export default function SettingsRecentlyDeleted() {
  const { createModal, closeModal, createDialog } = useApp();
  const [deletedCards, setDeletedCards] = useState<CardBundle[]>();

  const [searchInput, setSearchInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<CardBundle[]>();
  const [sortBy, setSortBy] = useState<string>("alphabetical");
  const [descending, setDescending] = useState<boolean>(true);

  useEffect(() => {
    syncDeletedCardBundles();
  }, []);

  const syncDeletedCardBundles = async () => {
    const res = await queries.getAllDeletedCardBundles();
    if (res.kind == "err") {
      toast.error("Error fetching card bundle.");
      console.error(res.error);
      return;
    }
    setDeletedCards(res.value);
  };

  // TODO, edit card bundle type to also include all data from the card table
  // then add sort by "imported" which is the inserted_at column in the db
  const sortByNameAndValue = [
    { name: "Alphabetical", value: "alphabetical" },
    { name: "Created", value: "created" },
    { name: "Updated", value: "updated" }
  ];
  const fuseRef = useRef<Fuse<CardBundle>>();

  // On cardBundles change, update fuse search index
  useEffect(() => {
    const fuseOptions = {
      keys: ["data.character.name"],
      includeScore: true,
      threshold: 0.3
    };
    fuseRef.current = new Fuse(deletedCards, fuseOptions);
  }, [deletedCards]);

  // On searchInput change, update the search results
  useEffect(() => {
    if (!fuseRef.current) return;
    if (searchInput.trim() === "") {
      setSearchResults(deletedCards);
      return;
    }
    const results = fuseRef.current.search(searchInput).map((result) => result.item);
    setSearchResults(results);
  }, [searchInput, deletedCards]);

  /**
   * A function to compare two `CardBundle` objects based on the current `sortBy` and `descending` state.
   *
   * @param a - The first `CardBundle` object to compare.
   * @param b - The second `CardBundle` object to compare.
   * @returns
   * A ternary value (-1, 0 ,1) indicating the sort order of the two `CardBundle` objects.
   * -1: a should come before b
   * 0: a and b are equal
   * 1: a should come after b
   */
  const cardBundleSearchFN = (a: CardBundle, b: CardBundle) => {
    let valueA: any, valueB: any;
    switch (sortBy) {
      case "alphabetical":
        valueA = a.data.character.name.toLowerCase();
        valueB = b.data.character.name.toLowerCase();
        break;
      case "created":
        valueA = new Date(a.data.meta.created_at);
        valueB = new Date(b.data.meta.created_at);
        break;
      case "updated":
        // Fallback to created date if updated date is not available
        valueA = new Date(a.data.meta.updated_at || a.data.meta.created_at);
        valueB = new Date(b.data.meta.updated_at || b.data.meta.created_at);
        break;
      default:
        return 0;
    }
    let comparisonResult: number;
    if (valueA < valueB) {
      comparisonResult = -1;
    } else if (valueA > valueB) {
      comparisonResult = 1;
    } else {
      comparisonResult = 0;
    }
    // If descending is true, we want the comparison result to be reversed
    return descending ? -comparisonResult : comparisonResult;
  };

  // On sortBy or descending change, update the search results
  useEffect(() => {
    if (!searchResults) return;
    const sortedResults = searchResults.sort(cardBundleSearchFN);
    setSearchResults([...sortedResults]);
  }, [sortBy, descending]);

  async function handleDeleteChat(cardID: number, greeting: string) {
    const res = await queries.deleteChat(1, cardID);
    if (res.kind == "ok") {
    } else {
      toast.error("Error creating new chat.");
    }
    closeModal();
  }

  return (
    <div className="scroll-primary  h-full w-full overflow-y-scroll antialiased  lg:text-base">
      <div className="flex flex-row space-x-4 py-2 pb-8">
        {/* Search Bar*/}
        <div className="flex h-12 w-[30rem] shrink-0 items-center space-x-2 rounded-xl bg-background p-2">
          <MagnifyingGlassIcon className="ml-2 size-6 shrink-0 text-primary" />
          <input
            className="h-9 w-full grow bg-background text-primary focus:outline-none "
            placeholder="Search for a chat"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          ></input>
        </div>
        {/* Sort By Selection*/}
        <div className="flex">
          <Select onValueChange={(v) => setSortBy(v)} value={sortBy}>
            <SelectTrigger className="h-12 select-none space-x-2 rounded-xl bg-background font-medium text-primary">
              <Bars3BottomLeftIcon height="24px" />
              <SelectValue placeholder={sortBy === "" ? "Select a filter" : sortBy} />
            </SelectTrigger>
            <SelectContent className="bg-background">
              {sortByNameAndValue.map((nameAndValue, idx) => (
                <SelectItem key={idx} value={nameAndValue.value}>
                  {nameAndValue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Ascending / Descending Arrow */}
          <button
            className="p-2 focus:outline-none"
            onClick={() => {
              setDescending(!descending);
            }}
          >
            <ArrowUpIcon
              className={`${descending ? "rotate-180" : "rotate-0"} text-neutral-125 duration-125 size-5 text-secondary transition ease-out `}
            />
          </button>
        </div>
      </div>

      {/* Collection Area */}
      <div className="flex flex-wrap  gap-4 scroll-smooth transition duration-500 ease-out">
        {searchResults?.length === 0 && (
          <div className="line-clamp-1 w-full whitespace-pre text-center text-lg font-semibold text-neutral-400">
            {"No cards found  ╥﹏╥"}
          </div>
        )}

        {searchResults?.map((cardBundle, idx) => {
          return (
            <CardDeleted
              key={idx}
              cardBundle={cardBundle}
              syncCardBundles={syncCardBundles}
             
            />
          );
        })}
      </div>
    </div>
  );
}
