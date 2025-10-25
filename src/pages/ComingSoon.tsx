import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Calendar, Bell, CheckCircle, MapPin, Clock, Coffee, Heart, Church, House } from "lucide-react";
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            St. Anthony Catholic Church
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400">
              Gbaja
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed px-4">
            Welcome Home! Our new website is coming soon. <br />
            Join our community and be the first to know when we launch.
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

        {/* Church Information */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-4xl mx-auto mb-8 sm:mb-12 px-4"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Visit Us
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-center">
            {/* Church Address */}
            <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <MapPin className="h-6 w-6 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Church Address</h3>
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
                St. Anthony Catholic Church<br />
                Gbaja Road<br />
                Surulere, Lagos State<br />
                Nigeria
              </p>
            </div>

            {/* Mass Times */}
            <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Church className="h-6 w-6 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Mass Times</h3>
              {/* <div className="flex items-center space-x-3 mb-4">
                <Heart className="h-6 w-6 text-purple-400" />
                <h3 className="text-lg sm:text-xl font-semibold">Mass Times</h3>
              </div> */}
              <div className="text-gray-200 text-sm sm:text-base space-y-2">
                <div><span className="font-medium">Sunday:</span> 7:00 AM, 8:30 AM, 10:00 AM, 11:30 AM, & 6:00 PM</div>
                <div><span className="font-medium">Weekdays:</span> 6:30 AM, 12:30 PM, & 6:30 PM</div>
                <div><span className="font-medium">Saturday:</span> 7:00 AM</div>
                <div><span className="font-medium">Holidays:</span> 8:00 AM</div>
              </div>
            </div>

            {/* Confession Times */}
            <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Heart className="h-6 w-6 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Confession Times</h3>
              {/* <div className="flex items-center space-x-3 mb-4">
                <Clock className="h-6 w-6 text-green-400" />
                <h3 className="text-lg sm:text-xl font-semibold">Confession Times</h3>
              </div> */}
              <div className="text-gray-200 text-sm sm:text-base space-y-2">
                <div><span className="font-medium">1st Saturday:</span> 5:00 PM</div>
                <div><span className="font-medium">2nd Saturday:</span> 5:00 PM</div>
                <div><span className="font-medium">3rd Saturday:</span> 5:00 PM</div>
                <div className="text-gray-300 text-xs mt-2">Or by appointment</div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <House className="h-6 w-6 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Office Hours</h3>
              {/* <div className="flex items-center space-x-3 mb-4">
                <Coffee className="h-6 w-6 text-yellow-400" />
                <h3 className="text-lg sm:text-xl font-semibold">Office Hours</h3>
              </div> */}
              <div className="text-gray-200 text-sm sm:text-base space-y-2">
                <div><span className="font-medium">Monday - Friday:</span> 9:00 AM - 4:00 PM</div>
                <div><span className="font-medium">Saturday:</span> Closed</div>
                <div><span className="font-medium">Sunday:</span> Closed</div>
                <div className="text-gray-300 text-xs mt-2">Call ahead for appointments</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto mb-8 sm:mb-12 px-4"
        >
          <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <Calendar className="h-6 sm:h-8 w-6 sm:w-8 mx-auto mb-3 sm:mb-4 text-blue-400" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">New Website</h3>
            <p className="text-gray-300 text-xs sm:text-sm">
              Enhanced online experience for our parish community
            </p>
          </div>
          <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <Bell className="h-6 sm:h-8 w-6 sm:w-8 mx-auto mb-3 sm:mb-4 text-purple-400" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Stay Connected</h3>
            <p className="text-gray-300 text-xs sm:text-sm">
              Get updates on events, masses, and parish announcements
            </p>
          </div>
          <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <CheckCircle className="h-6 sm:h-8 w-6 sm:w-8 mx-auto mb-3 sm:mb-4 text-green-400" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Join Our Family</h3>
            <p className="text-gray-300 text-xs sm:text-sm">
              Be part of our growing parish community
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-gray-400 text-xs sm:text-sm px-4 mb-4 sm:mb-6"
        >
          God bless you. We respect your privacy and will only send parish updates.
        </motion.p>
      </div>
    </div>
  );
};

export default ComingSoon;