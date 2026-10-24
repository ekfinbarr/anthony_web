import { site } from "@/config/site";
import { personSchema, type PersonInput } from "@/lib/seo/schema";
import JsonLd from "../JsonLd";

/** Person JSON-LD for a member of the parish clergy or leadership. */
const PersonSchema = ({ person }: { person: PersonInput }) => <JsonLd data={personSchema(site, person)} />;

export default PersonSchema;
