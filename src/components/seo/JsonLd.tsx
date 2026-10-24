import { serializeJsonLd } from "@/lib/seo/url";

interface JsonLdProps {
  data: Record<string, unknown>;
}

/** Renders a schema.org JSON-LD block. Data is escaped so API content cannot break out of the script tag. */
const JsonLd = ({ data }: JsonLdProps) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
);

export default JsonLd;
