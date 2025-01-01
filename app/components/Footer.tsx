import { SocialMediaBar } from "./SocialMediaBar";

export function Footer() {
  return (
    <footer className="bg-forest text-beige py-6">
      <div className="container mx-auto flex flex-col items-center space-y-4 md:space-y-0 md:flex-row md:justify-between">
        <p className="text-sm text-center md:text-left">
          &copy; {new Date().getFullYear()} Firstfruit Real Estate LLC. All rights reserved.
        </p>
        <SocialMediaBar textColor="text-beige" />
      </div>
    </footer>
  );
}
