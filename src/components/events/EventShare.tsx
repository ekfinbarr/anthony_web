import NewsShare from "@/components/news/NewsShare";

type EventShareProps = {
  title: string;
  url: string;
  className?: string;
};

const EventShare = ({ title, url, className }: EventShareProps) => (
  <NewsShare title={title} url={url} className={className} />
);

export default EventShare;
