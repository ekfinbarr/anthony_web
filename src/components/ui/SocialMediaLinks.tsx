import React from 'react';
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok, FaTwitter } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface SocialMediaLinksProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'gold' | 'white';
  variant?: 'filled' | 'outline';
  className?: string;
}

const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  size = 'medium',
  color = 'primary',
  variant = 'outline',
  className = '',
}) => {
  const socialLinks = {
    facebook: 'https://facebook.com/stanthonygbaja',
    instagram: 'https://instagram.com/stanthonygbaja',
    youtube: 'https://youtube.com/@stanthonygbaja',
    tiktok: 'https://tiktok.com/@stanthonygbaja',
    twitter: 'https://twitter.com/stanthonygbaja',
  };

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12',
  };

  const colorClasses = {
    primary: variant === 'filled' ? 'bg-primary text-primary-foreground' : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground',
    gold: variant === 'filled' ? 'bg-gradient-gold text-church-charcoal' : 'border-gradient-gold text-gradient-gold hover:bg-gradient-gold hover:text-church-charcoal',
    white: variant === 'filled' ? 'bg-white text-church-charcoal' : 'border-white text-white hover:bg-white hover:text-church-charcoal',
  };

  const iconSize = {
    small: 16,
    medium: 20,
    large: 24,
  };

  const socialIcons = [
    { name: 'Facebook', icon: FaFacebookF, link: socialLinks.facebook, ariaLabel: 'Follow us on Facebook' },
    { name: 'Instagram', icon: FaInstagram, link: socialLinks.instagram, ariaLabel: 'Follow us on Instagram' },
    { name: 'YouTube', icon: FaYoutube, link: socialLinks.youtube, ariaLabel: 'Subscribe to our YouTube channel' },
    { name: 'TikTok', icon: FaTiktok, link: socialLinks.tiktok, ariaLabel: 'Follow us on TikTok' },
    { name: 'Twitter', icon: FaTwitter, link: socialLinks.twitter, ariaLabel: 'Follow us on Twitter' },
  ];

  return (
    <div className={`flex flex-wrap gap-4 justify-left ${className}`}>
      {socialIcons.map((social, index) => (
        <motion.a
          key={social.name}
          href={social.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.ariaLabel}
          className={`
            flex items-center justify-center rounded-full border-2 transition-all duration-300
            ${sizeClasses[size]}
            ${colorClasses[color]}
            hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          `}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <social.icon size={iconSize[size]} />
        </motion.a>
      ))}
    </div>
  );
};

export default SocialMediaLinks;
