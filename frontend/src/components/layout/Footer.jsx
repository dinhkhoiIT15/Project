import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Twitter, Github, Slack } from "lucide-react";

const FooterLink = ({ to = "#", children }) => (
  <Link 
    to={to} 
    className="text-sm font-medium text-[#6e7781] hover:text-[#0969da] transition-colors duration-200"
  >
    {children}
  </Link>
);

const SocialIcon = ({ icon: Icon, href = "#" }) => (
  <a 
    href={href} 
    className="p-2 border border-[#d0d7de] rounded-md hover:bg-[#f6f8fa] text-[#1f2328] transition-all"
    target="_blank" 
    rel="noopener noreferrer"
  >
    <Icon size={18} />
  </a>
);

const Footer = () => {
  return (
    <footer className="flex w-full flex-col items-center justify-center gap-6 border-t border-solid border-[#d0d7de] bg-white px-6 py-16 mt-20">
      <div className="flex w-full max-w-[1280px] flex-col items-center gap-12">
        
        {/* Upper Section: Links Grid */}
        <div className="flex w-full flex-wrap items-start gap-8">
          <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-6">
            <span className="w-full text-sm font-bold text-[#1f2328] uppercase tracking-wider">
              Product
            </span>
            <div className="flex flex-col items-start gap-4">
              <FooterLink>New Arrivals</FooterLink>
              <FooterLink>Best Sellers</FooterLink>
              <FooterLink>Categories</FooterLink>
              <FooterLink>AI Recommendations</FooterLink>
            </div>
          </div>

          <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-6">
            <span className="w-full text-sm font-bold text-[#1f2328] uppercase tracking-wider">
              Company
            </span>
            <div className="flex flex-col items-start gap-4">
              <FooterLink to="/profile">About Us</FooterLink>
              <FooterLink>Our Team</FooterLink>
              <FooterLink>Careers</FooterLink>
            </div>
          </div>

          <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-6">
            <span className="w-full text-sm font-bold text-[#1f2328] uppercase tracking-wider">
              Resources
            </span>
            <div className="flex flex-col items-start gap-4">
              <FooterLink>Help Center</FooterLink>
              <FooterLink>Track My Order</FooterLink>
              <FooterLink>Return Policy</FooterLink>
            </div>
          </div>

          <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-4">
            <span className="w-full text-sm font-bold text-[#1f2328] uppercase tracking-wider">
              Follow us
            </span>
            <div className="flex w-full items-center gap-2">
              <SocialIcon icon={Twitter} />
              <SocialIcon icon={Github} />
              <SocialIcon icon={Slack} />
            </div>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="flex h-px w-full flex-none items-center bg-[#d0d7de]" />

        {/* Middle Section: Logo and Legal Items */}
        <div className="flex w-full flex-wrap items-start gap-8">
          <div className="flex min-w-[144px] grow shrink-0 basis-0 items-start gap-2">
            <Link to="/" className="flex items-center text-[#1f2328] font-black text-xl">
              <div className="bg-[#1f2328] p-1.5 rounded-md mr-3">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              DK-ECOM
            </Link>
          </div>
          <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-4">
            <FooterLink>Legal Notice</FooterLink>
            <FooterLink>Feedback</FooterLink>
          </div>
          <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-4">
            <FooterLink>Privacy Policy</FooterLink>
            <FooterLink>Terms of Service</FooterLink>
          </div>
          <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-4">
            <FooterLink>Cookie Policy</FooterLink>
            <FooterLink>Site Map</FooterLink>
          </div>
        </div>

        {/* Bottom Section: Copyright & Disclaimer */}
        <div className="flex w-full max-w-[768px] flex-col items-center gap-4 border-t border-[#d0d7de] pt-8">
          <span className="text-sm font-semibold text-[#6e7781] text-center">
            © {new Date().getFullYear()} DK-ECOM Store. All rights reserved.
          </span>
          <span className="text-xs text-[#6e7781] text-center leading-relaxed px-4">
            DK-ECOM is an intergalactic e-commerce platform powered by AI, 
            designed to provide the best shopping experience across all galaxies. 
            All transactions are secure and encrypted.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;