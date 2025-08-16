import React from 'react';
import { Check } from 'lucide-react';
import { redirect } from 'react-router-dom';

const PricingSection = () => {
  const essentialFeatures = [
    " Direkte kontakt mellem dig og kunden",
    "Ingen kommission til Hobbiies kun et fast månedsabonnement",
    "Fuld kontrol over, hvilke kunder og opgaver du siger ja til",
    "Hobbiies har ingen indsigt i din omsætning", 
    "bliv set af flere tusinde besøgende hver dag",
    "Få kalenderen fyldt uden besvær – vi skaffer henvendelserne",
    "ingen binding – opsig når som helst",
    "Intet CVR-krav – alle hobbyister er velkomne"
  ];

  const doneForYouFeatures = [
    "Alt i Essential plan",
    "Storyboard influencer-marketing",
    "Medieplanlægning og vurdering af creators",
    "Rettet kampagne-og creators",
    "Løbende administreret af bureau"
  ];

  return (
    <section className="bg-white text-black py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block bg-[#ff00c8] text-white px-4 py-2 rounded-full mb-4">
           Til Service udbydere
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">
           Slip for timevis af
          </h2>
          <h3 className="text-3xl lg:text-5xl font-bold mb-8">
            jagt
          efter nye  kunder
          </h3>
        </div>

        <div className="grid lg:grid-cols-1 gap-8 max-w-6xl mx-auto">
          <div className="bg-[#ff00c8] text-white p-8 rounded-2xl">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Intro tilbud</h3>
              <div className="text-4xl font-bold mb-4">3 md gratis – Derefter kun 199  <span className="text-xl">dk. md</span></div>
              <button  className="w-full bg-white text-black py-3 rounded-full font-semibold  transition-colors">
            Prøv helt gratis nu!
              </button>
            </div>
            
            <ul className="space-y-3">
              {essentialFeatures.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;