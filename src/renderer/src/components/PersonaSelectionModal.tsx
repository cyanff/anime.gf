import { useApp } from "@/components/AppContext";
import { Button } from "@/components/ui/button";
import { queries } from "@/lib/queries";
import { UIPersonaBundle } from "@shared/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PersonaSelectionModalProps {
  onPersonaSelect: (personaBundle: UIPersonaBundle) => void;
}

export default function PersonaSelectionModa({ onPersonaSelect }: PersonaSelectionModalProps) {
  const [personaBundles, setPersonaBundles] = useState<UIPersonaBundle[]>([]);

  useEffect(() => {
    syncPersonaBundles();
  }, []);

  const syncPersonaBundles = async () => {
    const res = await queries.getAllExtantPersonaBundles();
    if (res.kind == "err") {
      toast.error("Error fetching persona bundles.");
      console.error(res.error);
      return;
    }
    setPersonaBundles(res.value);
  };

  const { closeModal } = useApp();

  return (
    <div className=" flex min-h-24 rounded-2xl w-[26rem] bg-float p-6 flex-col space-y-9">
      {/* Modal title and description */}
      <div className="flex flex-col ml-3">
        <h1 className="text-tx-primary text-xl font-semibold">Persona Selection</h1>
        <h2 className="text-tx-secondary text-sm">Select a persona to use for this chat.</h2>
      </div>

      <div className="scroll-secondary flex h-full w-full flex-col space-y-2 overflow-y-auto max-h-96 px-2">
        {personaBundles.length === 0 && (
          <div className="flex h-full w-full items-center justify-center">
            <p className="select-none text-center text-sm font-[650] text-tx-tertiary whitespace-pre-wrap">
              You don&apos;t have a persona yet... <br /> Create one in settings -&gt; personas
            </p>
          </div>
        )}

        {personaBundles.map((bundle) => (
          <button
            key={bundle.data.id}
            className={`group flex h-fit w-full items-center justify-between rounded-lg p-3 font-[480] text-tx-primary transition duration-200
                      ease-out hover:bg-accent focus:outline-none`}
            onClick={() => {
              onPersonaSelect(bundle);
              closeModal();
            }}
          >
            <div className="mr-3 flex w-full items-center space-x-5 ">
              <img
                draggable="false"
                className="size-12 rounded-full object-cover object-top"
                src={bundle.avatarURI || "default_avatar.png"}
                alt="Avatar"
              />
              <div className="flex w-full flex-col">
                <h3 className="line-clamp-1 w-5/6 text-ellipsis text-left text-[1.07rem] font-[550]">
                  {bundle.data.name}
                </h3>
                {bundle.data.description && bundle.data.description.length != 0 && (
                  <p className="line-clamp-1 text-ellipsis text-left text-[0.88rem] font-[470] text-tx-secondary">
                    {bundle.data.description}
                  </p>
                )}
              </div>
            </div>
            {bundle.data.is_default === 1 && <p className="text-tx-tertiary text-sm">Default</p>}
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <Button
          className="text-tx-primary font-semibold bg-action-primary h-10 w-fit "
          onClick={() => {
            const defaults = personaBundles.filter((bundle) => bundle.data.is_default === 1);

            if (defaults.length === 0) {
              toast.error("You don't have a default persona set.");
              return;
            }
            if (defaults.length > 1) {
              console.error(
                "More than one default persona set. This should not happen. Selecting the first default persona."
              );
            }
            onPersonaSelect(defaults[0]);
            closeModal();
          }}
        >
          Use Default
        </Button>
      </div>
    </div>
  );
}
