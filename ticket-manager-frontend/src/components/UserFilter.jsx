import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

export function UserFilter({ userFilter, setUserFilter, userList }) {
  const [open, setOpen] = useState(false);

  const selectedUserName =
    userFilter === "all"
      ? "All Users"
      : userList.find((u) => u.id.toString() === userFilter)?.username ||
        userList.find((u) => u.id.toString() === userFilter)?.email ||
        "Unknown";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between"
        >
          {selectedUserName}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Search user..." />
          <CommandEmpty>No users found.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              key="all"
              onSelect={() => {
                setUserFilter("all");
                setOpen(false);
              }}
            >
              All Users
              {userFilter === "all" && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </CommandItem>
            {userList.map((u) => (
              <CommandItem
                key={u.id}
                onSelect={() => {
                  setUserFilter(u.id.toString());
                  setOpen(false);
                }}
              >
                {u.username || u.email}
                {userFilter === u.id.toString() && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
