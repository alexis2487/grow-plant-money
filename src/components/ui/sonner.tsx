import { Toaster as Sonner } from "sonner";
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-center"
      offset="max(calc(env(safe-area-inset-top, 0px) + 1.25rem), 3.25rem)"
      mobileOffset={{
        top: "max(calc(env(safe-area-inset-top, 0px) + 1.25rem), 3.25rem)",
        left: "1rem",
        right: "1rem",
      }}
      gap={8}
      visibleToasts={3}
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
        info: <Info className="h-5 w-5 text-sky-500 shrink-0" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
        error: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card/95 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border/80 group-[.toaster]:shadow-xl group-[.toaster]:rounded-2xl group-[.toaster]:py-3.5 group-[.toaster]:px-4 group-[.toaster]:gap-3 group-[.toaster]:font-medium group-[.toaster]:text-xs sm:group-[.toaster]:text-sm",
          title: "font-semibold text-xs sm:text-sm text-foreground",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs font-normal mt-0.5",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl group-[.toast]:text-xs font-semibold px-3 py-1.5",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl group-[.toast]:text-xs px-3 py-1.5",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
