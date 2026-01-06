import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChatContext } from "@/context/chat.context";
import { Pen } from "lucide-react";
import { ReactNode, useState } from "react";

export default function RenameProjectDialog({
  projectName,
  chatId,
  children,
}: {
  projectName: string;
  chatId: string;
  children?: ReactNode;
}) {
  const { changeChatDetails } = useChatContext();

  const [input, setInput] = useState(projectName);

  const submitChanges = async () => {
    if (input) {
      await changeChatDetails({ projectName: input }, chatId);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="cursor-pointer"
          >
            <Pen />
            Rename
          </DropdownMenuItem>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Project Title</DialogTitle>
          <DialogDescription>
            Make changes to your Project Title here. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Label htmlFor="title">Project Title</Label>
          <Input
            id="title"
            name="title"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button className="cursor-pointer" onClick={submitChanges}>
              Save Changes
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
