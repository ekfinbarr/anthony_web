import PageHeader from "@/components/layout/PageHeader";
import BookshopIntro from "@/components/bookshop/BookshopIntro";
import BookshopHoursBar from "@/components/bookshop/BookshopHoursBar";
import BookshopCategories from "@/components/bookshop/BookshopCategories";
import BookshopVisitCta from "@/components/bookshop/BookshopVisitCta";
import { ShelfIcon } from "@/components/icons/ParishIcons";
import { bookshopCopy } from "@/data/bookshopContent";

/**
 * Public parish bookshop page — informational only.
 * Inventory, prices, and online orders are not managed on the website.
 */
export default function BookshopPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        tone="light"
        title="Parish Bookshop"
        description={bookshopCopy.pageDescription}
        icon={<ShelfIcon size="md" />}
      />
      <BookshopIntro />
      <BookshopHoursBar />
      <BookshopCategories />
      <BookshopVisitCta />
    </div>
  );
}
