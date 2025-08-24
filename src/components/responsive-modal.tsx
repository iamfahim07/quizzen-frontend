import { useMedia } from "react-use";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

import { cn } from "@/lib/utils";

interface ResponsiveModalProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  isDrawerDismissible?: boolean;
  className?: string;
}

export const ResponsiveModal = ({
  children,
  open,
  onOpenChange,
  isDrawerDismissible = true,
  className,
}: ResponsiveModalProps) => {
  const isDesktop = useMedia("(min-width: 1024px)", true);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            "w-full sm:max-w-4/5 p-0 border-none overflow-y-auto hide-scrollbar h-[90vh]",
            className
          )}
        >
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer
      dismissible={isDrawerDismissible}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[95vh]">
        {children}
      </DrawerContent>
    </Drawer>
  );
};
