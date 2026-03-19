import { Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/40 py-10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="font-bold text-gradient">Toolz</span>
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Toolz. All rights reserved.
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Privacy Policy
          </a>
          <a
            href="https://github.com/freroxx/toolz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
