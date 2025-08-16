import React from 'react';
import { CheckCircle } from 'lucide-react';

const ProcessSection = () => {
  const steps = [
    "Opret en gratis profil på få klik",
    "List dine ydelser og sæt dine egne priser – intet CVR-krav",
    "Prøv platformen uden forpligtelse i 3 måneder, før du beslutter dig",
    " Bliv fundet af lokale kunder og vælg kun de opgaver, du vil tage"
  ];

  return (
    <section className="bg-white text-black py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-5xl font-bold  mb-4">
            Det har aldrig været nemmere
          </h2>
          <h3 className="text-3xl lg:text-5xl font-bold  mb-8">at komme i gang!</h3>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Alle service udbydere kan tilmelde sig gratis i 3
            måneder uden binding! Prøv det nu imens vi
            stadig har tilbuddet.
          </p>
        </div>

        <div className="bg-[#dc44bb] text-white p-8 rounded-2xl mb-12">
          <h3 className="text-2xl font-bold mb-6">Sådan fungerer det</h3>
          <p className="text-lg mb-6">
           Opret en gratis profil Bliv fundet af lokale kunder
            og book dem du har plads til ind i din kalender
          </p>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-white" />
                <span className="text-lg">{step}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ProcessSection;
