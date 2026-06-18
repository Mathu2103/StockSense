import { Link } from 'react-router-dom';

export default function PublicFooter() {
  return (
    <footer className="relative bg-[#004c22] text-white overflow-hidden w-full border-t border-[#10b981]/20">
      {/* Decorative Floating Shapes */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-white/5 blur-[100px] rounded-full pointer-events-none animate-float-1"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-white/5 blur-[120px] rounded-full pointer-events-none animate-float-2"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Column 1: StockSense Branding */}
          <div className="space-y-4">
            <div className="text-2xl font-black tracking-tight flex items-center gap-2 text-white">
              <span className="material-symbols-outlined text-white text-3xl">inventory_2</span>
              StockSense
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider leading-relaxed">
              Predictive Inventory &amp; Sales Intelligence Platform
            </h4>
            <p className="text-sm text-white leading-relaxed max-w-sm">
              Helping supermarkets optimize inventory, monitor sales performance, and make smarter business decisions through data-driven insights.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-5 lg:pl-8">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="space-y-3">
              {['Home', 'Products', 'Discounts', 'About Us'].map((link, i) => (
                <li key={i}>
                  <Link to={link === 'Home' ? '/' : `/${link.toLowerCase().replace(' ', '-')}`} className="text-sm text-white hover:text-white/80 hover:translate-x-1 inline-block transition-all duration-300">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Key Features */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Key Features</h4>
            <ul className="space-y-3">
              {['Demand Forecasting', 'Inventory Monitoring', 'Smart Discounting', 'Combo Recommendations', 'Sales Analytics'].map((feature, i) => (
                <li key={i}>
                  <a href="#" className="text-sm text-white hover:text-white/80 hover:translate-x-1 inline-block transition-all duration-300">
                    {feature}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Information */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Contact Information</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[16px] text-white">mail</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white uppercase font-bold tracking-widest mb-0.5">Email</span>
                  <a href="mailto:thineshkumar12@gmail.com" className="text-sm text-white hover:text-white/80 transition-colors">thineshkumar12@gmail.com</a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[16px] text-white">call</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white uppercase font-bold tracking-widest mb-0.5">Phone</span>
                  <a href="tel:0774847867" className="text-sm text-white hover:text-white/80 transition-colors">0774847867</a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[16px] text-white">location_on</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white uppercase font-bold tracking-widest mb-0.5">Location</span>
                  <span className="text-sm text-white">HospitalRoad,Mannar, Sri Lanka</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white font-medium tracking-wide">
            &copy; 2026 StockSense. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-white hover:text-white/80 transition-colors font-medium tracking-wide">Privacy Policy</a>
            <a href="#" className="text-xs text-white hover:text-white/80 transition-colors font-medium tracking-wide">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
