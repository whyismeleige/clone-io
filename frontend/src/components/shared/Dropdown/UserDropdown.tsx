import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { logoutUser } from "@/store/slices/auth.slice";
import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import { Bell, CreditCard, LogOut, Settings, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { RefAttributes, useState } from "react";
import SettingsDialog from "../Dialogs/SettingsDialog";

export default function UserDropdown(
  props: DropdownMenuContentProps & RefAttributes<HTMLDivElement>
) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await dispatch(logoutUser());

      router.replace("/");
    } catch (error) {
      console.error("Error in Logging Out", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <DropdownMenuContent {...props}>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user?.name}</span>
            <span className="text-muted-foreground truncate text-xs">
              {user?.email}
            </span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem className="cursor-pointer">
          <UserCircle />
          My Projects
        </DropdownMenuItem>
        <SettingsDialog>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
            <Settings />
            Account Settings
          </DropdownMenuItem>
        </SettingsDialog>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
        {loading ? (
          <Spinner />
        ) : (
          <>
            <LogOut />
            Log out
          </>
        )}
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
