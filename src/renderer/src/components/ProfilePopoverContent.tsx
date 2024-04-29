import Avatar from "@/components/Avatar";
import Banner from "@/components/Banner";
import Dropdown from "@/components/Dropdown";
import Tag from "@/components/Tag";
import { PopoverContent } from "@/components/ui/popover";
import { time } from "@/lib/time";
import { CardBundle, PersonaBundle } from "@shared/types";

type Bundle = PersonaBundle | CardBundle;
interface ProfilePopoverProps {
  type: "user" | "character";
  bundle: Bundle;
}
export function ProfilePopoverContent({ type, bundle }: ProfilePopoverProps) {
  return type === "user" ? (
    <UserPopoverContent bundle={bundle as PersonaBundle} />
  ) : (
    <CharacterPopoverContent bundle={bundle as CardBundle} />
  );
}

function UserPopoverContent({ bundle }: { bundle: PersonaBundle }) {
  const bannerURI = "default_banner.png";
  const avatarURI = bundle.avatarURI || "default_avatar.png";

  return (
    <PopoverContent
      className="scroll-secondary bg-float max-h-[30rem] w-96 overflow-y-scroll p-0 pb-10"
      collisionPadding={50}
    >
      <AvatarAndBanner bannerURI={bannerURI} avatarURI={avatarURI} />
      <div className="px-6 pt-12">
        <div className="flex flex-row">
          <div className="pr-10">
            <div className="pb-1.5 text-xl font-semibold">{bundle.data.name}</div>
          </div>
        </div>
        {/* User details dropdowns */}
        <div className="-mx-2 mt-3 flex flex-col rounded-lg bg-container-primary p-3 space-y-4">
          <h3 className="mb-1 font-semibold text-tx-primary">About</h3>
          <p className="text-sm text-tx-secondary">{bundle.data.description}</p>
        </div>
      </div>
    </PopoverContent>
  );
}

function CharacterPopoverContent({ bundle }: { bundle: CardBundle }) {
  const bannerURI = bundle.bannerURI;
  const avatarURI = bundle.avatarURI;

  return (
    <PopoverContent className="scroll-secondary h-[30rem] w-96 overflow-y-scroll bg-float p-0">
      <AvatarAndBanner bannerURI={bannerURI} avatarURI={avatarURI} />
      <div className="pl-4 pr-2 pt-12">
        <div className="flex flex-row">
          <div className="pr-10">
            <div className="pb-1.5 text-xl font-semibold text-tx-primary">{bundle.data.character.name}</div>
            <div className="whitespace-nowrap text-xs text-tx-tertiary font-[550]">
              <p className="">{`created: ${time.isoToFriendly(bundle.data.meta.created_at)}`}</p>
              {bundle.data.meta.updated_at && <p className="">{`updated: ${bundle.data.meta.updated_at}`}</p>}
            </div>
          </div>
          {/* Tags */}
          <div className="flex flex-col gap-y-2">
            <div className="text-sm font-semibold text-tx-primary">Tags:</div>
            <div className="flex flex-wrap gap-x-1.5 gap-y-2">
              {bundle.data.meta.tags.map((tag, idx) => (
                <Tag key={idx} text={tag} />
              ))}
            </div>
          </div>
        </div>
        {/* Character details dropdowns */}
        <div className="mt-6">
          <Dropdown label="Description" content={bundle.data.character.description} />
          <Dropdown label="Creator Notes" content={bundle.data.meta.notes ?? ""} />
          <Dropdown label="Greeting Message" content={bundle.data.character.greeting} />
          <Dropdown label="Example Messages" content={bundle.data.character.msg_examples} />
        </div>
      </div>
    </PopoverContent>
  );
}

function AvatarAndBanner({ bannerURI, avatarURI }: { bannerURI: string; avatarURI: string }) {
  return (
    <div className="relative w-full rounded-lg">
      <Avatar avatarURI={avatarURI} className="absolute -bottom-12 left-4 size-20 border-float" />
      <Banner bannerURI={bannerURI} className="" />
    </div>
  );
}
