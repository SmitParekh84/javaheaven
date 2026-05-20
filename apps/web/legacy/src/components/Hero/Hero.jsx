import React, { useEffect, useState } from 'react';
import WidgetOffer from './WidgetOffer';
import TypeMenu from './TypeMenu';
import Recommend from '../Pages/Recommend';
import AboutCard from '../Pages/AboutCard';

export default function Hero() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time (you can replace this with real data fetching)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer); // Clean up the timer
  }, []);



  return (
    <div className="bg-primary-foreground font-spartan ">
      <div className="relative isolate px-8 lg:px-8 z-0">
        {/* Demo Message */}
        {/* Demo Message */}
        <div className="bg-yellow-100 text-center p-4 rounded-md mb-6 border border-yellow-300">
          <p className="text-lg font-bold text-yellow-900">
            This is a demo coffee shop website!
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            Want a website like this? Contact{' '}
            <a
              href="mailto:business.smitp@gmail.com"
              className="text-yellow-800 underline hover:text-yellow-900"
            >
              business.smitp@gmail.com
            </a>
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            Visit my portfolio at{' '}
            <a
              href="https://www.smitparekh.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-800 underline hover:text-yellow-900"
            >
              www.smitparekh.studio
            </a>
          </p>
        </div>



        <WidgetOffer />
        <TypeMenu />
        <Recommend />
        <AboutCard />

      </div>
    </div >
  );
}
