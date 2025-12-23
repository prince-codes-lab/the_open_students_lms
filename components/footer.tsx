import Link from "next/link"
import { Instagram, Twitter, Youtube, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#4E0942] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#FEEB00] rounded-full flex items-center justify-center">
                <span className="text-[#4E0942] font-bold text-lg">TOS</span>
              </div>
              <div>
                <div className="font-bold text-lg">The OPEN Students</div>
                <div className="text-[#FEEB00] text-xs">Beyond the Classroom</div>
              </div>
            </div>
            <p className="text-sm text-white/80">
              Empowering African and Asian youth through digital courses, mentorship, and educational tours.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#FEEB00]">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#about" className="text-sm hover:text-[#FEEB00] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/programs" className="text-sm hover:text-[#FEEB00] transition-colors">
                  Programs
                </Link>
              </li>
              <li>
                <Link href="/tours" className="text-sm hover:text-[#FEEB00] transition-colors">
                  Tours
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-sm hover:text-[#FEEB00] transition-colors">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#FEEB00]">Our Programs</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>Writing</li>
              <li>Graphics Design</li>
              <li>Video Editing</li>
              <li>Public Speaking</li>
              <li>Leadership</li>
              <li>Storytelling</li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#FEEB00]">Connect With Us</h3>
            <div className="flex gap-4 mb-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-[#FF2768] rounded-full flex items-center justify-center transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-[#FF2768] rounded-full flex items-center justify-center transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-[#FF2768] rounded-full flex items-center justify-center transition-colors"
              >
                <Youtube size={20} />
              </a>
              <a
                href="mailto:info@theopenstudents.com"
                className="w-10 h-10 bg-white/10 hover:bg-[#FF2768] rounded-full flex items-center justify-center transition-colors"
              >
                <Mail size={20} />
              </a>
            </div>
            <p className="text-sm text-white/80">info@theopenstudents.com</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 pt-8 text-center text-sm text-white/60">
          <p>&copy; {new Date().getFullYear()} The OPEN Students. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
