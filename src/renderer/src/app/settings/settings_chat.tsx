import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Combobox from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getProvider, getProvidersNameAndValue } from "@/lib/provider/provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { config } from "@shared/config";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  provider: z.string().default("Anthropic"),
  model: z.string().default("Claude 3 Haiku"),
  maxReplyTokens: z.number().min(32).default(2048),
  maxContextTokens: z.number().min(1024).default(262144),
  temperature: z.number().min(0).max(2).default(0.7),
  topP: z.number().min(0).max(1).default(1),
  topK: z.number().min(0).default(50),
  streaming: z.boolean().default(false),
  jailbreak: z.string().default("")
});
type Schema = z.infer<typeof schema>;

export default function SettingsChat() {
  const defaultSettings = config.defaultSettings.chat;
  const methods = useForm({ resolver: zodResolver(schema) });
  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    setValue,
    formState: { errors }
  } = methods;

  const [models, setModels] = useState<string[]>([]);
  const providerNameAndValue = getProvidersNameAndValue();
  const selectedProvider = watch("provider");

  useEffect(() => {
    syncSettings();
  }, []);

  // Shows the user an error message if there are any errors in the form
  useEffect(() => {
    Object.entries(errors).forEach(([key, value]) => {
      toast.error(`Error in field ${key}: ${value!.message}`);
    });
  }, [errors]);

  // Set the form's values to be the user's settings.json
  const syncSettings = async () => {
    const res = await window.api.setting.get();
    if (res.kind === "err") {
      console.error("Error getting settings:", res.error);
      return;
    }
    const chatSettings = res.value.chat;
    reset(chatSettings);
  };

  //  Change models based on the selected provider
  useEffect(() => {
    (async () => {
      if (!selectedProvider) return;
      // Clear current model list
      setModels([]);
      // Fetch & set new model list based on the selected provider
      const res = await getProvider(selectedProvider).getModels();
      if (res.kind === "err") {
        toast.error(
          <span className="whitespace-pre-wrap">{`An error occured while fetching the model list for ${selectedProvider}.\nDid you enter an API key?`}</span>
        );
        return;
      }
      setModels(res.value);
    })();
  }, [selectedProvider]);

  const onSubmit = async (data: any) => {
    const res = await window.api.setting.set({ chat: data });
    if (res.kind === "err") {
      toast.error("Something went wrong while saving settings.");
    } else {
      toast.success("Settings saved");
    }
    syncSettings();
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-5">
      <h1 className="text-2xl text-tx-primary font-bold tracking-wide">Chat Settings</h1>
      <FormProvider {...methods}>
        <form className="flex flex-col items-center space-y-5">
          {/* Card Wrapper*/}
          <div className="h-[32rem] w-[32rem] rounded-2xl border-y border-l border-line bg-container-primary py-3">
            <div className="scroll-secondary flex h-full w-full flex-col space-y-8 overflow-auto px-8 py-6">
              {/* Provider & Model Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-tx-primary">Provider & Model</h3>
                {/* Provider & Model Contents */}
                <div className="ml-6 space-y-4">
                  <div className=" space-y-1">
                    <Label className="text-tx-primary " htmlFor="provider">
                      Provider
                    </Label>
                    <Controller
                      control={control}
                      name="provider"
                      render={({ field }) => {
                        return (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 text-tx-primary ">
                              <SelectValue placeholder={field.value} />
                            </SelectTrigger>
                            <SelectContent className="bg-input-primary rounded-xl">
                              {providerNameAndValue.map((nameAndValue, idx) => (
                                <SelectItem key={idx} value={nameAndValue.value}>
                                  {nameAndValue.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        );
                      }}
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Label className="text-tx-primary" htmlFor="model">
                      Model
                    </Label>

                    <Controller
                      control={control}
                      name="model"
                      render={({ field }) => (
                        <Combobox
                          items={models.map((model) => ({ name: model, value: model }))}
                          disabled={!selectedProvider}
                          value={field.value}
                          setValue={(value) => {
                            setValue("model", value);
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
              {/* Generation Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-tx-primary">Generation</h3>

                {/* Generation Content*/}
                <div className="ml-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-tx-primary" htmlFor="reply-max-tokens">
                      Reply max tokens
                    </Label>
                    <Input
                      {...register("maxReplyTokens", { valueAsNumber: true })}
                      type="number"
                      className="h-10 text-tx-primary"
                      placeholder={defaultSettings.maxReplyTokens.toString()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-tx-primary" htmlFor="reply-max-tokens">
                      Context max tokens
                    </Label>
                    <Input
                      {...register("maxContextTokens", { valueAsNumber: true })}
                      type="number"
                      className="h-10 text-tx-primary"
                      placeholder={defaultSettings.maxContextTokens.toString()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-tx-primary" htmlFor="temperature">
                      Temperature
                    </Label>
                    <Input
                      {...register("temperature", { valueAsNumber: true })}
                      type="number"
                      className="h-10 text-tx-primary"
                      placeholder={defaultSettings.temperature.toString()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-tx-primary" htmlFor="top-p">
                      Top P
                    </Label>
                    <Input
                      {...register("topP", { valueAsNumber: true })}
                      type="number"
                      className="h-10 text-tx-primary"
                      placeholder={defaultSettings.topP.toString()}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-tx-primary" htmlFor="top-p">
                      Top K
                    </Label>
                    <Input
                      {...register("topK", { valueAsNumber: true })}
                      type="number"
                      className="h-10 text-tx-primary"
                      placeholder={defaultSettings.topK.toString()}
                    />
                  </div>
                  <div className="ml-1.5 flex items-center space-x-2 pt-5">
                    <Controller
                      control={control}
                      name="streaming"
                      render={({ field }) => (
                        <Checkbox
                          className="rounded-[4px] border-[1px]"
                          id="message-streaming"
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            setValue("streaming", checked);
                          }}
                        />
                      )}
                    />

                    <Label className="text-tx-primary" htmlFor="message-streaming">
                      Enable Message Streaming
                    </Label>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-tx-primary">Extras</h3>
                <div className="ml-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-tx-primary" htmlFor="jailbreak">
                      Jailbreak
                    </Label>
                    <Textarea
                      {...register("jailbreak")}
                      className="scroll-secondary h-36 resize-none text-tx-primary"
                      id="jailbreak"
                      placeholder="Enter your jailbreak prompt here"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button className="" onClick={handleSubmit(onSubmit)}>
            Save
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
