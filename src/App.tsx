import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ComingSoon from "./pages/ComingSoon";
import Home from "./pages/Home";
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
import Gallery from "./pages/Gallery";
import News from "./pages/News";
import NewsView from "./pages/NewsView";
import Dashboard from "./pages/Dashboard";
import ProfileSettings from "./pages/ProfileSettings";
import NotificationSettings from "./pages/NotificationSettings";
import Settings from "./pages/Settings";
import EmailWaitlistAdmin from "./pages/EmailWaitlistAdmin";
import Chatbot from "./components/chat/Chatbot";
// import ChatbotTest from "./components/chat/ChatbotTest"; // Use for testing without OpenAI

// Import global styles
import "./Post.css";
import "./ChatBot.css";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Coming Soon page as the main route */}
          <Route path="/" element={<ComingSoon />} />
          
          {/* Admin route for managing email waitlist */}
          <Route path="/admin/waitlist" element={<EmailWaitlistAdmin />} />
          
          {/* Original site routes (accessible for development/admin) */}
          <Route path="/site" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="sermons" element={<Sermons />} />
            <Route path="events" element={<Events />} />
            <Route path="ministries" element={<Ministries />} />
            <Route path="visit" element={<Visit />} />
            <Route path="blog" element={<Blog />} />
            <Route path="contact" element={<Contact />} />
            <Route path="ministries" element={<Ministries />} />
            <Route path="ministries/societies-pious-organizations" element={<Ministries />} />
            <Route path="ministries/small-christians-communities" element={<Ministries />} />
            <Route path="live" element={<Live />} />
            <Route path="facilities" element={<Facilities />} />
            <Route path="charity" element={<Charity />} />
            <Route path="bulletin" element={<Bulletin />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="news" element={<News />} />
            <Route path="news/:id" element={<NewsView />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile-settings" element={<ProfileSettings />} />
            <Route path="notification-settings" element={<NotificationSettings />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ConditionalChatbot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
