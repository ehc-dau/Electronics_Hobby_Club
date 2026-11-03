import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // `external` items are separate pages (not React Router routes), so they need a real <a> and a full page load.
  const navItems: { name: string; href: string; external?: boolean }[] = [
    { name: "Home", href: "/" },
    { name: "Gallery", href: "/gallery" },
    { name: "Projects", href: "/projects" },
    { name: "Events", href: "/events" },
    { name: "Team", href: "/team" },
    { name: "Inventory", href: "/inventory/", external: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass backdrop-blur-md border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full"></div>
            </div>
            <span className="text-xl font-heading font-bold gradient-text-primary">
              Electronics Hobby Club
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) =>
              item.external || item.href.startsWith("/#") ? (
                <a
                  key={item.name}
                  href={item.href}
                  className="relative text-foreground hover:text-primary transition-colors duration-300 group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full"></span>
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="relative text-foreground hover:text-primary transition-colors duration-300 group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden bg-transparent">
            <Button
              // variant="ghost"
              size="icon"
              className="bg-transparent"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden glass backdrop-blur-md border-t border-primary/20 animate-slide-up">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) =>
              item.external || item.href.startsWith("/#") ? (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
