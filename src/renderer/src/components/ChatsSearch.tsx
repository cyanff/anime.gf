import { ChatSearchItem } from "@/lib/queries";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";

interface ChatsSearchProps {
  onSelect(selected: any): void;
  chatSearchItems: ChatSearchItem[];
}

export default function ChatsSearch({ onSelect, chatSearchItems }: ChatsSearchProps) {
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<ChatSearchItem[]>([]);
  const rootTrieNodeRef = useRef<TrieNode>({} as TrieNode);

  interface SearchItem {
    str: string;
    idx: number;
  }

  interface TrieNode {
    childrens: Map<string, TrieNode>;
    resultIDXs: number[];
  }

  // On load, build search trie and default resutls to all chat search items
  useEffect(() => {
    (async () => {
      const searchItems = chatSearchItems.map((item, idx) => {
        return {
          str: item.characterName,
          idx
        };
      });
      rootTrieNodeRef.current = buildSearchTrie(searchItems);

      setSearchResults(chatSearchItems);
    })();
  }, []);

  function newTrieNode(): TrieNode {
    return {
      childrens: new Map(),
      resultIDXs: []
    };
  }

  const buildSearchTrie = (searchItems: SearchItem[]): TrieNode => {
    const root = newTrieNode();
    const resultIDXs = searchItems.map((item) => item.idx);
    root.resultIDXs = resultIDXs;
    let traverser: TrieNode = root;

    for (let i = 0; i < searchItems.length; i++) {
      let { str, idx } = searchItems[i];
      str = str.toLowerCase();

      for (let j = 0; j < str.length; j++) {
        const letter = str.charAt(j);
        // Create a new node if the child letter node doesn't exist
        if (!traverser.childrens.has(letter)) {
          const trie = newTrieNode();
          traverser.childrens.set(letter, trie);
        }
        // Move the traverser down the trie
        traverser = traverser.childrens.get(letter)!;
        // Store the id of the search item on to the node
        traverser.resultIDXs.push(idx);
      }
      traverser = root;
    }
    return root;
  };

  const searchTrie = (word: string): number[] => {
    const lower = word.toLowerCase();
    let traverser = rootTrieNodeRef.current!;
    if (lower.length === 0) {
      return traverser.resultIDXs;
    }

    let results: number[] = [];
    for (let i = 0; i < lower.length; i++) {
      const letter = lower[i];
      if (!traverser.childrens.has(letter)) {
        results = [];
        break;
      }
      traverser = traverser.childrens.get(letter)!;
      results = traverser.resultIDXs;
    }
    return results;
  };

  if (rootTrieNodeRef === undefined) {
    return <div></div>;
  }

  return (
    <div className="mb-2 mt-4 flex h-[35rem] w-[50rem] flex-col space-y-3 p-2">
      {/* Search bar */}
      <div className="flex h-fit w-full shrink-0 items-center space-x-2 rounded-lg bg-neutral-800 p-2">
        <MagnifyingGlassIcon className="ml-2 size-6 shrink-0 text-neutral-400" />
        <input
          className="h-9 w-full grow bg-neutral-800 text-gray-100 caret-white focus:outline-none"
          placeholder="Search for a chat"
          value={searchInput}
          onChange={(e) => {
            const value = e.target.value;
            setSearchInput(value);
            const IDXs = searchTrie(value);
            const res = IDXs.map((idx) => {
              return chatSearchItems[idx];
            });

            setSearchResults(res);
          }}
        ></input>
      </div>
      {/* Search results */}
      <div className="flex grow flex-col space-y-2 rounded-lg">
        {searchResults?.length === 0 ? (
          <div className="text-center font-medium text-gray-300">No results found</div>
        ) : (
          searchResults?.map((result, idx) => {
            return (
              <div
                key={idx}
                className="flex h-16 w-full cursor-pointer items-center rounded-md bg-neutral-800 p-2  hover:bg-neutral-700"
                onClick={() => {
                  onSelect(result);
                }}
              >
                <div className="flex h-full w-full items-center">
                  <img src={result.characterAvatarURI} alt="character" className="size-10 rounded-full object-cover" />
                  <div className={`ml-4 flex h-full max-w-full flex-col justify-center group-hover:text-gray-100`}>
                    <h3 className="line-clamp-1 font-[550]">{result.characterName}</h3>
                    <p className="line-clamp-1 text-[15px] font-[430]">{result.lastMessage}</p>
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
