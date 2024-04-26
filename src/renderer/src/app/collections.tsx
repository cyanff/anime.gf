import { useApp } from "@/components/AppContext";
import Card from "@/components/Card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpIcon, Bars3BottomLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { CardBundle } from "@shared/types";
import Fuse from "fuse.js";
import { useEffect, useRef, useState } from "react";

interface CollectionsPageProps {
  setPage: (page: string) => void;
  cardBundles: CardBundle[];
}

export default function CollectionsPage({ setPage, cardBundles }: CollectionsPageProps) {
  const { createModal, closeModal, setActiveChatID } = useApp();
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<CardBundle[]>(cardBundles);
  const [sortBy, setSortBy] = useState<string>("alphabetical");
  const [descending, setDescending] = useState<boolean>(true);
  const { createDialog } = useApp();

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
    fuseRef.current = new Fuse(cardBundles, fuseOptions);
  }, [cardBundles]);

  // On searchInput change, update the search results
  useEffect(() => {
    if (!fuseRef.current) return;
    if (searchInput.trim() === "") {
      setSearchResults(cardBundles);
      return;
    }
    const results = fuseRef.current.search(searchInput).map((result) => result.item);
    setSearchResults(results);
  }, [searchInput, cardBundles]);

  /**
   * Compares two `CardBundle` objects based on the current `sortBy` and `descending` state.
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

  return (
    <div className="scroll-primary h-full w-full overflow-y-scroll antialiased lg:text-base pl-4">
      <div className="flex flex-row space-x-4 py-2 pb-8">
        {/* Search Bar*/}
        <div className="flex h-12 w-[30rem] shrink-0 items-center space-x-2 rounded-xl bg-input-primary p-2">
          <MagnifyingGlassIcon className="ml-2 size-6 shrink-0 text-tx-secondary" />
          <Input
            className="h-9 w-full border-none grow bg-inherit text-tx-primary focus:outline-none "
            placeholder="Search for a chat"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        {/* Sort By Selection*/}
        <div className="flex">
          <Select onValueChange={(v) => setSortBy(v)} value={sortBy}>
            <SelectTrigger className="h-12 select-none space-x-2 rounded-xl font-medium text-tx-secondary">
              <Bars3BottomLeftIcon height="24px" />
              <SelectValue placeholder={sortBy === "" ? "Select a filter" : sortBy} />
            </SelectTrigger>
            <SelectContent className="text-tx-secondary">
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
              className={`${descending ? "rotate-180" : "rotate-0"} duration-125 size-5 text-tx-secondary transition ease-out`}
            />
          </button>
        </div>
      </div>

      {/* Collection Area */}
      <div className="flex flex-wrap gap-4 scroll-smooth transition duration-500 ease-out">
        {searchResults?.length === 0 && (
          <div className="w-full whitespace-pre text-center text-lg font-semibold text-tx-tertiary leading-9">
            {"No cards found  ╥﹏╥ \n You can drag and drop card.zip(s) here to import them!"}
          </div>
        )}

        {searchResults?.map((cardBundle, idx) => {
          return <Card key={idx} cardBundle={cardBundle} />;
        })}
      </div>
    </div>
  );
}
