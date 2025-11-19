import { IPErrorMessage } from "@/constant";
import { Dialog, DialogContent } from "../ui/dialog";
import { CircleAlertIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export const IPErrorDialog = ({ isOpen, setIsOpen }: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <div className="flex flex-col items-center gap-2 justify-center">
          <CircleAlertIcon className="text-rose-400 size-20" />
          <h3 className="text-neutral-700 font-semibold text-xl text-center">
            {IPErrorMessage}
          </h3>
        </div>
      </DialogContent>
    </Dialog>
  );
};
