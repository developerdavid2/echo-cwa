import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { resetVapiDataCache } from "../../hooks/use-vapi-data";

export const VapiPluginRemoveForm = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (values: boolean) => void;
}) => {
  const removePlugin = useMutation(api.private.plugins.remove);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await removePlugin({
        service: "vapi",
      });

      resetVapiDataCache();
      setOpen(false);
      toast.success("Vapi plugin removed");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disconnect Vapi</DialogTitle>
        </DialogHeader>

        <DialogDescription>
          Are you sure you want to disconnect the Vapi plugin?
        </DialogDescription>

        <DialogFooter>
          <Button
            aria-busy={isSubmitting}
            disabled={isSubmitting}
            onClick={onSubmit}
            variant="destructive"
          >
            Disconnect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
