/**
 * MultiSelect (Searchable)
 *
 * A reusable, searchable multi-select input that matches the app's shadcn-style UI:
 * - Uses `Popover` for the dropdown and `Command` for fast search/filtering.
 * - Shows selected values as removable badges.
 * - Supports disabled state, placeholder, clear, and select-all behaviors.
 *
 * Integration:
 * - Provide `options` and controlled `value` (array of option values).
 * - Listen to `onValueChange(nextValues)` and store it in your form state.
 *
 * @example
 * <MultiSelect
 *   label="Categories"
 *   options={[{ value: "uuid-1", label: "Announcements" }]}
 *   value={categoryIds}
 *   onValueChange={setCategoryIds}
 *   placeholder="Select categories..."
 * />
 *
 * @package Lovable/src/components/ui
 */

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * Option shape for the MultiSelect.
 * - `value` should be stable (id/uuid/slug).
 * - `label` is displayed to the user.
 */
export interface MultiSelectOption {
  value: string;
  label: string;
  /** Optional helper text displayed under the label (useful for slugs, descriptions, etc.). */
  description?: string;
  /** Optional group label to visually group options (e.g. "Top level", "Child categories"). */
  group?: string;
}

export interface MultiSelectProps {
  /** Optional top label rendered above the control. */
  label?: string;

  /** Options available to select from. */
  options: MultiSelectOption[];

  /** Controlled selected values. */
  value: string[];

  /** Called whenever selection changes. */
  onValueChange: (next: string[]) => void;

  /** Placeholder text shown when no value is selected. */
  placeholder?: string;

  /** Search placeholder inside the dropdown. */
  searchPlaceholder?: string;

  /** Disable interaction. */
  disabled?: boolean;

  /** Maximum number of selected badges shown before collapsing into "+N more". */
  maxDisplayCount?: number;

  /** Popover width override (defaults to trigger width). */
  popoverClassName?: string;

  /** Extra classes for the trigger button. */
  className?: string;
}

/**
 * Utility: unique values while preserving order.
 */
function unique(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  values.forEach((v) => {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  });
  return out;
}

export function MultiSelect({
  label,
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  disabled = false,
  maxDisplayCount = 3,
  popoverClassName,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  // Fast lookups for rendering selected labels.
  const optionByValue = React.useMemo(() => {
    const map = new Map<string, MultiSelectOption>();
    options.forEach((o) => map.set(o.value, o));
    return map;
  }, [options]);

  const selectedOptions = React.useMemo(
    () => value.map((v) => optionByValue.get(v)).filter(Boolean) as MultiSelectOption[],
    [value, optionByValue]
  );

  // Group options (optional).
  const grouped = React.useMemo(() => {
    const groups = new Map<string, MultiSelectOption[]>();
    const ungroupped: MultiSelectOption[] = [];
    options.forEach((o) => {
      if (o.group) {
        const list = groups.get(o.group) ?? [];
        list.push(o);
        groups.set(o.group, list);
      } else {
        ungroupped.push(o);
      }
    });
    return { groups, ungroupped };
  }, [options]);

  const toggleValue = (v: string) => {
    const isSelected = value.includes(v);
    if (isSelected) {
      onValueChange(value.filter((x) => x !== v));
    } else {
      onValueChange(unique([...value, v]));
    }
  };

  const clearAll = () => onValueChange([]);

  const selectAll = () => {
    const all = options.map((o) => o.value);
    onValueChange(unique(all));
  };

  return (
    <div className="space-y-2">
      {/* Optional label */}
      {label ? <div className="text-sm font-medium">{label}</div> : null}

      <Popover open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between h-auto min-h-10 px-3 py-2",
              "bg-background hover:bg-muted/30",
              className
            )}
          >
            {/* Selected badges OR placeholder */}
            <div className="flex flex-wrap items-center gap-1 text-left">
              {selectedOptions.length === 0 ? (
                <span className="text-muted-foreground text-sm">{placeholder}</span>
              ) : (
                <>
                  {selectedOptions.slice(0, maxDisplayCount).map((o) => (
                    <Badge
                      key={o.value}
                      variant="secondary"
                      className="gap-1 pr-1"
                      onClick={(e) => {
                        // Prevent popover toggle when removing a badge.
                        e.stopPropagation();
                      }}
                    >
                      <span className="truncate max-w-[160px]">{o.label}</span>
                      <button
                        type="button"
                        className="inline-flex rounded-sm hover:bg-muted px-1"
                        onClick={() => toggleValue(o.value)}
                        aria-label={`Remove ${o.label}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedOptions.length > maxDisplayCount ? (
                    <Badge variant="outline" className="text-xs">
                      +{selectedOptions.length - maxDisplayCount} more
                    </Badge>
                  ) : null}
                </>
              )}
            </div>

            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className={cn("w-[--radix-popover-trigger-width] p-0", popoverClassName)} align="start">
          <Command>
            {/* Search input */}
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>

              {/* Quick actions */}
              <CommandGroup>
                <CommandItem
                  onSelect={() => selectAll()}
                  className="justify-between"
                >
                  <span className="text-sm">Select all</span>
                  <span className="text-xs text-muted-foreground">{options.length}</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => clearAll()}
                  className="justify-between"
                  disabled={value.length === 0}
                >
                  <span className="text-sm">Clear</span>
                  <span className="text-xs text-muted-foreground">{value.length}</span>
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              {/* Ungrouped options */}
              {grouped.ungroupped.length > 0 ? (
                <CommandGroup heading={grouped.groups.size > 0 ? "Options" : undefined}>
                  {grouped.ungroupped.map((o) => {
                    const checked = value.includes(o.value);
                    return (
                      <CommandItem
                        key={o.value}
                        onSelect={() => toggleValue(o.value)}
                        className="flex items-start gap-2"
                      >
                        {/* Checkbox provides clear multi-select affordance */}
                        <Checkbox checked={checked} aria-label={checked ? "Selected" : "Not selected"} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{o.label}</span>
                            {/* small check icon to reinforce selection */}
                            {checked ? <Check className="h-3.5 w-3.5 text-primary" /> : null}
                          </div>
                          {o.description ? (
                            <div className="text-xs text-muted-foreground truncate">{o.description}</div>
                          ) : null}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ) : null}

              {/* Grouped options */}
              {[...grouped.groups.entries()].map(([group, opts]) => (
                <CommandGroup key={group} heading={group}>
                  {opts.map((o) => {
                    const checked = value.includes(o.value);
                    return (
                      <CommandItem
                        key={o.value}
                        onSelect={() => toggleValue(o.value)}
                        className="flex items-start gap-2"
                      >
                        <Checkbox checked={checked} aria-label={checked ? "Selected" : "Not selected"} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{o.label}</span>
                            {checked ? <Check className="h-3.5 w-3.5 text-primary" /> : null}
                          </div>
                          {o.description ? (
                            <div className="text-xs text-muted-foreground truncate">{o.description}</div>
                          ) : null}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}


