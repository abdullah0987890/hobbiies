
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import About from '@/components/About';

const FAQ = () => {
const faqs = [
  {
    question: "Hvad koster det?",
    answer: "Hobbiies er gratis den første måned, hvor du kan sætte din profil op med priser, beskrivelser og de bedste billeder, så du bliver synlig for de kunder, der besøger platformen. Herefter koster det 199 kr. om måneden. Du vurderer selv, om du får nok kunder til at blive ved med at være en del af konceptet — der er ingen fast binding."
  },
  {
    question: "Hvordan tjener jeg penge på det?",
    answer: "Kunderne sender dig en besked på platformen, og I aftaler en pris, når de kommer. Du skriver prisen på platformen, i vores prisliste funktion dine kunder kan se den med det samme. Du modtager alle pengene selv — de går direkte i din egen lomme. Hobbiies har ikke noget med betalingen mellem dig og dine kunder at gøre."
  },
  {
    question: "Hvordan kontakter kunderne mig?",
    answer: "Kunderne sender dig en besked i appen, og I aftaler en tid. Dermed kan du altid tilpasse dine tider, så de passer dig."
  },
  {
    question: "Er Hobbiies sikkert?",
    answer: "Alle på Hobbiies tilmelder sig med en e-mail og opretter en offentlig profil. Du kan læse anmeldelser, se andres oplevelser og rapportere mistænkelig aktivitet. Der er ingen komplicerede booking-processer eller betalinger — det handler om ægte, ærlige forbindelser."
  },
  {
    question: "Hvor stor synlighed får jeg hvis jeg tilmelder mig?",
    answer: "Platformen starter med at nå ud til ca. 3 millioner danskere. Derfor har du gode muligheder for at blive set på platformen og øge din indtjening."
  },
  {
    question: "Tager Hobbiies sig af mine skatter og indberetter min indtjening?",
    answer: "Nej. Hobbiies fungerer som et socialt netværk – du opretter en profil og har direkte kontakt med dine kunder. Vi håndterer hverken bookinger, betalinger eller transaktioner, og har derfor ingen indsigt i, hvad der foregår mellem dig og dine kunder. Din privatliv respekteres, og det er dit eget ansvar at stå for eventuel registrering og indberetning til skattemyndighederne."
  },
  {
    question: "Skal jeg have et CVR-nummer for at bruge Hobbiies?",
    answer: "Nej! Hobbiies er perfekt, hvis du ikke har et CVR endnu. Du kan bruge platformen til at teste dine services, få kunder og bygge erfaring op – helt uden at skulle investere penge fra starten. Og hvis du allerede har et CVR og bare mangler synlighed? Så er du selvfølgelig også velkommen. Hobbiies er for alle – uanset hvor langt du er i din rejse."
  },
  {
    question: "Kan Hobbiies se, hvad jeg tjener eller skriver med kunder?",
    answer: "Nej. Vi har hverken adgang til dine betalinger eller beskeder. Hobbiies er bare platformen, der forbinder jer – alt det andet holder vi os ude af."
  },
  {
    question: "Hvad kan andre se om mig?",
    answer: "Kun dit brugernavn eller profilnavn er synligt. Din e-mail og andre private oplysninger bliver ikke vist. Du kan selv vælge, om du vil tilføje links til dine sociale medier for at vise mere af dit arbejde."
  },
  {
    question: "Binder jeg mig til noget, når jeg opretter mig?",
    answer: "Overhovedet ikke. Du kan til enhver tid opsige dit abonnement. Det er forudbetalt måned for måned – du bliver kun, hvis du har lyst."
  },
  {
    question: "Hvor gammel skal man være for at bruge Hobbiies?",
    answer: "Du skal være mindst 14 år for at oprette en profil på Hobbiies."
  }
];



  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ofte Stillede Spørgsmål
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find svar på almindelige spørgsmål om brugen af ServiceConnect til at finde lokale tjenester eller tilbyde dine egne.
          </p>
        </div>
        <About/>

        {/* FAQ Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Ofte Stillede Spørgsmål</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left hover:text-red-600">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
        
        {/* Kontakt Sektion */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Stadig spørgsmål?
              </h2>
              <p className="text-gray-600 mb-6">
                Kan du ikke finde det svar, du leder efter? Vores supportteam står klar til at hjælpe dig.
              </p>
              <TooltipProvider>
                <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                  
                  {/* Email Support med Tooltip */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href="mailto:info@hobbiies.dk"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                      >
                        Send os en e-mail
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      info@hobbiies.dk
                    </TooltipContent>
                  </Tooltip>

                  {/* Ring til os med Tooltip */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href="tel:+4530504050"
                        className="inline-flex items-center px-6 py-3 border border-red-300 text-base font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors"
                      >
                        Ring til os
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      +45 30 50 40 50
                    </TooltipContent>
                  </Tooltip>

                </div>
              </TooltipProvider>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default FAQ;
