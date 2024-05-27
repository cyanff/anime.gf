import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings } from "@shared/types";
import { MutableRefObject, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { toast } from "sonner";
import { z } from "zod";

const syncSettings = async (reset: any, settingsRef: MutableRefObject<Settings | null>) => {
  const res = await window.api.setting.get();
  if (res.kind === "err") {
    console.error("Error getting settings:", res.error);
    return;
  }
  settingsRef.current = res.value;
  reset(res.value.advanced);
};

const schema = z.object({
  closeToTray: z.boolean().default(false)
});
type Schema = z.infer<typeof schema>;

export default function SettingsAdvanced() {
  const methods = useForm<Schema>({ resolver: zodResolver(schema) });
  const { handleSubmit, reset, control, setValue } = methods;
  const settingsRef = useRef<Settings | null>(null);

  useEffect(() => {
    syncSettings(reset, settingsRef);
  }, [reset]);

  const onSubmit = async (data: Schema) => {
    const newSettings = { ...settingsRef.current, advanced: data };
    const res = await window.api.setting.set(newSettings);
    if (res.kind === "err") {
      console.error("Error setting settings:", res.error);
      return;
    }
    toast.success("Settings saved");
    syncSettings(reset, settingsRef);
  };
  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-5">
      <h1 className="text-2xl font-bold tracking-wide text-tx-primary">Advanced Settings</h1>
      <Form {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center space-y-8">
          <div className="h-[6rem] w-[26rem] rounded-2xl border border-line bg-container-primary p-6 flex flex-col justify-center">
            <div className="ml-1.5 flex items-center space-x-2">
              <FormField
                control={control}
                name="closeToTray"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="ml-1.5 flex items-center space-x-2">
                        <Checkbox
                          id="closeToTray"
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            setValue("closeToTray", checked === true);
                          }}
                        />
                        <Label className="text-tx-primary" htmlFor="closeToTray">Close app to tray</Label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button className="w-fit" type="submit">
            Save
          </Button>
        </form>
      </Form>
    </div>
  );
}
