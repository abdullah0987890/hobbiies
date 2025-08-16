import { Facebook, Instagram } from 'lucide-react';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className=''>
            <h4 className="font-semibold text-gray-900 mb-4">Links</h4>
            <ul className="space-x-2 text-gray-600 flex flex-row items-start">
              <li><a href="https://www.instagram.com/hobbiies.dk/?igsh=YzFycWd1bTE4aWlu#" className="hover:text-gray-900 transition-colors"><Instagram/></a></li>
              <li><a href="https://www.facebook.com/people/Hobbiies/61576046263485/#" className="hover:text-gray-900 transition-colors"><Facebook/></a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Kontakt</h4>
            <ul className="space-y-2 text-gray-600">
              <li>info@hobbiies.dk</li>
              <li>+45 26353039</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Juridisk</h4>
            <ul className="space-y-2 flex flex-col text-gray-600">
              <a href="/resources/images/PrivacyPolicyDK.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">Privacy Policy(DK)</a>
              <a href="/resources/images/PrivacyPolicyEN.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">Privacy Policy(EN)</a>
              <a href="/resources/images/T&CHobbiiesDK.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">Terms of use(DK)</a>
              <a href="/resources/images/T&CHobbiiesEN.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">Terms of use(EN)</a>
            </ul>
          </div>
          

        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
          <p>© 2024 Hobbiies  - Bygger verden af locals</p>
          <div className="flex justify-center space-x-4 mt-4">
              <a href="/resources/images/PrivacyPolicyEN.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">Privacy Policy(EN)</a>
              <a href="/resources/images/T&CHobbiiesEN.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">Terms of use(EN)</a>
            <a href="#" className="hover:text-gray-900 transition-colors">CVR: 43845831</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;