import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SermonSortValue =
  | "preached_date:desc"
  | "preached_date:asc"
  | "view_count:desc"
  | "title:asc"
  | "title:desc";

export type MediaFilterValue = "all" | "video" | "audio" | "notes";

export type SermonsToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  series: string;
  onSeriesChange: (value: string) => void;
  speaker: string;
  onSpeakerChange: (value: string) => void;
  sort: SermonSortValue;
  onSortChange: (value: SermonSortValue) => void;
  mediaFilter: MediaFilterValue;
  onMediaFilterChange: (value: MediaFilterValue) => void;
  seriesOptions: string[];
  speakerOptions: string[];
  className?: string;
};

const SermonsToolbar = ({
  search,
  onSearchChange,
  series,
  onSeriesChange,
  speaker,
  onSpeakerChange,
  sort,
  onSortChange,
  mediaFilter,
  onMediaFilterChange,
  seriesOptions,
  speakerOptions,
  className,
}: SermonsToolbarProps) => {
  return (
    <div
      className={cn(
        "grid gap-3 rounded-xl border border-border/60 bg-church-pearl/80 p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-12",
        className,
      )}
    >
      <div className="relative lg:col-span-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search sermons, speakers, scripture…"
          className="pl-9 bg-background"
          aria-label="Search sermons"
        />
      </div>

      <div className="lg:col-span-2">
        <Select value={series} onValueChange={onSeriesChange}>
          <SelectTrigger aria-label="Filter by series" className="bg-background">
            <SelectValue placeholder="All series" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All series</SelectItem>
            {seriesOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="lg:col-span-2">
        <Select value={speaker} onValueChange={onSpeakerChange}>
          <SelectTrigger aria-label="Filter by speaker" className="bg-background">
            <SelectValue placeholder="All speakers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All speakers</SelectItem>
            {speakerOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="lg:col-span-2">
        <Select value={mediaFilter} onValueChange={(v) => onMediaFilterChange(v as MediaFilterValue)}>
          <SelectTrigger aria-label="Filter by media type" className="bg-background">
            <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Media" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All media</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="notes">Notes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="lg:col-span-2">
        <Select value={sort} onValueChange={(v) => onSortChange(v as SermonSortValue)}>
          <SelectTrigger aria-label="Sort sermons" className="bg-background">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="preached_date:desc">Newest first</SelectItem>
            <SelectItem value="preached_date:asc">Oldest first</SelectItem>
            <SelectItem value="view_count:desc">Most viewed</SelectItem>
            <SelectItem value="title:asc">Title A–Z</SelectItem>
            <SelectItem value="title:desc">Title Z–A</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SermonsToolbar;
