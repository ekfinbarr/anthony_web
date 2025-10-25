import { Link } from "react-router-dom";
import { Church, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import logo from "@/assets/images/logo.png";

const Footer = () => {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter submission
  };

  return (
    <footer className="bg-church-charcoal text-church-pearl pt-16 pb-8">
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
            <div className="flex space-x-3">
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
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

        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm text-church-pearl/60">
            © {new Date().getFullYear()} St. Anthony, Gbaja. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;