import { useApp } from "@/components/AppContext";
import { ChatSearchItem, queries } from "@/lib/queries";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

export default function ChatsSearchModal() {
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<ChatSearchItem[]>([]);
  const [searchItems, setSearchItems] = useState<ChatSearchItem[]>([]);

  const { setChatID, closeModal } = useApp();

  useEffect(() => {
    (async () => {
      const res = await queries.getAllChatSearchItems();
      setSearchItems(res);
      setSearchResults(res);
    })();
  }, []);

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
    <div className="flex h-[45rem] w-[40rem] flex-col space-y-6 rounded-2xl bg-neutral-800 px-16 py-8">
      {/* Search bar */}
      <div className="flex h-fit w-full shrink-0 items-center space-x-2 rounded-2xl border-2 border-neutral-800 bg-neutral-900 p-2">
        <MagnifyingGlassIcon className="ml-2 size-6 shrink-0 text-neutral-400" />
        <input
          className="h-9 w-full grow bg-neutral-900 text-gray-100 caret-white focus:outline-none"
          placeholder="Search for a chat"
          value={searchInput}
          onChange={searchInputHandler}
        ></input>
      </div>
      {/* Search results */}
      <div className="scroll-tertiary flex grow flex-col space-y-2 overflow-auto">
        {searchResults?.length === 0 ? (
          <div className="text-center font-[500] text-neutral-500">No results found :&lt; </div>
        ) : (
          searchResults?.map((result, idx) => {
            return (
              <div
                key={idx}
                className="flex h-[4.5rem] w-full cursor-pointer items-center rounded-lg bg-[#363636]  px-3 py-3  hover:bg-neutral-700"
                onClick={() => {
                  setChatID(result.id);
                  closeModal();
                }}
              >
                <div className="flex h-full w-full items-center">
                  <img src={result.characterAvatarURI} alt="character" className="size-12 rounded-full object-cover" />
                  <div className={`ml-4 flex h-full max-w-full flex-col justify-center group-hover:text-gray-100`}>
                    <h3 className="line-clamp-1 font-[570]">{result.characterName}</h3>
                    <p className="line-clamp-1 text-[15px] font-[450] text-neutral-400">{result.lastMessage}</p>
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
