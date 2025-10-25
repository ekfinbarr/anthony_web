import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, MapPin } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/10 w-24 h-24 bg-blue-400/10 rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/10 w-32 h-32 bg-purple-400/10 rounded-full animate-pulse delay-300" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-pink-400/5 rounded-full animate-pulse delay-700" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <img
            src="/logo.png"
            alt="St. Anthony Gbaja Logo"
            className="mx-auto h-16 sm:h-20 w-auto"
          />
        </motion.div>

        {/* 404 Error Code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <h1 className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 leading-none">
            404
          </h1>
        </motion.div>

        {/* Error Title */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-6"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Page Not Found</h2>
          <p className="text-lg sm:text-xl text-gray-200 max-w-lg mx-auto leading-relaxed">
            We're sorry, but the page you're looking for doesn't exist. 
            It may have been moved, deleted, or you entered the wrong URL.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
        >
          <Button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            <Home className="h-5 w-5 mr-2" />
            Go to Homepage
          </Button>
          
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="px-6 py-3 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </Button>
        </motion.div>

        {/* Church Information */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-md mx-auto p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MapPin className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-yellow-400">Visit Us</h3>
          </div>
          <p className="text-gray-200 text-sm leading-relaxed">
            St. Anthony Catholic Church<br />
            Gbaja Road, Surulere<br />
            Lagos State, Nigeria
          </p>
        </motion.div>

        {/* Auto-redirect message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-8 text-gray-400 text-sm"
        >
          You'll be redirected to the homepage in a few seconds...
        </motion.p>
      </div>
    </div>
  );
};

export default NotFound;
