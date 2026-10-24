import { FileText, FileType, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLabel, type BulletinFormat } from "@/services/bulletin.service";

type BulletinFormatBadgeProps = {
  format?: BulletinFormat;
  className?: string;
};

const BulletinFormatBadge = ({ format, className }: BulletinFormatBadgeProps) => {
  const label = formatLabel(format);
  const Icon =
    format === "image" || format === "images"
      ? ImageIcon
      : format === "doc" || format === "docx"
        ? FileType
        : FileText;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded bg-church-gold/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-church-gold-warm",
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};

export default BulletinFormatBadge;
