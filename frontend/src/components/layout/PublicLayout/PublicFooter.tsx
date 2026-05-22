export default function PublicFooter() {
  return (
    <footer className="bg-tertiary text-tertiary-fixed full-width border-t border-outline-variant/30">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-12 max-w-7xl mx-auto gap-8">
        <div className="text-center md:text-left space-y-2">
          <div className="text-2xl font-bold text-surface-container-lowest">StockSense</div>
          <p className="text-sm text-tertiary-fixed-dim/70 max-w-xs leading-relaxed">
            © 2026 StockSense. All rights reserved. Retail Intelligence for the modern era.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="text-tertiary-fixed-dim/70 text-xs hover:underline decoration-secondary-fixed transition-all" href="#">
            Privacy Policy
          </a>
          <a className="text-tertiary-fixed-dim/70 text-xs hover:underline decoration-secondary-fixed transition-all" href="#">
            Terms of Service
          </a>
          <a className="text-tertiary-fixed-dim/70 text-xs hover:underline decoration-secondary-fixed transition-all" href="#">
            Cookie Policy
          </a>
          <a className="text-tertiary-fixed-dim/70 text-xs hover:underline decoration-secondary-fixed transition-all" href="#">
            Contact Support
          </a>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer text-surface-container-lowest">
            <span className="material-symbols-outlined text-[20px]">public</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer text-surface-container-lowest">
            <span className="material-symbols-outlined text-[20px]">share</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
