import { site } from "@/config/site";
import { articleSchema, type ArticleInput } from "@/lib/seo/schema";
import JsonLd from "../JsonLd";

/** NewsArticle JSON-LD for a published parish news post. */
const ArticleSchema = ({ article }: { article: ArticleInput }) => <JsonLd data={articleSchema(site, article)} />;

export default ArticleSchema;
