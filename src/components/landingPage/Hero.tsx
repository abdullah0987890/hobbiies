import { Link } from 'react-router-dom';
import React from 'react';

const cards = [
  {
    title: '@Husrengøring',
    price: '199 DKK',
    image: '/infulencer.jpg',
    description: 'per post',
  },
  {
    title: '@Elektriker',
    price: '199 DKK',
    image: '/infulencer2.jpg',
    description: 'per post',
  },
  // Repeat to ensure smooth infinite scrolling
  {
    title: '@Undervisning',
    price: '199 DKK',
    image: '/infulencer.jpg',
    description: 'per post',
  },
  {
    title: '@Dyrepasser',
    price: '199 DKK',
    image: '/infulencer2.jpg',
    description: 'per post',
  },
   {
    title: '@Handyman',
    price: '199 DKK',
    image: '/infulencer2.jpg',
    description: 'per post',
  },
];

const Hero = () => {
  return (
    <section className="bg-gray-50 py-16 lg:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-8">
            Find services
            i nærheden af dig eller tilmed dig som
            udbyder og bliv fundet af tusindvis i dit
            lokalområde
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="bg-[#ff00c8] text-white px-8 py-3 rounded-full hover:bg-[#ff45d7] transition-colors">
              <a href="/signup">Tilmeld dig her</a>
            </button>
          </div>

          {/* Infinite Card Slider */}
          <div className="relative w-full overflow-hidden">
            <div className="flex gap-8 animate-scroll whitespace-nowrap">
              {cards.map((card, index) => (
                <Link
                  to="/services"
                  key={index}
                  className="block min-w-[250px] sm:min-w-[280px] max-w-[280px]"
                >
                  <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-16 h-16 object-cover rounded-full"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {card.title}
                    </h3>
                    <div className="text-[#ff00c8] font-bold text-xl">
                      {card.price}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {card.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Animation Style */}
      <style>
        {`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        `}
      </style>
    </section>
  );
};

export default Hero;
