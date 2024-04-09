import { useState } from "react";
import { CardBundle } from "@shared/types";

interface Props {
  cardBundle: CardBundle;
}

function CardModal({ cardBundle }: Props) {
  return (
    <div className="flex w-[45rem] items-center justify-center">
      <div className="scroll-primary h-[60rem] overflow-y-scroll rounded-lg">
        {/* Banner and profile picture */}
        <div className="relative rounded-lg">
          <img
            src={cardBundle.bannerURI}
            alt="Banner"
            className="h-48 w-full rounded-t-lg bg-neutral-700 object-cover"
          />
          <img
            src={cardBundle.avatarURI}
            alt="Profile"
            className="absolute -bottom-12 left-4 h-24 w-24 rounded-full border-4 border-neutral-800 object-cover"
          />
        </div>
        {/* Character details container */}
        <div className="px-6 pb-6 pt-12">
          <div className="flex flex-row">
            <div className="w-[30rem] pr-10">
              <div className="pb-2 text-2xl font-semibold">{cardBundle.data.character.name}</div>
              <div className="whitespace-nowrap italic text-neutral-400">
                {`created ${cardBundle.data.meta.created_at}${cardBundle.data.meta.updated_at ? ` - updated ${cardBundle.data.meta.updated_at}` : ""}`}
              </div>
            </div>
            {/* Character tags */}
            <div className="flex">
              <div className="mr-4 text-2xl font-semibold">Tags:</div>
              <div>
                {cardBundle.data.meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="m-1 inline-block rounded-full bg-neutral-700 px-5 py-3 text-sm font-semibold text-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* Character details dropdowns */}
          <div className="mt-4">
            <Dropdown label="Character Description" content={cardBundle.data.character.description} />
            <Dropdown label="Character Persona" content={cardBundle.data.meta.notes ?? ""} />
            <Dropdown label="Greeting Message" content={cardBundle.data.character.greeting} />
            <Dropdown label="Example Messages" content={cardBundle.data.character.msg_examples} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface DropdownProps {
  label: string;
  content: string;
}

function Dropdown({ label, content }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-2">
      <button
        className="flex w-full items-center justify-between rounded-lg bg-neutral-700 px-4 py-2 text-left text-sm font-medium text-gray-200 hover:bg-neutral-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{label}</span>
        {isOpen ? (
          <img src="/button/arrow.svg" className="rotate-180 transform" alt="description" />
        ) : (
          <img src="/button/arrow.svg" alt="description" />
        )}
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="px-4 pb-2 pt-4 text-sm text-gray-200">{content}</div>
      </div>
    </div>
  );
}
export default CardModal;
