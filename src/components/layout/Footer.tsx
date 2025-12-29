import { Link } from "react-router-dom";
import { Church, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import logo from "@/assets/images/logo.png";
import SocialMediaLinks from "@/components/ui/SocialMediaLinks";

const Footer = () => {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter submission
  };

  return (
    // <footer className="bg-church-charcoal text-church-pearl pt-16 pb-8">
    <footer className="bg-church-charcoal text-church-pearl">
      {/* Social Media Banner */}
      <section className="bg-primary py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-primary-foreground font-semibold text-lg">Follow Us on Social Media</p>
            <div className="flex items-center gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-primary-foreground flex items-center justify-center hover:scale-110 transition-transform">
                <Facebook className="h-6 w-6 text-primary" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-primary-foreground flex items-center justify-center hover:scale-110 transition-transform">
                <Instagram className="h-6 w-6 text-primary" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-primary-foreground flex items-center justify-center hover:scale-110 transition-transform">
                <Youtube className="h-6 w-6 text-primary" />
              </a>
              <a href="https://wa.me/2348012345678" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-primary-foreground flex items-center justify-center hover:scale-110 transition-transform">
                <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
      <div className="pt-16 pb-8">
        <div className="container mx-auto px-4">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Church Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                {/* <div className="bg-gradient-church p-2 rounded-lg"> */}
                <div className="bg-gradient-gold p-2 rounded-lg">
                  {/* <Church className="h-6 w-6 text-church-charcoal" /> */}
                  <img src={logo} alt="St. Anthony" className="h-15 w-16 object-contain" />
                </div>
                <h3 className="text-xl font-heading font-bold">St. Anthony Catholic Church, Gbaja</h3>
              </div>
              <p className="text-sm text-church-pearl/80 mb-4">
                A place where everyone is welcome, loved, and equipped to serve God and others.
              </p>
              <SocialMediaLinks size="small" color="white" variant="outline" />
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-sm text-church-pearl/80 hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/sermons" className="text-sm text-church-pearl/80 hover:text-primary transition-colors">
                    Sermons
                  </Link>
                </li>
                <li>
                  <Link to="/events" className="text-sm text-church-pearl/80 hover:text-primary transition-colors">
                    Upcoming Events
                  </Link>
                </li>
                <li>
                  <Link to="/ministries" className="text-sm text-church-pearl/80 hover:text-primary transition-colors">
                    Organizations
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-sm text-church-pearl/80 hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Service Times */}
            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Mass Times</h4>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-sm">Sunday Mass</p>
                  <p className="text-sm text-church-pearl/80">7:00 AM, 8:30 AM, 10:00 AM, 11:30 AM, & 6:00 PM</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Thursday Faith & Doctrinal Class</p>
                  <p className="text-sm text-church-pearl/80">7:00 PM</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Confessions</p>
                  <p className="text-sm text-church-pearl/80">Saturday at 5:00 PM</p>
                </div>
              </div>
            </div>

            {/* Contact & Newsletter */}
            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Stay Connected</h4>
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <p className="text-sm text-church-pearl/80">123 Gbaja Street, Surulere, Lagos.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <p className="text-sm text-church-pearl/80">(234) 234 567 8910</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <p className="text-sm text-church-pearl/80">info@stanthonygbaja.org</p>
                </div>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-church-charcoal/50 border-church-pearl/20 text-church-pearl placeholder:text-church-pearl/40"
                  required
                />
                <Button variant="church" size="sm" className="w-full">
                  Subscribe to Newsletter
                </Button>
              </form>
            </div>
          </div>

          <Separator className="bg-church-pearl/20 mb-6" />

          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4 text-sm">
            <Link to="/privacy-policy" className="text-church-pearl/80 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <span className="text-church-pearl/40">•</span>
            <Link to="/terms-of-service" className="text-church-pearl/80 hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <span className="text-church-pearl/40">•</span>
            <Link to="/cookies" className="text-church-pearl/80 hover:text-primary transition-colors">
              Cookie Policy
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-sm text-church-pearl/60">
              © {new Date().getFullYear()} St. Anthony, Gbaja. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
