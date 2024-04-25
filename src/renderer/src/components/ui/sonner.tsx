import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-container-tertiary group-[.toaster]:text-tx-primary group-[.toaster]:border-line group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-tx-secondary",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-tx-primary",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-tx-secondary"
        }
      }}
      {...props}
    />
  );
};

export { Toaster };
