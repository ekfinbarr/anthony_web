import { faqSchema, type FaqItem } from "@/lib/seo/schema";
import JsonLd from "../JsonLd";

/** FAQPage JSON-LD. Only pass questions and answers that are visible on the page. */
const FAQSchema = ({ items }: { items: FaqItem[] }) =>
  items.length > 0 ? <JsonLd data={faqSchema(items)} /> : null;

export default FAQSchema;
