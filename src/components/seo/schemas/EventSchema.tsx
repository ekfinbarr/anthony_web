import { site } from "@/config/site";
import { eventSchema, type EventInput } from "@/lib/seo/schema";
import JsonLd from "../JsonLd";

/** Event JSON-LD for a real, published event (never for sample data). */
const EventSchema = ({ event }: { event: EventInput }) => <JsonLd data={eventSchema(site, event)} />;

export default EventSchema;
