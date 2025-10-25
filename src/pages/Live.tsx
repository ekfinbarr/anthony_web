import { motion } from "framer-motion";
import { Calendar, Clock, Users, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import EmbedVidWidget from "@/components/live/EmbedVidWidget";

const Live = () => {
  // This would be dynamic in production
  const isLive = true;
  const nextService = {
    title: "Sunday Mass",
    date: "Sunday, January 14, 2024",
    time: "9:00 AM WAT",
  };

  return (
    <div>
      <section className="relative py-7 bg-gradient-dark text-church-pearl">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-heading font-bold mb-4 text-center">Live Stream</h1>
          <p className="text-xl text-center max-w-3xl mx-auto">
            Join us for worship from anywhere in the world
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="overflow-hidden">
                  <div className="relative aspect-video bg-secondary flex items-center justify-center">
                    {isLive ? (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        {/* <EmbedVidWidget /> */}
                        <iframe
                        src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fweb.facebook.com%2Freel%2F31869071726074221%2F&show_text=false&width=560&t=0"
                        width="560"
                        height="314"
                        // style="border:none;overflow:hidden"
                        style={{
                          border: "none",
                          overflow: "hidden"
                        }}
                        scrolling="no"
                        frameBorder="0"
                        allowFullScreen={true}
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        ></iframe>
                        LIVE
                      </div>
                    ) : (
                        <div className="text-center p-8">
                        <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-2xl font-serif font-bold mb-2">Stream is Offline</h3>
                        <p className="text-muted-foreground mb-6">
                          The next live service will begin soon
                        </p>
                        <div className="space-y-2">
                          <p className="font-semibold">{nextService.title}</p>
                          <p className="text-sm text-muted-foreground">{nextService.date}</p>
                          <p className="text-sm text-muted-foreground">{nextService.time}</p>
                        </div>
                      </div>
                    )}

                    {/* YouTube embed would go here when live */}
                    {isLive && (
                      <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                        title="Live Stream"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0"
                      />
                    )}
                  </div>

                  <div className="p-6">
                    <h2 className="text-2xl font-serif font-bold mb-4">
                      {isLive ? "Live Now: Sunday Mass" : "Join Us This Sunday"}
                    </h2>
                    <p className="text-muted-foreground">
                      Experience our vibrant worship service with uplifting music, inspiring
                      preaching, and warm fellowship. Whether you're joining from home or planning
                      to visit in person, we're glad you're here.
                    </p>
                  </div>
                </Card>

                {/* Past Services */}
                <div className="mt-8">
                  <h3 className="text-2xl font-serif font-bold mb-6">Past Services</h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-4 hover-lift cursor-pointer group">
                        <div className="flex gap-4">
                          <div className="w-32 h-20 bg-secondary rounded flex-shrink-0 flex items-center justify-center">
                            <MessageCircle className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">Sunday Mass - January {7 - i}, 2024</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Fr. Alexander Fatimehin • 1 hour 23 min
                            </p>
                            <Button variant="outline" size="sm">Watch Recording</Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Schedule */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Live Stream Schedule</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="pb-3 border-b">
                      <p className="font-semibold">Sunday</p>
                      <p className="text-sm text-muted-foreground">7:00 AM, 9:00 AM, 5:00 PM</p>
                    </div>
                    <div className="pb-3 border-b">
                      <p className="font-semibold">Wednesday</p>
                      <p className="text-sm text-muted-foreground">Bible Study - 7:00 PM</p>
                    </div>
                    <div>
                      <p className="font-semibold">Special Events</p>
                      <p className="text-sm text-muted-foreground">Announced on social media</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Live Chat Placeholder */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Live Chat</h3>
                  </div>
                  {isLive ? (
                    <div className="h-96 bg-secondary rounded p-4">
                      <p className="text-sm text-muted-foreground">
                        Chat will appear here during live streams
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Join the conversation when the stream goes live
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>

              {/* Connection Card */}
              <Card className="p-6 bg-primary text-primary-foreground">
                <h3 className="text-lg font-semibold mb-3">Can't Make It Online?</h3>
                <p className="text-sm opacity-90 mb-4">
                  We'd love to see you in person! Check out our service times and plan your visit.
                </p>
                <Link to="/visit">
                  <Button variant="secondary" className="w-full bg-background text-primary hover:bg-background/90">
                    Plan Your Visit
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Live;
