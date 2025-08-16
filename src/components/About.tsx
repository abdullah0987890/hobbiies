import { Card, CardContent, CardHeader } from '@/components/ui/card';

const About = () => {
  return (
    <Card className="max-w-3xl mx-auto my-8">
      <CardHeader>
        <h2 className="text-2xl font-bold text-pink-600">Hobby i dag, Business i morgen</h2>
      </CardHeader>
      <CardContent className="space-y-4 text-gray-700 leading-relaxed">
        <p>
          <strong>Hobbiies</strong> er en game changer for dig, der har en hobby og drømmer om at gøre den til din levevej. Nå ud til tusindvis gennem en simpel platform, hvor synlighed og markedsføring håndteres af professionelle.
        </p>

        <p>
          <strong>Vi kender udfordringen.</strong><br />
         Du har en passion, du er dygtig til det, du laver – men det kan være svært at tiltrække nye kunder, især hvis du ikke har et CVR-nummer eller er synlig på Google.
        </p>

        <p>
          <strong>Derfor skabte vi Hobbiies.</strong><br />
          En simpel platform, hvor passionerede – som dig – kan nå ud til tusindvis af kunder uden besvær. Du opretter bare en profil, tilføjer dine tjenester og billeder, og vi gør dig synlig for dem, der leder efter præcis det, du tilbyder.
        </p>

        <p>
          Samtidig gør vi det nemt for kunder at finde dig – med søgning, filtre og kortvisning. Vores vision? At samle alle de skjulte talenter ét sted – og forbinde dem med dem, der har brug for dem.
        </p>
      </CardContent>
    </Card>
  );
};

export default About;
