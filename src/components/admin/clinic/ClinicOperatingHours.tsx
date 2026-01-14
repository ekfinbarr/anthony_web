import { useState, useEffect, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface OperatingHoursProps {
    value: string;
    onChange: (value: string) => void;
}

interface DaySchedule {
    day: string;
    isOpen: boolean;
    start: { hours: number; minutes: number };
    end: { hours: number; minutes: number };
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DEFAULT_START = { hours: 9, minutes: 0 };
const DEFAULT_END = { hours: 17, minutes: 0 };

export function ClinicOperatingHours({ value, onChange }: OperatingHoursProps) {
    const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
        // Initial parse
        return DAYS.map((day) => ({
            day,
            isOpen: false,
            start: DEFAULT_START,
            end: DEFAULT_END,
        }));
    });

    // Parse initial value only once or when it changes externally effectively? 
    // We should be careful not to overwrite user edits if value prop updates due to our own onChange.
    // Ideally, we keep internal state and only sync from props if drastically different, but here we'll just init.
    // For now, let's rely on internal state and just use effect to init if empty? 
    // Actually, better to parse the `value` on mount.

    useEffect(() => {
        if (!value) return;

        // Simple parser for existing formats like "Mon-Fri 9:00-17:00" or "Mon: 9:00-17:00, Tue: ..."
        // This is a "best effort" parser.
        const newSchedule = DAYS.map((day) => ({
            day,
            isOpen: false,
            start: DEFAULT_START,
            end: DEFAULT_END,
        }));

        const normalized = value.toLowerCase();

        // Check for "Mon-Fri" pattern
        if (normalized.includes("mon-fri")) {
            const timeMatch = normalized.match(/(\d{1,2}):(\d{2})[-–to\s]+(\d{1,2}):(\d{2})/);
            if (timeMatch) {
                const [_, sh, sm, eh, em] = timeMatch;
                const start = { hours: parseInt(sh), minutes: parseInt(sm) };
                const end = { hours: parseInt(eh), minutes: parseInt(em) };

                ["Mon", "Tue", "Wed", "Thu", "Fri"].forEach(d => {
                    const idx = newSchedule.findIndex(s => s.day === d);
                    if (idx !== -1) {
                        newSchedule[idx].isOpen = true;
                        newSchedule[idx].start = start;
                        newSchedule[idx].end = end;
                    }
                });
            }
        }

        // Check for individual days
        DAYS.forEach((day, idx) => {
            // Regex to find "Mon" or "Mon:" followed eventually by time
            // This is tricky. Let's look for "Mon: 09:00-17:00"
            const dayRegex = new RegExp(`${day.toLowerCase()}\\s*:?\\s*(\\d{1,2}):(\\d{2})[-–\\s]+(\\d{1,2}):(\\d{2})`, "i");
            const match = normalized.match(dayRegex);
            if (match) {
                newSchedule[idx].isOpen = true;
                newSchedule[idx].start = { hours: parseInt(match[1]), minutes: parseInt(match[2]) };
                newSchedule[idx].end = { hours: parseInt(match[3]), minutes: parseInt(match[4]) };
            }
        });

        setSchedule(prev => {
            // If we found nothing different than default closed, keeping prev (which might be user edited) is risky if we are reacting to prop change.
            // But typically form state is lifted. We'll assume if value is passed, it counts.
            // But we only want to do this if strictly differing? 
            // Let's just set it for now.
            return newSchedule;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount to avoid loops. We assume the parent holds the string but we hold the structured state.

    // Update parent when schedule changes
    useEffect(() => {
        const activeDays = schedule.filter(s => s.isOpen);
        if (activeDays.length === 0) {
            if (value) onChange("");
            return;
        }

        // Try to consolidate
        // Check if all weekdays (Mon-Fri) have same time and are open
        const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
        const weekends = ["Sat", "Sun"];

        const weekDaySchedules = schedule.filter(s => weekdays.includes(s.day));
        const weekendSchedules = schedule.filter(s => weekends.includes(s.day));

        const allWeekdaysOpen = weekDaySchedules.every(s => s.isOpen);
        const firstWk = weekDaySchedules[0];
        const sameTimeWeekdays = weekDaySchedules.every(s =>
            s.start.hours === firstWk.start.hours &&
            s.start.minutes === firstWk.start.minutes &&
            s.end.hours === firstWk.end.hours &&
            s.end.minutes === firstWk.end.minutes
        );

        const allWeekendsClosed = weekendSchedules.every(s => !s.isOpen);

        let result = "";

        if (allWeekdaysOpen && sameTimeWeekdays && allWeekendsClosed) {
            // Format: Mon-Fri 09:00-17:00
            const s = firstWk.start;
            const e = firstWk.end;
            result = `Mon-Fri ${pad(s.hours)}:${pad(s.minutes)}-${pad(e.hours)}:${pad(e.minutes)}`;
        } else {
            // List active days
            // Group by time? Too complex for now, just list.
            const parts = activeDays.map(s => {
                return `${s.day}: ${pad(s.start.hours)}:${pad(s.start.minutes)}-${pad(s.end.hours)}:${pad(s.end.minutes)}`;
            });
            result = parts.join(", ");
        }

        if (result !== value) {
            onChange(result);
        }
    }, [schedule, onChange]); // Breaking the cycle by checking result !== value inside, but we need value in dep array? parsed logic is one-off.

    const pad = (n: number) => n.toString().padStart(2, "0");

    const toggleDay = (index: number) => {
        setSchedule(prev => {
            const next = [...prev];
            next[index] = { ...next[index], isOpen: !next[index].isOpen };
            return next;
        });
    };

    const updateTime = (index: number, type: 'start' | 'end', time: { hours: number; minutes: number } | undefined) => {
        if (!time) return;
        setSchedule(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [type]: time };
            return next;
        });
    };

    const copyToAll = (sourceIndex: number) => {
        const source = schedule[sourceIndex];
        setSchedule(prev => prev.map(s => ({
            ...s,
            isOpen: true,
            start: source.start,
            end: source.end
        })));
    };

    return (
        <div className="space-y-3 border rounded-md p-4">
            <div className="text-sm font-medium mb-2">Schedule</div>
            {schedule.map((day, idx) => (
                <div key={day.day} className={cn("flex flex-col sm:flex-row sm:items-center gap-3 py-2 border-b last:border-0", !day.isOpen && "opacity-60")}>
                    <div className="flex items-center w-24 gap-2">
                        <Checkbox
                            id={`day-${idx}`}
                            checked={day.isOpen}
                            onCheckedChange={() => toggleDay(idx)}
                        />
                        <Label htmlFor={`day-${idx}`} className="cursor-pointer font-medium">{day.day}</Label>
                    </div>

                    <div className="flex items-center gap-2 flex-1">
                        <div className="flex items-center gap-2">
                            <TimePicker
                                time={day.start}
                                onTimeChange={(t) => updateTime(idx, 'start', t)}
                                disabled={!day.isOpen}
                                className="w-[110px]"
                            />
                            <span className="text-muted-foreground">-</span>
                            <TimePicker
                                time={day.end}
                                onTimeChange={(t) => updateTime(idx, 'end', t)}
                                disabled={!day.isOpen}
                                className="w-[110px]"
                            />
                        </div>

                        {day.isOpen && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 ml-auto sm:ml-2"
                                onClick={() => copyToAll(idx)}
                                title="Copy schedule to all days"
                            >
                                <Copy className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        )}
                    </div>
                </div>
            ))}
            <div className="text-xs text-muted-foreground mt-2">
                Preview: {value || "Closed"}
            </div>
        </div>
    );
}
