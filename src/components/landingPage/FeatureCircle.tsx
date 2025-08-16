import React from 'react';

const FeatureCircle = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          {/* Image instead of pink circle */}
          <div className="lg:w-1/2 w-full ">
            <img
              src="/pro.jpg"
              alt="Promotion"
              className="w-full h-auto object-cover rounded-"
            />
          </div>

          {/* Text features section */}
          <div className="lg:w-1/2 w-full">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Gør din hobby til en indtægtskilde
              </h3>
              <p className="text-lg text-gray-700">
                Få synlighed, nye kunder og byg dit eget brand – helt uden CVR.
              </p>
              <button className="bg-[#ff00c8] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#ff45d7] transition-colors">
                Kom i gang
              </button>

              <div className="pt-6">
                <h4 className="font-semibold text-gray-900">Kontakt os</h4>
                <p className="text-gray-600">
                  Har du spørgsmål? Skriv til os på <br />
                  <strong>info@hobbiies.dk</strong>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeatureCircle;
