import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedin } from "react-icons/fa";

interface SocialMediaBarProps {
  textColor: string;
}

export function SocialMediaBar({ textColor }: SocialMediaBarProps) {
  return (
    <div className={`flex space-x-4 ${textColor}`}>
      <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
        <FaFacebookF className="hover:opacity-80 transition-opacity" />
      </Link>
      <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
        <FaInstagram className="hover:opacity-80 transition-opacity" />
      </Link>
      <Link href="https://linkedin.com/company/firstfruit-real-estate" target="_blank" rel="noopener noreferrer">
        <FaLinkedin className="hover:opacity-80 transition-opacity" />
      </Link>
    </div>
  );
}
