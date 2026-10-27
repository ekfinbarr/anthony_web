import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";
import ApprovalsProtectedRoute from "@/components/auth/ApprovalsProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import RouteSEO from "@/components/seo/RouteSEO";
import { routeRedirects } from "@/config/routes.seo";
import Layout from "./components/layout/Layout";
// The home page is the most common landing page, so it ships in the main bundle.
import Landing from "./pages/Landing";

// Import global styles
import "./Post.css";
import "./ChatBot.css";

// ── Public pages (code-split per route) ──
const ParishHome = lazy(() => import("./pages/ParishHome"));
const About = lazy(() => import("./pages/About"));
const ParishPriest = lazy(() => import("./pages/ParishPriest"));
const Sermons = lazy(() => import("./pages/Sermons"));
const Events = lazy(() => import("./pages/Events"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PaymentComplete = lazy(() => import("./pages/PaymentComplete"));
const Live = lazy(() => import("./pages/Live"));
const Visit = lazy(() => import("./pages/Visit"));
const Facilities = lazy(() => import("./pages/Facilities"));
const Charity = lazy(() => import("./pages/Charity"));
const Bulletin = lazy(() => import("./pages/Bulletin"));
const News = lazy(() => import("./pages/News"));
const NewsView = lazy(() => import("./pages/NewsView"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const ParishAnthemPage = lazy(() => import("./pages/ParishAnthemPage"));
const MassBookingPage = lazy(() => import("./pages/MassBookingPage"));
const GuestMassBookingPage = lazy(() => import("./pages/GuestMassBookingPage"));
const MassBookingHistory = lazy(() => import("./pages/MassBookingHistory"));
const BookshopPage = lazy(() => import("./pages/BookshopPage"));
const MarriageBansPage = lazy(() => import("./pages/MarriageBansPage"));
const MarriageClassRegistrationPage = lazy(() => import("./pages/MarriageClassRegistrationPage"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const Clinic = lazy(() => import("./pages/Clinic"));
const BookingHistory = lazy(() => import("./pages/BookingHistory"));
const Donations = lazy(() => import("./pages/Donations"));
const Registration = lazy(() => import("./pages/Registration"));
const Groups = lazy(() => import("./pages/Groups"));
const ServeOthers = lazy(() => import("./pages/ServeOthers"));
const ServeOthersDetail = lazy(() => import("./pages/ServeOthersDetail"));
const AdminMinistryEnquiries = lazy(() => import("./pages/admin/AdminMinistryEnquiries"));
const Gallery = lazy(() => import("./pages/Gallery"));
const GalleryAlbumPage = lazy(() => import("./pages/GalleryAlbumPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const BulletinDetail = lazy(() => import("./pages/BulletinDetail"));
const Sacraments = lazy(() => import("./pages/Sacraments"));
const Rentals = lazy(() => import("./pages/Rentals"));
const RentalStatus = lazy(() => import("./pages/RentalStatus"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const Chatbot = lazy(() => import("./components/chat/Chatbot"));

// ── Auth pages ──
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));

// ── Dashboard pages ──
const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const MyMassBookings = lazy(() => import("./pages/dashboard/MyMassBookings"));
const MyDonations = lazy(() => import("./pages/dashboard/MyDonations"));
const MyGroups = lazy(() => import("./pages/dashboard/MyGroups"));
const Profile = lazy(() => import("./pages/dashboard/Profile"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));
const ParishCard = lazy(() => import("./pages/dashboard/ParishCard"));
const Notifications = lazy(() => import("./pages/dashboard/Notifications"));
const SacramentsPage = lazy(() => import("./pages/dashboard/SacramentsPage"));
const PrayerRequestsPage = lazy(() => import("./pages/dashboard/PrayerRequestsPage"));
const AnnouncementsPage = lazy(() => import("./pages/dashboard/AnnouncementsPage"));

// ── Admin pages ──
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminPosts = lazy(() => import("./pages/admin/AdminPosts"));
const PostFormPage = lazy(() => import("./pages/admin/PostFormPage"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents"));
const EventFormPage = lazy(() => import("./pages/admin/EventFormPage"));
const SacramentFormPage = lazy(() => import("./pages/admin/SacramentFormPage"));
const ScheduleFormPage = lazy(() => import("./pages/admin/ScheduleFormPage"));
const LivestreamFormPage = lazy(() => import("./pages/admin/LivestreamFormPage"));
const GroupFormPage = lazy(() => import("./pages/admin/GroupFormPage"));
const AdminGalleryPage = lazy(() => import("./pages/admin/AdminGalleryPage"));
const AdminGalleryAlbumItemsPage = lazy(() => import("./pages/admin/AdminGalleryAlbumItemsPage"));
const AdminLeadership = lazy(() => import("./pages/admin/AdminLeadership"));
const AdminSacraments = lazy(() => import("./pages/admin/AdminSacraments"));
const AdminHalls = lazy(() => import("./pages/admin/AdminHalls"));
const HallFormPage = lazy(() => import("./pages/admin/HallFormPage"));
const HallViewPage = lazy(() => import("./pages/admin/HallViewPage"));
const AdminShop = lazy(() => import("./pages/admin/AdminShop"));
const AdminNewsletter = lazy(() => import("./pages/admin/AdminNewsletter"));
const EmailWaitlistAdmin = lazy(() => import("./pages/EmailWaitlistAdmin"));
const AdminCalendar = lazy(() => import("./pages/admin/AdminCalendar"));
const ShopProductFormPage = lazy(() => import("./pages/admin/ShopProductFormPage"));
const ShopProductViewPage = lazy(() => import("./pages/admin/ShopProductViewPage"));
const AdminClinic = lazy(() => import("./pages/admin/AdminClinic"));
const AdminGroups = lazy(() => import("./pages/admin/AdminGroups"));
const GroupDetailsPage = lazy(() => import("./pages/admin/GroupDetailsPage"));
const AdminMinistryCategories = lazy(() => import("./pages/admin/AdminMinistryCategories"));
const AdminMembership = lazy(() => import("./pages/admin/AdminMembership"));
const AdminLivestream = lazy(() => import("./pages/admin/AdminLivestream"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminMassBookings = lazy(() => import("./pages/admin/AdminMassBookings"));
const MassBookingFormPage = lazy(() => import("./pages/admin/MassBookingFormPage"));
const AdminDonations = lazy(() => import("./pages/admin/AdminDonations"));
const AdminSchedules = lazy(() => import("./pages/admin/AdminSchedules"));
const AdminSermons = lazy(() => import("./pages/admin/AdminSermons"));
const SermonFormPage = lazy(() => import("./pages/admin/SermonFormPage"));
const AdminBulletins = lazy(() => import("./pages/admin/AdminBulletins"));
const LeadershipFormPage = lazy(() => import("./pages/admin/LeadershipFormPage"));
const AdminContact = lazy(() => import("./pages/admin/AdminContact"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminApprovalsOverview = lazy(() => import("./pages/admin/approvals/AdminApprovalsOverview"));
const AdminApprovalQueue = lazy(() => import("./pages/admin/approvals/AdminApprovalQueue"));
const AdminApprovalRequestDetail = lazy(() => import("./pages/admin/approvals/AdminApprovalRequestDetail"));
const AdminApprovalHistory = lazy(() => import("./pages/admin/approvals/AdminApprovalHistory"));
const AdminApprovalReports = lazy(() => import("./pages/admin/approvals/AdminApprovalReports"));
const AdminWorkflows = lazy(() => import("./pages/admin/approvals/AdminWorkflows"));
const AdminWorkflowBuilder = lazy(() => import("./pages/admin/approvals/AdminWorkflowBuilder"));

const queryClient = new QueryClient();

// Component to conditionally render chatbot
const ConditionalChatbot = () => {
  const location = useLocation();

  // Hide chatbot on the home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <Suspense fallback={null}>
      {/* <Chatbot /> */}
    </Suspense>
  );
};

const AppRoutes = () => {
  const { pathname } = useLocation();

  return (
    <ErrorBoundary resetKey={pathname}>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="home" element={<ParishHome />} />
            {/* Legacy and duplicate URLs → canonical URLs (mirrored as 301s in .htaccess) */}
            {routeRedirects.map(({ from, to }) => (
              <Route key={from} path={from.slice(1)} element={<Navigate to={to} replace />} />
            ))}
            <Route path="about" element={<About />} />
            <Route path="parish-priest" element={<ParishPriest />} />
            <Route path="sermons" element={<Sermons />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:slug" element={<EventDetail />} />
            <Route path="visit" element={<Visit />} />
            <Route path="blog" element={<Blog />} />
            <Route path="contact" element={<Contact />} />
            <Route path="live" element={<Live />} />
            <Route path="live/:id" element={<Live />} />
            <Route path="facilities" element={<Facilities />} />
            <Route path="charity" element={<Charity />} />
            <Route path="bulletin" element={<Bulletin />} />
            <Route path="bulletin/:slug" element={<BulletinDetail />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="gallery/:slug" element={<GalleryAlbumPage />} />
            <Route path="news" element={<News />} />
            <Route path="news/:slug" element={<NewsView />} />
            <Route path="parish-anthem" element={<ParishAnthemPage />} />
            <Route path="book-mass" element={<MassBookingPage />} />
            <Route path="book-mass/guest" element={<GuestMassBookingPage />} />
            <Route path="my-mass-bookings" element={<MassBookingHistory />} />
            <Route path="marriage-bans" element={<MarriageBansPage />} />
            <Route path="marriage-classes" element={<MarriageClassRegistrationPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="payment/complete" element={<PaymentComplete />} />
            <Route path="register" element={<Registration />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile-settings" element={<ProfileSettings />} />
            <Route path="notification-settings" element={<NotificationSettings />} />
            <Route path="settings" element={<Settings />} />
            <Route path="bookshop" element={<BookshopPage />} />
            <Route path="clinic" element={<Clinic />} />
            <Route path="booking-history" element={<BookingHistory />} />
            <Route path="donations" element={<Donations />} />
            <Route path="registration" element={<Registration />} />
            <Route path="serve-others" element={<ServeOthers />} />
            <Route path="serve-others/:slug" element={<ServeOthersDetail />} />
            <Route path="groups" element={<Groups />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
            <Route path="cookies" element={<CookiePolicy />} />
            <Route path="sacraments" element={<Sacraments />} />
            <Route path="rentals" element={<Rentals />} />
            <Route path="rentals/status/:token" element={<RentalStatus />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="*" element={<NotFound />} />
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
            <Route path="mass-bookings" element={<MyMassBookings />} />
            <Route path="donations" element={<MyDonations />} />
            <Route path="sacraments" element={<SacramentsPage />} />
            <Route path="prayer-requests" element={<PrayerRequestsPage />} />
            <Route path="groups" element={<MyGroups />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
          </Route>

          {/* Approvals — reachable by approval participants without full CMS admin access */}
          <Route path="/admin/approvals" element={<ApprovalsProtectedRoute><AdminLayout /></ApprovalsProtectedRoute>}>
            <Route index element={<AdminApprovalsOverview />} />
            <Route path="queue" element={<AdminApprovalQueue />} />
            <Route path="requests/:id" element={<AdminApprovalRequestDetail />} />
            <Route path="history" element={<AdminApprovalHistory />} />
            <Route
              path="reports"
              element={<ApprovalsProtectedRoute permissions={["view approval-reports", "manage workflows"]}><AdminApprovalReports /></ApprovalsProtectedRoute>}
            />
            <Route
              path="workflows"
              element={<ApprovalsProtectedRoute permissions={["view workflows", "manage workflows"]}><AdminWorkflows /></ApprovalsProtectedRoute>}
            />
            <Route
              path="workflows/:id"
              element={<ApprovalsProtectedRoute permissions={["view workflows", "manage workflows"]}><AdminWorkflowBuilder /></ApprovalsProtectedRoute>}
            />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="news" element={<Navigate to="/admin/posts" replace />} />
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
            <Route path="newsletter/waitlist" element={<EmailWaitlistAdmin />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="clinic" element={<AdminClinic />} />
            <Route path="groups" element={<AdminGroups />} />
            <Route path="groups/new" element={<GroupFormPage />} />
            <Route path="groups/categories" element={<AdminMinistryCategories />} />
            <Route path="groups/enquiries" element={<AdminMinistryEnquiries />} />
            <Route path="groups/:id" element={<GroupDetailsPage />} />
            <Route path="groups/:id/edit" element={<GroupFormPage />} />
            <Route path="membership" element={<AdminMembership />} />
            <Route path="livestream" element={<AdminLivestream />} />
            <Route path="livestream/new" element={<LivestreamFormPage />} />
            <Route path="livestream/:id/edit" element={<LivestreamFormPage />} />
            <Route path="users" element={<AdminProtectedRoute requireSuperAdmin><AdminUsers /></AdminProtectedRoute>} />
            <Route path="mass-bookings" element={<AdminMassBookings />} />
            <Route path="mass-bookings/new" element={<MassBookingFormPage />} />
            <Route path="mass-bookings/:id/edit" element={<MassBookingFormPage />} />
            <Route path="donations" element={<AdminDonations />} />
            <Route path="schedules" element={<AdminSchedules />} />
            <Route path="schedules/new" element={<ScheduleFormPage />} />
            <Route path="schedules/:id/edit" element={<ScheduleFormPage />} />
            <Route path="sermons" element={<AdminSermons />} />
            <Route path="sermons/new" element={<SermonFormPage />} />
            <Route path="sermons/:id/edit" element={<SermonFormPage />} />
            <Route path="bulletins" element={<AdminBulletins />} />
            <Route path="leadership/new" element={<LeadershipFormPage />} />
            <Route path="leadership/:id/edit" element={<LeadershipFormPage />} />
            <Route path="contact" element={<AdminContact />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
          <RouteSEO />
          <ConditionalChatbot />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
