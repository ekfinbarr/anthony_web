import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";
import Layout from "./components/layout/Layout";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import ComingSoon from "./pages/ComingSoon";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Sermons from "./pages/Sermons";
import Events from "./pages/Events";
import Ministries from "./pages/Ministries";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Live from "./pages/Live";
import Visit from "./pages/Visit";
import Facilities from "./pages/Facilities";
import Charity from "./pages/Charity";
import Bulletin from "./pages/Bulletin";
// import Gallery from "./pages/Gallery";
import News from "./pages/News";
import NewsView from "./pages/NewsView";
import Dashboard from "./pages/Dashboard";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProfileSettings from "./pages/ProfileSettings";
import NotificationSettings from "./pages/NotificationSettings";
// import Settings from "./pages/Settings";
import EmailWaitlistAdmin from "./pages/EmailWaitlistAdmin";
import ParishAnthemPage from "./pages/ParishAnthemPage";
import PastParishPriestsPage from "./pages/PastParishPriestsPage";
import MassBookingPage from "./pages/MassBookingPage";
import GuestMassBookingPage from "./pages/GuestMassBookingPage";
import MassBookingHistory from "./pages/MassBookingHistory";
import BookshopPage from "./pages/BookshopPage";
import MarriageBansPage from "./pages/MarriageBansPage";
import MarriageClassRegistrationPage from "./pages/MarriageClassRegistrationPage";
import ClinicPage from "./pages/ClinicPage";
import FaqPage from "./pages/FaqPage";
import Chatbot from "./components/chat/Chatbot";
import Bookshop from "./pages/Bookshop";
import Clinic from "./pages/Clinic";
import PastPriests from "./pages/PastPriests";
import MassBooking from "./pages/MassBooking";
import BookingHistory from "./pages/BookingHistory";
import Donations from "./pages/Donations";
import Registration from "./pages/Registration";
import Groups from "./pages/Groups";
import Gallery from "./pages/Gallery";
import GalleryAlbumPage from "./pages/GalleryAlbumPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import WeeklyBulletin from "./pages/WeeklyBulletin";
import Sacraments from "./pages/Sacraments";
import Rentals from "./pages/Rentals";
import CalendarPage from "./pages/CalendarPage";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
// Dashboard Pages
import DashboardHome from "./pages/dashboard/DashboardHome";
import Profile from "./pages/dashboard/Profile";
import Settings from "./pages/dashboard/Settings";
import ParishCard from "./pages/dashboard/ParishCard";
import Notifications from "./pages/dashboard/Notifications";
import SacramentsPage from "./pages/dashboard/SacramentsPage";
import PrayerRequestsPage from "./pages/dashboard/PrayerRequestsPage";
import AnnouncementsPage from "./pages/dashboard/AnnouncementsPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminNews from "./pages/admin/AdminNews";
import AdminPosts from "./pages/admin/AdminPosts";
import PostFormPage from "./pages/admin/PostFormPage";
import AdminEvents from "./pages/admin/AdminEvents";
import EventFormPage from "./pages/admin/EventFormPage";
import SacramentFormPage from "./pages/admin/SacramentFormPage";
import ScheduleFormPage from "./pages/admin/ScheduleFormPage";
import LivestreamFormPage from "./pages/admin/LivestreamFormPage";
import GroupFormPage from "./pages/admin/GroupFormPage";
import AdminGalleryPage from "./pages/admin/AdminGalleryPage";
import AdminGalleryAlbumItemsPage from "./pages/admin/AdminGalleryAlbumItemsPage";
import AdminLeadership from "./pages/admin/AdminLeadership";
import AdminSacraments from "./pages/admin/AdminSacraments";
import AdminHalls from "./pages/admin/AdminHalls";
import HallFormPage from "./pages/admin/HallFormPage";
import HallViewPage from "./pages/admin/HallViewPage";
import AdminShop from "./pages/admin/AdminShop";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminCalendar from "./pages/admin/AdminCalendar";
import ShopProductFormPage from "./pages/admin/ShopProductFormPage";
import ShopProductViewPage from "./pages/admin/ShopProductViewPage";
import AdminClinic from "./pages/admin/AdminClinic";
import AdminGroups from "./pages/admin/AdminGroups";
import GroupDetailsPage from "./pages/admin/GroupDetailsPage";
import AdminMinistryCategories from "./pages/admin/AdminMinistryCategories";
import AdminMembership from "./pages/admin/AdminMembership";
import AdminLivestream from "./pages/admin/AdminLivestream";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminMassBookings from "./pages/admin/AdminMassBookings";
import MassBookingFormPage from "./pages/admin/MassBookingFormPage";
import AdminDonations from "./pages/admin/AdminDonations";
import AdminSchedules from "./pages/admin/AdminSchedules";
import AdminSermons from "./pages/admin/AdminSermons";
import SermonFormPage from "./pages/admin/SermonFormPage";
import LeadershipFormPage from "./pages/admin/LeadershipFormPage";
import AdminContact from "./pages/admin/AdminContact";
import AdminSettings from "./pages/admin/AdminSettings";

