import { useEffect, useState } from 'react';

export default function AboutUsPage() {
  const [showPopup, setShowPopup] = useState(false);

  // To handle the page load animation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-32 pt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Main Hero Section */}
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-12 lg:gap-8 mb-32">
          
          {/* 1. Image Column */}
          <div className="w-full lg:w-[35%] flex-shrink-0">
            <div className="w-full h-[500px] rounded-3xl overflow-hidden shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" 
                alt="Store Manager" 
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* 2. Text Column */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center py-8">
            <span className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Chamson Multi Shop
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-6 tracking-tight">
              Thinesh kumar
            </h1>
            <p className="text-gray-500 leading-relaxed text-sm md:text-base mb-6">
              Located on Hospital Road in Mannar, Chamson Multi Shop has been a growing part of our community. As our business expands, we are dedicated to upgrading our operations to provide faster, more efficient, and accurate service. Our goal is to enhance our inventory management and offer the best shopping experience for our customers, ensuring a seamless and modern retail environment.
            </p>
          </div>

          {/* 3. Vertical Text Column */}
          <div className="hidden lg:flex w-[15%] flex-col items-center justify-center relative">
            <div 
              className="text-5xl xl:text-6xl font-extrabold text-[#111827] tracking-tighter"
              style={{ writingMode: 'vertical-rl' }}
            >
              {/* In vertical-rl, block elements flow from right to left. 
                  So 'The Humans' is rendered first (on the right), 
                  and 'We Serve' is rendered second (on the left). */}
              <div className="ml-4 leading-[1.2]">
                The <span className="relative inline-block z-10">Hu<span className="relative inline-block z-10">man
                  {/* Theme Circle decoration */}
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-[12px] border-primary rounded-full -z-10"></span>
                </span></span>
              </div>
              <div className="leading-[1.2]">We Serve</div>
            </div>
          </div>
          
        </div>
        {/* Team Section (StockSense Developers) */}
        <div className="max-w-4xl mx-auto text-center mt-20 mb-10">
          <span className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 inline-block">
            Our Team
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-8 tracking-tight leading-tight">
            Bonded by our passion for <br className="hidden md:block" /> technology and retail intelligence
          </h2>
          <p className="text-gray-500 leading-relaxed text-sm md:text-base mb-10 max-w-2xl mx-auto">
            We are CST Students – Group 03 from Uva Wellassa University. We take pride in building StockSense, a predictive inventory and sales intelligence platform designed to empower local businesses like Chamson Multi Shop with smart insights, efficient operations, and meaningful growth.
          </p>
          <button 
            onClick={() => setShowPopup(true)}
            className="bg-primary text-white px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity shadow-md"
          >
            Join Our Team
          </button>
        </div>

        {/* New Map Section */}
        <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto mt-24 mb-10">
          <div className="w-full md:w-1/2 text-left">
            <span className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 inline-block">
              Our Team
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] mb-6 tracking-tight leading-tight">
              Defined by our technical roots, we're on a mission to reimagine the world of retail.
            </h2>
            <p className="text-gray-500 leading-relaxed text-sm md:text-base">
              StockSense is being developed right here in Sri Lanka. Our team is dedicated to supporting businesses across the country, starting with our collaboration in the Mannar District. We're always looking for innovative ways to bridge the gap between technology and local commerce. Click the button above to see our developer details!
            </p>
          </div>
          <div className="w-full md:w-1/2">
            <div className="w-full h-80 bg-gray-100 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <iframe 
                src="https://maps.google.com/maps?q=Chamson+Multi+Shop,+Hospital+Road,+Mannar&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700"
                allowFullScreen={false} 
                loading="lazy" 
                title="Chamson Multi Shop Location"
              ></iframe>
            </div>
          </div>
        </div>

      </div>

      {/* Developer Info Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary text-2xl">code</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Developer Information</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Want to collaborate or learn more about the technical architecture of StockSense? Reach out to our development team.
            </p>
            
            <div className="space-y-5 text-sm text-gray-700 bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="mt-0.5">
                  <span className="material-symbols-outlined text-primary text-xl">school</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 mb-0.5">Uva Wellassa University</p>
                  <p className="text-gray-500">Department of Computer Science and Technology</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary text-xl">groups</span>
                <p className="font-medium text-gray-900">CST Students – Group 03</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary text-xl">mail</span>
                <p className="font-mono text-primary font-medium">developers@stocksense.uwu.ac.lk</p>
              </div>
            </div>

            <button 
              onClick={() => setShowPopup(false)}
              className="w-full mt-8 bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
