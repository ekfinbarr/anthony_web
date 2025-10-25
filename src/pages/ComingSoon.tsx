import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Calendar, Bell, CheckCircle } from "lucide-react";
import { EmailService } from "@/services/emailService";

const ComingSoon = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await EmailService.subscribeToWaitingList(email);
      setIsSubmitted(true);
      toast({
        title: "Successfully subscribed!",
        description: "You'll be the first to know when we launch.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900" />
        
        {/* Video Loading Placeholder */}
        {!videoLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-800/80 via-purple-800/80 to-pink-800/80 animate-pulse" />
        )}
        
        <video
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => {
            console.log("Video failed to load, using fallback background");
            setVideoLoaded(true); // Show content even if video fails
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-200' : 'opacity-0'
          }`}
        >
          <source src="/drone_spec.mp4" type="video/mp4" />
          <source src="/src/assets/videos/drone_spec.mp4" type="video/mp4" />
        </video>
        
        {/* Video Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 sm:mb-8"
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="mx-auto h-12 sm:h-16 md:h-20 lg:h-24 w-auto"
          />
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-3 sm:space-y-4 mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
            Something Amazing
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400">
              Is Coming
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed px-4">
            We're working hard to bring you an incredible experience. 
            Join our waiting list to be the first to know when we launch.
          </p>
        </motion.div>

        {/* Email Subscription Form */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-md mx-auto mb-8 sm:mb-12 px-4"
        >
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 py-3 h-12 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-gray-300 focus:border-white/40 focus:bg-white/20 rounded-lg"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 sm:px-8 py-3 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="hidden sm:inline">Joining...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4" />
                      <span className="hidden sm:inline">Notify Me</span>
                      <span className="sm:hidden">Join</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center space-x-3 text-green-400"
            >
              <CheckCircle className="h-6 w-6" />
              <span className="text-lg font-medium">You're on the list!</span>
            </motion.div>
          )}
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto mb-8 sm:mb-12 px-4"
        >
          <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <Calendar className="h-6 sm:h-8 w-6 sm:w-8 mx-auto mb-3 sm:mb-4 text-blue-400" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-gray-300 text-xs sm:text-sm">
              We're putting the finishing touches on something special
            </p>
          </div>
          <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <Bell className="h-6 sm:h-8 w-6 sm:w-8 mx-auto mb-3 sm:mb-4 text-purple-400" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Be First</h3>
            <p className="text-gray-300 text-xs sm:text-sm">
              Join our waitlist and be among the first to experience it
            </p>
          </div>
          <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <CheckCircle className="h-6 sm:h-8 w-6 sm:w-8 mx-auto mb-3 sm:mb-4 text-green-400" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Exclusive Access</h3>
            <p className="text-gray-300 text-xs sm:text-sm">
              Get early access and special launch day privileges
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-gray-400 text-xs sm:text-sm px-4"
        >
          We respect your privacy. Unsubscribe at any time.
        </motion.p>
      </div>
    </div>
  );
};

export default ComingSoon;