import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProvidersNameAndValue } from "@/lib/provider/provider";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
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
      <h1 className="text-2xl font-bold tracking-wide text-tx-primary">Keys Settings</h1>
      <div className="flex h-[15rem] w-[26rem] flex-col space-y-8 rounded-2xl border border-line bg-container-primary p-6">
        <div className="space-y-1 pr-8">
          <Label className="text-tx-primary">Provider</Label>
          <Select onValueChange={(v) => setProvider(v)} value={provider}>
            <SelectTrigger className="h-12 text-tx-primary">
              <SelectValue placeholder={provider === "" ? "Select a provider" : provider} />
            </SelectTrigger>
            <SelectContent className="">
              {providerNameAndValue.map((nameAndValue, idx) => (
                <SelectItem key={idx} value={nameAndValue.value}>
                  {nameAndValue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-tx-primary">API Key</Label>
          <div className="flex items-center space-x-4">
            <Input
              type={isApiKeyVisible ? "text" : "password"}
              className="h-12 grow font-mono font-[550] text-tx-primary"
              onChange={(e) => setApiKey(e.target.value)}
              value={apiKey}
              placeholder="Enter your API key here..."
            />
            <button className="size-4 focus:outline-none" onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}>
              {isApiKeyVisible ? (
                <EyeSlashIcon className="size-5 text-tx-secondary hover:scale-110" />
              ) : (
                <EyeIcon className="size-5 text-tx-secondary hover:scale-110" />
              )}
            </button>
          </div>
        </div>
      </div>

      <Button onClick={handleSubmit}>Save</Button>
    </div>
  );
}
