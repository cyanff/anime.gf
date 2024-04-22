import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { config } from "@shared/config";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { getProvider, getProvidersNameAndValue } from "@/lib/provider/provider";
import Combobox from "@/components/ui/combobox";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/solid";

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

  // Shows the user an error message if there are any errors in the form
  useEffect(() => {
    Object.entries(errors).forEach(([key, value]) => {
      toast.error(`Error in field ${key}: ${value!.message}`);
    });
  }, [errors]);

  const providerNameAndValue = getProvidersNameAndValue();
  const [models, setModels] = useState<string[]>([]);
  const selectedProvider = watch("provider");

  // Set form's values to the user's current settings on load
  useEffect(() => {
    syncSettings();
  }, []);

  /* Set the form's values to be the user's settings.json */
  const syncSettings = async () => {
    const res = await window.api.setting.get();
    if (res.kind === "err") {
      console.error("Error getting settings:", res.error);
      return;
    }

    const chatSettings = res.value.chat;
    reset(chatSettings);
  };

  //  Change the models based on the selected provider
  useEffect(() => {
    (async () => {
      if (!selectedProvider) return;
      const models = await getProvider(selectedProvider).getModels();
      setModels(models);
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
      <h1 className="text-2xl font-bold tracking-wide">Chat Settings</h1>
      <FormProvider {...methods}>
        <form>
          {/* Card Wrapper*/}
          <div className=" h-[37rem] w-[32rem] rounded-2xl border border-neutral-700 bg-neutral-800 py-2.5">
            <div className="scroll-secondary flex h-full w-full flex-col space-y-8 overflow-y-auto px-8 py-6">
              {/* Provider & Model Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Provider & Model</h3>
                {/* Provider & Model Contents */}
                <div className="ml-6 space-y-4">
                  <div className=" space-y-1">
                    <Label className="text-white" htmlFor="provider">
                      Provider
                    </Label>
                    <Controller
                      control={control}
                      name="provider"
                      render={({ field }) => {
                        return (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 bg-neutral-700 text-white">
                              <SelectValue placeholder={field.value} />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-700">
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
                    <Label className="text-white" htmlFor="model">
                      Model
                    </Label>

                    <Controller
                      control={control}
                      name="model"
                      render={({ field }) => (
                        <Combobox
                          items={models.map((model) => ({ name: model, value: model }))}
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
                <h3 className="text-lg font-semibold text-white">Generation</h3>

                {/* Generation Content*/}
                <div className="ml-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white" htmlFor="reply-max-tokens">
                      Reply max tokens
                    </Label>
                    <Input
                      {...register("maxReplyTokens", { valueAsNumber: true })}
                      type="number"
                      className="h-10 bg-neutral-700 text-white"
                      placeholder={defaultSettings.maxReplyTokens.toString()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white" htmlFor="reply-max-tokens">
                      Context max tokens
                    </Label>
                    <Input
                      {...register("maxContextTokens", { valueAsNumber: true })}
                      type="number"
                      className="h-10 bg-neutral-700 text-white"
                      placeholder={defaultSettings.maxContextTokens.toString()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white" htmlFor="temperature">
                      Temperature
                    </Label>
                    <Input
                      {...register("temperature", { valueAsNumber: true })}
                      type="number"
                      className="h-10 bg-neutral-700 text-white"
                      placeholder={defaultSettings.temperature.toString()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white" htmlFor="top-p">
                      Top P
                    </Label>
                    <Input
                      {...register("topP", { valueAsNumber: true })}
                      type="number"
                      className="h-10 bg-neutral-700 text-white"
                      placeholder={defaultSettings.topP.toString()}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white" htmlFor="top-p">
                      Top K
                    </Label>
                    <Input
                      {...register("topK", { valueAsNumber: true })}
                      type="number"
                      className="h-10 bg-neutral-700 text-white"
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

                    <Label className="text-white" htmlFor="message-streaming">
                      Enable Message Streaming
                    </Label>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Extras</h3>
                <div className="ml-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white" htmlFor="jailbreak">
                      Jailbreak
                    </Label>
                    <Textarea
                      {...register("jailbreak")}
                      className="scroll-tertiary h-36 resize-none bg-neutral-700 text-white"
                      id="jailbreak"
                      placeholder="Enter your jailbreak prompt here"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <button
          className="flex items-center space-x-2 rounded-md border border-neutral-600 bg-neutral-700 px-4 py-2 font-medium text-neutral-200"
          onClick={handleSubmit(onSubmit)}
        >
          Save
        </button>
      </FormProvider>
    </div>
  );
}
