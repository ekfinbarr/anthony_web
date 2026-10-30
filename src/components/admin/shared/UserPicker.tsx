/**
 * Searchable picker for a registered user (parishioner), searching on the server.
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import userService, { type User } from "@/services/user.service";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

interface UserPickerProps {
  value: User | null;
  onChange: (user: User | null) => void;
  placeholder?: string;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export function UserPicker({ value, onChange, placeholder = "Search by name, email or phone", id, ...aria }: UserPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const search = useDebouncedValue(query, 300);

  const results = useQuery({
    queryKey: ["user-picker", search],
    queryFn: () => userService.list({ search: search || undefined, per_page: 20 }),
    enabled: open,
    placeholderData: (prev) => prev,
  });
  const users = results.data?.data ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-auto min-h-11 w-full justify-between px-3 py-2 font-normal"
          {...aria}
        >
          {value ? (
            <span className="flex min-w-0 items-center gap-3 text-left">
              <Avatar className="h-8 w-8">
                {value.avatar ? <AvatarImage src={value.avatar} alt="" /> : null}
                <AvatarFallback className="bg-church-gold-soft/40 text-xs">{initials(value.name)}</AvatarFallback>
              </Avatar>
              <span className="min-w-0">
                <span className="block truncate font-medium">{value.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{[value.email, value.phone].filter(Boolean).join(" · ")}</span>
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" aria-hidden /> {placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[280px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput value={query} onValueChange={setQuery} placeholder="Type a name, email or phone…" />
          <CommandList>
            {results.isFetching && users.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Searching…
              </div>
            ) : (
              <CommandEmpty>No one matches “{query}”.</CommandEmpty>
            )}
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.id}
                  onSelect={() => {
                    onChange(user);
                    setOpen(false);
                  }}
                  className="gap-3"
                >
                  <Avatar className="h-7 w-7">
                    {user.avatar ? <AvatarImage src={user.avatar} alt="" /> : null}
                    <AvatarFallback className="text-[10px]">{initials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{user.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{[user.email, user.phone].filter(Boolean).join(" · ")}</span>
                  </span>
                  <Check className={cn("h-4 w-4", value?.id === user.id ? "opacity-100" : "opacity-0")} aria-hidden />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
