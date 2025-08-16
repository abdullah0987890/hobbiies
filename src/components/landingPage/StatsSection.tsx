import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StatsSection = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const animationRef = useRef<number | null>(null);

  const categories = [
 'Hundeluftning',
  'Husrengøring',
  'VVS',
  'Elektriker',
  "terapeut",
  "massage terapeut",
  'Havearbejde',
  'Undervisning',
  'Dyrepasser',
  'Handyman',
  'Skønhedsservices'
  ];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const speed = 0.8;

    const scroll = () => {
      if (!scrollContainer || isHovered) return;

      scrollContainer.scrollLeft += speed;

      // Reset when first set has fully scrolled out
      if (
        scrollContainer.scrollLeft >=
        scrollContainer.scrollWidth / 2
      ) {
        scrollContainer.scrollLeft = 0;
      }

      animationRef.current = requestAnimationFrame(scroll);
    };

    animationRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovered]);

  return (
    <section className="bg-white text-black py-16 w-full">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-5xl font-bold mb-4">
          Over 30 Kategorier
        </h2>

        <div className="mt-10">
          {/* Auto-scrolling horizontal category list */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 px-2 py-4 scrollbar-hide w-full"
            style={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Duplicate list for smooth loop */}
            {[...categories, ...categories].map((category, index) => (
              <button
                key={index}
                onClick={() => navigate("/services")}
                className="flex-shrink-0 bg-[#dc44bb] text-white px-6 py-2 hover:text-black rounded-full hover:bg-gray-100 transition-colors font-medium"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
