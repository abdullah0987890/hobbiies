""// src/pages/ServiceDetail.tsx

import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, Mail } from 'lucide-react';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { handleContactClick } from '@/lib/utils';
import { RatingForm } from '@/components/RatingForm';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import RecentWorksCard from '@/components/RecentWorks';
import ChatCard from '@/components/ChatCard';

interface Service {
  providerId: string;
  id: string;
  name: string;
  images: string[];
  providerImageUrl?: string;
  serviceName: string;
  description: string;
  longDescription: string;
  rating: number;
  postalCode: string;
  location: string;
  price: string;
  priceDetails: string;
  availability: string;
  experience: string;
  contactEmail: string;
  contactPhone?: string;
}

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchService = async () => {
      try {
        const docRef = doc(db, 'services', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setService({ id: docSnap.id, ...docSnap.data() } as Service);
        } else {
          console.log('Dokument findes ikke!');
        }
      } catch (error) {
        console.error('Fejl ved hentning af dokument:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex justify-center">
        <Card className="w-full max-w-2xl overflow-hidden">
          <Skeleton className="h-64 sm:h-80 w-full" />
          <CardContent className="p-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Service ikke fundet</h1>
          <p className="text-gray-600">Tjenesten du leder efter findes ikke.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 flex flex-col items-center space-y-6 px-4">
      {/* Header Card */}
      <Card className="w-full max-w-2xl overflow-hidden">
        <div className="relative">
          <Carousel className="w-full h-64 sm:h-80">
            <CarouselContent>
              {service.images?.map((img, idx) => (
                <CarouselItem key={idx} className="w-full h-64 sm:h-80">
                  <img src={img} alt={`Service billede ${idx + 1}`} className="w-full h-full object-cover" />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="absolute top-4 right-4">
            <Badge className="bg-pink-500 text-white px-3 py-1">{service.serviceName}</Badge>
          </div>
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
              <AvatarImage src={service.providerImageUrl} alt={service.name} />
              <AvatarFallback className="text-2xl">{service.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <CardContent className="p-6 pt-16">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
              <div className="flex items-center space-x-4 text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-pink-500" />
                  <span>{service.location} ({service.postalCode})</span>
                </div>
                {service.rating > 0 ? (
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(service.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-1">({service.rating.toFixed(1)})</span>
                  </div>
                ) : (
                  <span className="text-gray-500 italic">Ingen vurderinger endnu</span>
                )}
              </div>
            </div>
            <div className="text-right mt-4 sm:mt-0">
              <div className="text-2xl font-bold text-gray-900 mb-1">{service.price}</div>
              <div className="text-sm text-gray-600">{service.priceDetails}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Om mig */}
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Om mig</h2>
          <p className="text-gray-600 whitespace-pre-wrap break-words">{service.longDescription}</p>
        </CardContent>
      </Card>

      {/* Service detaljer */}
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Serviceoplysninger</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Erfaring</h3>
              <p className="text-gray-600">{service.experience}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Tilgængelighed</h3>
              <p className="text-gray-600">{service.availability}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <RecentWorksCard userId={service.providerId}/>
     
      <ChatCard providerId={service.providerId}/>

      {/* Bedømmelse */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <h3 className="text-lg font-semibold">Bedøm denne udbyder</h3>
        </CardHeader>
        <CardContent>
          <RatingForm providerId={service.providerId} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceDetail;
