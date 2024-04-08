import { queries } from "@/lib/queries";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChatSearchItem } from "@/lib/queries";

export default function SettingsPage() {
  const [searchInput, setSearchInput] = useState<string>("");

  const rootTrieNodeRef = useRef<TrieNode | undefined>();
  const chatSearchItemsRef = useRef<ChatSearchItem[] | undefined>();

  interface SearchItem {
    str: string;
    idx: number;
  }

  interface TrieNode {
    childrens: Map<string, TrieNode>;
    resultIDXs: number[];
  }

  // Build trie on load
  useEffect(() => {
    (async () => {
      const chatSearchItems = await queries.getChatSearchItems();
      chatSearchItemsRef.current = chatSearchItems;
      const searchItems = chatSearchItems.map((item, idx) => {
        return {
          str: item.characterName,
          idx
        };
      });

      rootTrieNodeRef.current = buildSearchTrie(searchItems);
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
    <div className="flex w-full items-center bg-neutral-800 pb-6 pl-6 pt-6 text-sm text-neutral-100 antialiased lg:text-base">
      <div className="mb-2 flex w-96 items-center space-x-2 rounded-full bg-neutral-700">
        <MagnifyingGlassIcon className="ml-2 size-6 shrink-0 text-neutral-400" />
        <input
          className="h-9 w-full grow bg-neutral-700 text-gray-100 caret-white focus:outline-none"
          placeholder="Search for a chat"
          value={searchInput}
          onChange={(e) => {
            const value = e.target.value;
            setSearchInput(value);
            const IDXs = searchTrie(value);
            const resStr = IDXs.map((idx) => {
              console.log("result:", chatSearchItemsRef.current![idx]);
            });
          }}
        ></input>
      </div>
    </div>
  );
}