// import ChatbotTest from "./components/chat/ChatbotTest"; // Use for testing without OpenAI

// Import global styles
import "./Post.css";
import "./ChatBot.css";
import AdminLayout from "./components/admin/AdminLayout";

// import { AuthProvider, useAuth } from '@company/central-auth-sdk-react';
// const config = {
//   baseUrl: 'http://localhost:3000/api',
//   encryptionKey: 'your-secret-key-here',
//   autoRefresh: true,
// };

const queryClient = new QueryClient();

// Component to conditionally render chatbot
const ConditionalChatbot = () => {
  const location = useLocation();

  // Hide chatbot on coming soon page
  if (location.pathname === '/') {
    return null;
  }

  return <Chatbot />;
};

const App = () => {
  // const { login, user, isAuthenticated } = useAuth();
  const isAuthenticated = true;

  if (isAuthenticated) {
    return (<>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Landing />} />
                  <Route path="landing" element={<Landing />} />
                  <Route path="about" element={<About />} />
                  <Route path="sermons" element={<Sermons />} />
                  <Route path="events" element={<Events />} />
                  <Route path="ministries" element={<Groups />} />
                  <Route path="visit" element={<Visit />} />
                  <Route path="blog" element={<Blog />} />
                  <Route path="contact" element={<Contact />} />
                  {/* <Route path="ministries" element={<Ministries />} /> */}
                  {/* <Route path="ministries/societies-pious-organizations" element={<Ministries />} /> */}
                  {/* <Route path="ministries/small-christians-communities" element={<Ministries />} /> */}
                  <Route path="live" element={<Live />} />
                  <Route path="facilities" element={<Facilities />} />
                  <Route path="charity" element={<Charity />} />
                  <Route path="bulletin" element={<Bulletin />} />
                  <Route path="gallery" element={<Gallery />} />
                  <Route path="gallery/:slug" element={<GalleryAlbumPage />} />
                  <Route path="news" element={<News />} />
                  <Route path="news/:id" element={<NewsView />} />
                  <Route path="anthem" element={<ParishAnthemPage />} />
                  <Route path="parish-anthem" element={<ParishAnthemPage />} />
                  <Route path="past-parish-priests" element={<PastParishPriestsPage />} />
                  <Route path="book-mass" element={<MassBookingPage />} />
                  <Route path="book-mass/guest" element={<GuestMassBookingPage />} />
                  <Route path="my-mass-bookings" element={<MassBookingHistory />} />
                  {/* <Route path="bookshop" element={<BookshopPage />} /> */}
                  {/* <Route path="clinic" element={<ClinicPage />} /> */}
                  <Route path="marriage-bans" element={<MarriageBansPage />} />
                  <Route path="marriage-classes" element={<MarriageClassRegistrationPage />} />
                  <Route path="faq" element={<FaqPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="profile-settings" element={<ProfileSettings />} />
                  <Route path="notification-settings" element={<NotificationSettings />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="bookshop" element={<BookshopPage />} />
                  <Route path="clinic" element={<Clinic />} />
                  <Route path="past-priests" element={<PastPriests />} />
                  <Route path="mass-booking" element={<MassBooking />} />
                  <Route path="booking-history" element={<BookingHistory />} />
                  <Route path="donations" element={<Donations />} />
                  <Route path="registration" element={<Registration />} />
                  <Route path="groups" element={<Groups />} />
                  {/* Duplicate legacy route removed (kept the one above) */}
                  <Route path="privacy" element={<PrivacyPolicy />} />
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="terms" element={<TermsOfService />} />
                  <Route path="terms-of-service" element={<TermsOfService />} />
                  <Route path="cookies" element={<CookiePolicy />} />
                  <Route path="weekly-bulletin" element={<WeeklyBulletin />} />
                  <Route path="sacraments" element={<Sacraments />} />
                  <Route path="rentals" element={<Rentals />} />
                  <Route path="calendar" element={<CalendarPage />} />
                </Route>

                {/* Auth Routes */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />

                {/* Protected Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardHome />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="parish-card" element={<ParishCard />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="mass-bookings" element={<MassBooking />} />
                  <Route path="donations" element={<Donations />} />
                  <Route path="sacraments" element={<SacramentsPage />} />
                  <Route path="prayer-requests" element={<PrayerRequestsPage />} />
                  <Route path="groups" element={<Groups />} />
                  <Route path="announcements" element={<AnnouncementsPage />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="news" element={<AdminNews />} />
                  <Route path="posts" element={<AdminPosts />} />
                  <Route path="posts/new" element={<PostFormPage />} />
                  <Route path="posts/:id/edit" element={<PostFormPage />} />
                  <Route path="events" element={<AdminEvents />} />
                  <Route path="events/new" element={<EventFormPage />} />
                  <Route path="events/:id/edit" element={<EventFormPage />} />
                  <Route path="gallery" element={<AdminGalleryPage />} />
                  <Route path="gallery/albums/:albumId" element={<AdminGalleryAlbumItemsPage />} />
                  <Route path="leadership" element={<AdminLeadership />} />
                  <Route path="sacraments" element={<AdminSacraments />} />
                  <Route path="sacraments/new" element={<SacramentFormPage />} />
                  <Route path="sacraments/:id/edit" element={<SacramentFormPage />} />
                  <Route path="halls" element={<AdminHalls />} />
                  <Route path="halls/new" element={<HallFormPage />} />
                  <Route path="halls/:id" element={<HallViewPage />} />
                  <Route path="halls/:id/edit" element={<HallFormPage />} />
                  <Route path="shop" element={<AdminShop />} />
                  <Route path="shop/new" element={<ShopProductFormPage />} />
                  <Route path="shop/:slug" element={<ShopProductViewPage />} />
                  <Route path="shop/:slug/edit" element={<ShopProductFormPage />} />
                  <Route path="newsletter" element={<AdminNewsletter />} />
                  <Route path="calendar" element={<AdminCalendar />} />
                  <Route path="clinic" element={<AdminClinic />} />
                  <Route path="groups" element={<AdminGroups />} />
                  <Route path="groups/new" element={<GroupFormPage />} />
                  <Route path="groups/categories" element={<AdminMinistryCategories />} />
                  <Route path="groups/:id" element={<GroupDetailsPage />} />
                  <Route path="groups/:id/edit" element={<GroupFormPage />} />
                  <Route path="membership" element={<AdminMembership />} />
                  <Route path="livestream" element={<AdminLivestream />} />
                  <Route path="livestream/new" element={<LivestreamFormPage />} />
                  <Route path="livestream/:id/edit" element={<LivestreamFormPage />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="mass-bookings" element={<AdminMassBookings />} />
                  <Route path="mass-bookings/new" element={<MassBookingFormPage />} />
                  <Route path="donations" element={<AdminDonations />} />
                  <Route path="schedules" element={<AdminSchedules />} />
                  <Route path="schedules/new" element={<ScheduleFormPage />} />
                  <Route path="schedules/:id/edit" element={<ScheduleFormPage />} />
                  <Route path="sermons" element={<AdminSermons />} />
                  <Route path="sermons/new" element={<SermonFormPage />} />
                  <Route path="sermons/:id/edit" element={<SermonFormPage />} />
                  <Route path="leadership/new" element={<LeadershipFormPage />} />
                  <Route path="leadership/:id/edit" element={<LeadershipFormPage />} />
                  <Route path="contact" element={<AdminContact />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
              <ConditionalChatbot />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </>);
  } else {
    return (
      <>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<LoginPage />} />
                  <Route path="book-mass/guest" element={<GuestMassBookingPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
              <ConditionalChatbot />
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </>)
  }
};

export default App;
