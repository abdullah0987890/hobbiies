import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ServiceCard from "@/components/ServiceCard";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase"; 

interface Service {
  id: string;
  name: string;
  images: string[];
  providerImageUrl?: string;
  serviceName: string;
  description: string;
  rating: number;
  postalCode: string;
  price: string;
  category: string;
}

export default function PopularServicesCarousel() {
  const [popularServices, setPopularServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      const snapshot = await getDocs(collection(db, "services"));
      const allServices = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];

      const topRated = allServices.filter((s) => s.rating >= 4.5);
      setPopularServices(topRated);
    };

    fetchServices();
  }, []);

  if (popularServices.length === 0) return null;

  return (
    <section className="py-12 px-4 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6 text-center">populære tjenester</h2>

      <Carousel opts={{ align: "start" }} className="w-full max-w-6xl mx-auto">
        <CarouselContent>
          {popularServices.map((service) => (
            <CarouselItem key={service.id} className="basis-80 sm:basis-96 lg:basis-[30%]">
              <ServiceCard {...service} />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
}
