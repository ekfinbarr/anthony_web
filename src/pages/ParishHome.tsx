import Hero from "@/components/parish-home/Hero";
import MissionStatement from "@/components/parish-home/MissionStatement";
import MassLivestreamBanner from "@/components/home/MassLivestreamBanner";
import HistoryMission from "@/components/parish-home/HistoryMission";
import EventsPreview from "@/components/parish-home/EventsPreview";
import GroupsPreview from "@/components/parish-home/GroupsPreview";
import MinistriesPreview from "@/components/parish-home/MinistriesPreview";
import LeadershipPreview from "@/components/parish-home/LeadershipPreview";
import NewsPreview from "@/components/parish-home/NewsPreview";
import GalleryPreview from "@/components/parish-home/GalleryPreview";
import Voices from "@/components/parish-home/Voices";
import VisitStrip from "@/components/parish-home/VisitStrip";
import FloatingSocial from "@/components/parish-home/FloatingSocial";
import MassScheduleBand from "@/components/home/MassScheduleBand";
import SocialPlatforms from "@/components/home/SocialPlatforms";
import { FeatureShow } from "@/components/features/FeatureGate";

const ParishHome = () => {
  return (
    <div className="parish-home bg-background">
      <Hero />
      <MissionStatement />
      <MassScheduleBand />
      <FloatingSocial />
      <HistoryMission />
      <FeatureShow feature="livestream"><MassLivestreamBanner /></FeatureShow>
      <FeatureShow feature="events"><EventsPreview /></FeatureShow>
      <FeatureShow feature="service_groups"><GroupsPreview /></FeatureShow>
      <FeatureShow feature="serve_others"><MinistriesPreview /></FeatureShow>
      <FeatureShow feature="parish_priest"><LeadershipPreview /></FeatureShow>
      <FeatureShow feature="news"><NewsPreview /></FeatureShow>
      <FeatureShow feature="galleries"><GalleryPreview /></FeatureShow>
      <FeatureShow feature="parish_priest"><Voices /></FeatureShow>
      <SocialPlatforms />
      <VisitStrip />
    </div>
  );
};

export default ParishHome;
