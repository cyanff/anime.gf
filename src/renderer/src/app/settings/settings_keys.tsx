import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProvidersNameAndValue } from "@/lib/provider/provider";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SettingsKeys() {
  const [provider, setProvider] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [isApiKeyVisible, setIsApiKeyVisible] = useState<boolean>(false);

  const providerNameAndValue = getProvidersNameAndValue();

  useEffect(() => {
    (async () => {
      if (!provider || provider === "") return;
      const key = await window.api.secret.get(provider);

      if (key.kind === "err") {
        console.error("Error getting key", key.error);
        return;
      }
      setApiKey(key.value);
    })();
  }, [provider]);

  const handleSubmit = async () => {
    if (!provider || provider === "") {
      toast.error("Please select a provider");
      return;
    }

    if (!apiKey || apiKey === "") {
      toast.error("Please enter an API key");
      return;
    }

    const result = await window.api.secret.set(provider, apiKey);

    if (result.kind === "err") {
      console.error("Error setting key", result.error);
      toast.error("Error setting key");
      return;
    }

    toast.success("Key saved successfully");
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-5">
      <h1 className="text-2xl font-bold tracking-wide">Key Settings</h1>
      <div className="flex h-[15rem] w-[26rem] flex-col space-y-8 rounded-2xl border border-neutral-700 bg-neutral-800 p-6">
        <div className="space-y-1 pr-8">
          <Label className="text-white">Provider</Label>
          <Select onValueChange={(v) => setProvider(v)} value={provider}>
            <SelectTrigger className="h-12 bg-neutral-700 text-white">
              <SelectValue placeholder={provider} />
            </SelectTrigger>
            <SelectContent className="bg-neutral-700">
              {providerNameAndValue.map((nameAndValue) => (
                <SelectItem value={nameAndValue.value}>{nameAndValue.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-white">API Key</Label>
          <div className="flex items-center space-x-4">
            <Input
              type={isApiKeyVisible ? "text" : "password"}
              className="h-12 grow bg-neutral-700 text-white"
              onChange={(e) => setApiKey(e.target.value)}
              value={apiKey}
              placeholder="Enter your API key here..."
            />
            <button className="size-4" onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}>
              {isApiKeyVisible ? (
                <EyeClosedIcon className="size-4 text-white hover:scale-110" />
              ) : (
                <EyeOpenIcon className="size-4 text-white hover:scale-110" />
              )}
            </button>
          </div>
        </div>
      </div>

      <button
        className="flex items-center space-x-2 rounded-md border border-neutral-600 bg-neutral-700 px-4 py-2 font-medium text-neutral-200"
        onClick={handleSubmit}
      >
        Save
      </button>
    </div>
  );
}
