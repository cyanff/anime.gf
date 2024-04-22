import { useApp } from "@/components/AppContext";
import { ChatSearchItem, queries } from "@/lib/queries";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import Fuse from "fuse.js";
import { useEffect, useRef, useState } from "react";

export default function ChatsSearchModal() {
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<ChatSearchItem[]>([]);
  const [searchItems, setSearchItems] = useState<ChatSearchItem[]>([]);
  const fuseRef = useRef<Fuse<ChatSearchItem>>();

  const { setChatID, closeModal } = useApp();

  useEffect(() => {
    (async () => {
      const res = await queries.getAllChatSearchItems();
      setSearchItems(res);
      setSearchResults(res);
    })();
  }, []);

  useEffect(() => {
    const fuseOptions = {
      keys: ["characterName"],
      includeScore: true,
      threshold: 0.3
    };
    fuseRef.current = new Fuse(searchItems, fuseOptions);
  }, [searchItems]);

  useEffect(() => {
    if (!fuseRef.current) return;
    if (searchInput.trim() === "") {
      setSearchResults(searchItems);
      return;
    }
    const results = fuseRef.current.search(searchInput).map((result) => result.item);
    setSearchResults(results);
  }, [searchInput, fuseRef]);

  const searchInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setSearchInput(input);
    if (input === "") {
      setSearchResults(searchItems);
      return;
    }

    const res = searchItems.filter((item) => item.characterName.toLowerCase().includes(input.toLowerCase()));
    setSearchResults(res);
  };

  return (
    <div className="flex h-[45rem] w-[40rem] flex-col space-y-6 rounded-2xl bg-neutral-900 px-16 py-8">
      {/* Search bar */}
      <div className="flex h-fit w-full shrink-0 items-center space-x-3 overflow-hidden rounded-2xl bg-neutral-800 py-2 pl-1">
        <MagnifyingGlassIcon className="ml-2 size-6 shrink-0 font-[500] text-neutral-400" />
        <input
          className="h-12 grow bg-inherit text-gray-100 caret-white focus:outline-none"
          placeholder="Search for a chat"
          value={searchInput}
          onChange={searchInputHandler}
        ></input>
      </div>
      {/* Search results */}
      <div className="scroll-secondary flex grow flex-col space-y-4 overflow-auto px-4">
        {searchResults?.length === 0 ? (
          <div className="text-center font-[500] text-neutral-500">No results found :&lt; </div>
        ) : (
          searchResults?.map((result, idx) => {
            return (
              <div
                key={idx}
                className="flex h-[4.5rem] w-full cursor-pointer items-center rounded-2xl  px-3 py-3  transition duration-200 ease-out hover:bg-neutral-800"
                onClick={() => {
                  setChatID(result.id);
                  closeModal();
                }}
              >
                <div className="flex h-full w-full items-center">
                  <img
                    src={result.characterAvatarURI}
                    alt="character"
                    className="size-12 shrink-0 rounded-full object-cover"
                  />
                  <div className={`justify-cente ml-4 flex h-full max-w-full flex-col`}>
                    <h3 className="line-clamp-1 text-[0.95rem] font-[600] text-neutral-200">{result.characterName}</h3>
                    <p className="line-clamp-1 text-[15px] font-[480] text-neutral-400">{result.lastMessage}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
