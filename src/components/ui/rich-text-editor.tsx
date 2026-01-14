import { useEffect, useRef } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import "./rich-text-editor.css";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content here...",
  disabled = false,
  className,
  minHeight = "400px",
}: RichTextEditorProps) {
  const { quill, quillRef } = useQuill({
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
        [{ script: "sub" }, { script: "super" }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["link", "image", "video"],
        ["clean"],
      ],
    },
    formats: [
      "header",
      "font",
      "size",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "list",
      "bullet",
      "indent",
      "script",
      "color",
      "background",
      "align",
      "link",
      "image",
      "video",
    ],
    placeholder,
    theme: "snow",
    readOnly: disabled,
  });

  const isUpdatingRef = useRef(false);

  // Update editor content when value prop changes (from external source)
  useEffect(() => {
    if (quill && !isUpdatingRef.current) {
      const currentContent = quill.root.innerHTML;
      // Only update if the value is different and not just whitespace/empty tags
      const normalizedValue = (value || "").trim();
      const normalizedCurrent = currentContent.trim();
      
      if (normalizedValue !== normalizedCurrent) {
        isUpdatingRef.current = true;
        quill.clipboard.dangerouslyPasteHTML(value || "");
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 0);
      }
    }
  }, [quill, value]);

  // Handle content changes from editor
  useEffect(() => {
    if (quill) {
      const handleChange = () => {
        if (!isUpdatingRef.current) {
          const html = quill.root.innerHTML;
          onChange(html);
        }
      };

      quill.on("text-change", handleChange);

      return () => {
        quill.off("text-change", handleChange);
      };
    }
  }, [quill, onChange]);

  return (
    <div 
      className={cn("rich-text-editor-wrapper", className)}
      style={{ "--editor-min-height": minHeight } as React.CSSProperties}
    >
      <div
        ref={quillRef}
        className={cn(
          "rounded-md border border-input bg-background",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
    </div>
  );
}

