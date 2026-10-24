import { useState, useEffect } from "react";
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

const pad = (n: number) => n.toString().padStart(2, "0");

function parseSchedule(value: string): DaySchedule[] {
    const base = DAYS.map((day) => ({
        day,
        isOpen: false,
        start: { ...DEFAULT_START },
        end: { ...DEFAULT_END },
    }));

    if (!value) return base;

    const normalized = value.toLowerCase();

    if (normalized.includes("mon-fri")) {
        const timeMatch = normalized.match(/(\d{1,2}):(\d{2})[-–to\s]+(\d{1,2}):(\d{2})/);
        if (timeMatch) {
            const [, sh, sm, eh, em] = timeMatch;
            const start = { hours: parseInt(sh, 10), minutes: parseInt(sm, 10) };
            const end = { hours: parseInt(eh, 10), minutes: parseInt(em, 10) };

            return base.map((day) =>
                ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day.day)
                    ? { ...day, isOpen: true, start, end }
                    : day
            );
        }
    }

    return base.map((day) => {
        const dayRegex = new RegExp(
            `${day.day.toLowerCase()}\\s*:?\\s*(\\d{1,2}):(\\d{2})[-–\\s]+(\\d{1,2}):(\\d{2})`,
            "i"
        );
        const match = normalized.match(dayRegex);
        if (!match) return day;
        return {
            ...day,
            isOpen: true,
            start: { hours: parseInt(match[1], 10), minutes: parseInt(match[2], 10) },
            end: { hours: parseInt(match[3], 10), minutes: parseInt(match[4], 10) },
        };
    });
}

function formatSchedule(schedule: DaySchedule[]): string {
    const activeDays = schedule.filter((s) => s.isOpen);
    if (activeDays.length === 0) return "";

    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const weekends = ["Sat", "Sun"];
    const weekDaySchedules = schedule.filter((s) => weekdays.includes(s.day));
    const weekendSchedules = schedule.filter((s) => weekends.includes(s.day));
    const firstWk = weekDaySchedules[0];
    const allWeekdaysOpen = weekDaySchedules.every((s) => s.isOpen);
    const sameTimeWeekdays = weekDaySchedules.every(
        (s) =>
            s.start.hours === firstWk.start.hours &&
            s.start.minutes === firstWk.start.minutes &&
            s.end.hours === firstWk.end.hours &&
            s.end.minutes === firstWk.end.minutes
    );
    const allWeekendsClosed = weekendSchedules.every((s) => !s.isOpen);

    if (allWeekdaysOpen && sameTimeWeekdays && allWeekendsClosed) {
        const s = firstWk.start;
        const e = firstWk.end;
        return `Mon-Fri ${pad(s.hours)}:${pad(s.minutes)}-${pad(e.hours)}:${pad(e.minutes)}`;
    }

    return activeDays
        .map(
            (s) =>
                `${s.day}: ${pad(s.start.hours)}:${pad(s.start.minutes)}-${pad(s.end.hours)}:${pad(s.end.minutes)}`
        )
        .join(", ");
}

export function ClinicOperatingHours({ value, onChange }: OperatingHoursProps) {
    const [schedule, setSchedule] = useState<DaySchedule[]>(() => parseSchedule(value));

    useEffect(() => {
        const result = formatSchedule(schedule);
        if (result !== value) {
            onChange(result);
        }
    }, [schedule, onChange, value]);

    const toggleDay = (index: number) => {
        setSchedule((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], isOpen: !next[index].isOpen };
            return next;
        });
    };

    const updateTime = (
        index: number,
        type: "start" | "end",
        time: { hours: number; minutes: number } | undefined
    ) => {
        if (!time) return;
        setSchedule((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [type]: time };
            return next;
        });
    };

    const copyToAll = (sourceIndex: number) => {
        const source = schedule[sourceIndex];
        setSchedule((prev) =>
            prev.map((s) => ({
                ...s,
                isOpen: true,
                start: source.start,
                end: source.end,
            }))
        );
    };

    return (
        <div className="space-y-3 border rounded-md p-4">
            <div className="text-sm font-medium mb-2">Schedule</div>
            {schedule.map((day, idx) => (
                <div
                    key={day.day}
                    className={cn(
                        "flex flex-col sm:flex-row sm:items-center gap-3 py-2 border-b last:border-0",
                        !day.isOpen && "opacity-60"
                    )}
                >
                    <div className="flex items-center w-24 gap-2">
                        <Checkbox
                            id={`day-${idx}`}
                            checked={day.isOpen}
                            onCheckedChange={() => toggleDay(idx)}
                        />
                        <Label htmlFor={`day-${idx}`} className="cursor-pointer font-medium">
                            {day.day}
                        </Label>
                    </div>

                    <div className="flex items-center gap-2 flex-1">
                        <div className="flex items-center gap-2">
                            <TimePicker
                                time={day.start}
                                onTimeChange={(t) => updateTime(idx, "start", t)}
                                disabled={!day.isOpen}
                                className="w-[110px]"
                            />
                            <span className="text-muted-foreground">-</span>
                            <TimePicker
                                time={day.end}
                                onTimeChange={(t) => updateTime(idx, "end", t)}
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
            <div className="text-xs text-muted-foreground mt-2">Preview: {value || "Closed"}</div>
        </div>
    );
}
