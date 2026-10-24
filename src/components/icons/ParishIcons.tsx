import type { ComponentType } from "react";
import { ParishIcon, type ParishIconProps } from "./ParishIcon";
import {
  BagMark,
  BandageMark,
  BannerMark,
  BasketMark,
  BellMark,
  BibleMark,
  BricksMark,
  BusMark,
  CarMark,
  ChasubleMark,
  ChildMark,
  ClipboardMark,
  ClockMark,
  ClocheMark,
  CoinsMark,
  CommunityMark,
  CompassMark,
  ConfessionalMark,
  CounselMark,
  CradleMark,
  CrosierMark,
  CruetMark,
  DiaryMark,
  DoorMark,
  DropMark,
  EnvelopeMark,
  FlaskMark,
  FontMark,
  FrameMark,
  GarmentMark,
  GaugeMark,
  GiftMark,
  GlobeMark,
  HallMark,
  HandsMark,
  HeartMark,
  LampMark,
  LanternMark,
  LockMark,
  LungsMark,
  MedalMark,
  MonstranceMark,
  MotherMark,
  MusicMark,
  NewsMark,
  PeopleMark,
  PewMark,
  PhoneMark,
  PinMark,
  ProjectorMark,
  PulpitMark,
  QuillMark,
  QuoteMark,
  ReadingsMark,
  RestroomMark,
  RosaryMark,
  ScopeMark,
  ScrollMark,
  ShelfMark,
  ShieldMark,
  SnowflakeMark,
  SpeakerMark,
  TabletMark,
  ThermoMark,
  WifiMark,
  YouthMark,
} from "./parishContentMarks";
import {
  BookMark,
  CandleMark,
  ChaliceMark,
  ChurchMark,
  CrossMark,
  DoveMark,
  PlayMark,
  PriestMark,
} from "./parishMarks";

function makeIcon(Mark: ComponentType) {
  function Icon(props: ParishIconProps) {
    return (
      <ParishIcon {...props}>
        <Mark />
      </ParishIcon>
    );
  }
  return Icon;
}

export const ChurchFrontIcon = makeIcon(ChurchMark);
export const ChaliceIcon = makeIcon(ChaliceMark);
export const OpenBookIcon = makeIcon(BookMark);
export const PlayIcon = makeIcon(PlayMark);
export const CrossIcon = makeIcon(CrossMark);
export const CandleIcon = makeIcon(CandleMark);
export const DoveIcon = makeIcon(DoveMark);
export const PriestIcon = makeIcon(PriestMark);

export const ScrollIcon = makeIcon(ScrollMark);
export const PeopleIcon = makeIcon(PeopleMark);
export const CrosierIcon = makeIcon(CrosierMark);
export const BellIcon = makeIcon(BellMark);
export const CommunityIcon = makeIcon(CommunityMark);
export const FontIcon = makeIcon(FontMark);
export const ShelfIcon = makeIcon(ShelfMark);
export const HallIcon = makeIcon(HallMark);
export const NewsIcon = makeIcon(NewsMark);
export const PulpitIcon = makeIcon(PulpitMark);
export const BannerIcon = makeIcon(BannerMark);
export const DiaryIcon = makeIcon(DiaryMark);
export const FrameIcon = makeIcon(FrameMark);
export const EnvelopeIcon = makeIcon(EnvelopeMark);
export const DoorIcon = makeIcon(DoorMark);
export const LanternIcon = makeIcon(LanternMark);
export const HeartIcon = makeIcon(HeartMark);
export const CompassIcon = makeIcon(CompassMark);
export const PinIcon = makeIcon(PinMark);
export const PhoneIcon = makeIcon(PhoneMark);
export const ClockIcon = makeIcon(ClockMark);
export const ChildIcon = makeIcon(ChildMark);
export const CarIcon = makeIcon(CarMark);
export const BusIcon = makeIcon(BusMark);
export const ClipboardIcon = makeIcon(ClipboardMark);
export const ReadingsIcon = makeIcon(ReadingsMark);
export const HandsIcon = makeIcon(HandsMark);
export const ConfessionalIcon = makeIcon(ConfessionalMark);
export const MonstranceIcon = makeIcon(MonstranceMark);
export const LampIcon = makeIcon(LampMark);
export const YouthIcon = makeIcon(YouthMark);
export const MusicIcon = makeIcon(MusicMark);
export const BricksIcon = makeIcon(BricksMark);
export const BasketIcon = makeIcon(BasketMark);
export const GiftIcon = makeIcon(GiftMark);
export const CoinsIcon = makeIcon(CoinsMark);
export const BagIcon = makeIcon(BagMark);
export const BibleIcon = makeIcon(BibleMark);
export const QuillIcon = makeIcon(QuillMark);
export const CruetIcon = makeIcon(CruetMark);
export const ChasubleIcon = makeIcon(ChasubleMark);
export const RosaryIcon = makeIcon(RosaryMark);
export const MedalIcon = makeIcon(MedalMark);
export const CradleIcon = makeIcon(CradleMark);
export const MotherIcon = makeIcon(MotherMark);
export const FlaskIcon = makeIcon(FlaskMark);
export const TabletIcon = makeIcon(TabletMark);
export const ThermoIcon = makeIcon(ThermoMark);
export const BandageIcon = makeIcon(BandageMark);
export const ShieldIcon = makeIcon(ShieldMark);
export const CounselIcon = makeIcon(CounselMark);
export const LungsIcon = makeIcon(LungsMark);
export const ScopeIcon = makeIcon(ScopeMark);
export const GaugeIcon = makeIcon(GaugeMark);
export const DropIcon = makeIcon(DropMark);
export const QuoteIcon = makeIcon(QuoteMark);
export const WifiIcon = makeIcon(WifiMark);
export const ProjectorIcon = makeIcon(ProjectorMark);
export const SpeakerIcon = makeIcon(SpeakerMark);
export const LockIcon = makeIcon(LockMark);
export const RestroomIcon = makeIcon(RestroomMark);
export const ClocheIcon = makeIcon(ClocheMark);
export const SnowflakeIcon = makeIcon(SnowflakeMark);
export const GarmentIcon = makeIcon(GarmentMark);
export const PewIcon = makeIcon(PewMark);
export const GlobeIcon = makeIcon(GlobeMark);
