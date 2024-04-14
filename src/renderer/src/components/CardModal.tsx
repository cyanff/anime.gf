import { useState } from "react";
import { CardBundle } from "@shared/types";
import Dropdown from "@/components/Dropdown";

interface Props {
  cardBundle: CardBundle;
}

function CardModal({ cardBundle }: Props) {
  return (
    <div className="flex w-[45rem] items-center justify-center">
      <div className="scroll-secondary h-[60rem] overflow-y-scroll rounded-lg">
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

export default CardModal;
