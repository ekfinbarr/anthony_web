import type { ComponentType } from "react";
import bookshopInterior from "@/assets/images/bookshop/bookshop-interior.jpg";
import holyBooks from "@/assets/images/bookshop/holy-books.jpg";
import rosaries from "@/assets/images/bookshop/rosaries.jpg";
import candles from "@/assets/images/bookshop/candles.jpg";
import medals from "@/assets/images/bookshop/medals.jpg";
import giftItems from "@/assets/images/bookshop/gift-items.jpg";
import sacramentalsImg from "@/assets/images/bookshop/sacramentals.jpg";
import type { ParishIconProps } from "@/components/icons/ParishIcon";
import {
  BibleIcon,
  CandleIcon,
  FlaskIcon,
  FontIcon,
  FrameIcon,
  GiftIcon,
  LampIcon,
  MedalIcon,
  MusicIcon,
  QuillIcon,
  RosaryIcon,
  ScrollIcon,
} from "@/components/icons/ParishIcons";
import { formatAddress, site } from "@/config/site";

export const bookshopContact = {
  hours: "7am – 5pm daily, except Saturdays",
  phone: site.telephone ?? "",
  phoneHref: site.telephone ? `tel:${site.telephone.replace(/[^+\d]/g, "")}` : "",
  email: site.email,
  emailHref: `mailto:${site.email}`,
  location: formatAddress(site.address),
};

export const bookshopCopy = {
  pageDescription:
    "Sacred books, sacramentals, and faith gifts available in person at the St. Anthony, Gbaja parish bookshop.",
  eyebrow: "Visit us",
  headline: "Parish Bookshop",
  paragraphs: [
    "Our parish bookshop offers Catholic books, sacramentals, and religious items to support prayer, study, and devotion at home and in the parish.",
    "We do not sell online or manage a public inventory on this website. Visit us on the church premises during opening hours to browse what is available and speak with our bookshop attendants.",
    "Whether you need a Bible, a rosary, hymn books, candles, or a meaningful gift, we are glad to help you find what you need.",
  ],
  categoriesEyebrow: "What you’ll find",
  categoriesHeadline: "Categories we carry",
  categoriesIntro:
    "A selection of the books and religious articles commonly available at the bookshop. Stock changes with the season—visit us to see what is in today.",
  visitHeadline: "Come and browse in person",
  visitBody:
    "Our bookshop staff are happy to assist you. Call ahead if you are looking for something specific, or stop by during opening hours.",
} as const;

export type BookshopSlide = {
  src: string;
  alt: string;
};

export const bookshopSlides: BookshopSlide[] = [
  {
    src: bookshopInterior,
    alt: "Interior of a Catholic parish bookshop with shelves of books and religious items",
  },
  {
    src: holyBooks,
    alt: "Open Catholic Bible on a wooden surface",
  },
  {
    src: rosaries,
    alt: "Crystal and wood rosaries with a crucifix",
  },
  {
    src: candles,
    alt: "Blessed religious candles arranged for home devotion",
  },
  {
    src: medals,
    alt: "Catholic religious medals and saint pendants",
  },
  {
    src: giftItems,
    alt: "Framed sacred art and Catholic gift items on a shelf",
  },
  {
    src: sacramentalsImg,
    alt: "Holy oils, incense, and other Catholic sacramentals",
  },
];

export type BookshopCategory = {
  id: string;
  name: string;
  description: string;
  icon: ComponentType<ParishIconProps>;
};

export const bookshopCategories: BookshopCategory[] = [
  {
    id: "sacramentals",
    name: "Sacramentals",
    description: "Holy water, scapulars, and other blessed aids to prayer.",
    icon: FontIcon,
  },
  {
    id: "holy-books",
    name: "Holy Books",
    description: "Bibles, missals, and Scripture for study and devotion.",
    icon: BibleIcon,
  },
  {
    id: "pax-herbal",
    name: "Pax Herbal Products",
    description: "Trusted Pax herbal and wellness products when in stock.",
    icon: FlaskIcon,
  },
  {
    id: "publications",
    name: "Publications",
    description: "Parish and Catholic publications for formation and faith.",
    icon: QuillIcon,
  },
  {
    id: "rosaries",
    name: "Rosaries",
    description: "Rosaries and chaplets for personal and family prayer.",
    icon: RosaryIcon,
  },
  {
    id: "hymn-books",
    name: "Hymn Books",
    description: "Hymnals and song books for liturgy and choir.",
    icon: MusicIcon,
  },
  {
    id: "gift-items",
    name: "Gift Items",
    description: "Thoughtful religious gifts for celebrations and milestones.",
    icon: GiftIcon,
  },
  {
    id: "oils",
    name: "Oils",
    description: "Anointing and blessed oils for home and devotion.",
    icon: LampIcon,
  },
  {
    id: "candles",
    name: "Candles",
    description: "Devotional candles for prayer corners and feast days.",
    icon: CandleIcon,
  },
  {
    id: "medals",
    name: "Medals",
    description: "Saint medals and pendants as reminders of faith.",
    icon: MedalIcon,
  },
  {
    id: "incense",
    name: "Incense",
    description: "Incense and related items for prayerful worship.",
    icon: ScrollIcon,
  },
  {
    id: "frames",
    name: "Frames",
    description: "Framed sacred images and pictures for the home.",
    icon: FrameIcon,
  },
];
