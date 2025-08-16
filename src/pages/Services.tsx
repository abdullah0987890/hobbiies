import { useState, useEffect, useRef } from 'react';
import SearchBar from '../components/SearchBar';
import ServiceCard from '../components/ServiceCard';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { geocodePostalCodeWithFallback } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import ServicesMap, { Service as MapService } from '@/components/ServicesMap';
import { List, Map as MapIcon, AlertCircle } from 'lucide-react';

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
  lat?: number;
  lng?: number;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geocodingProgress, setGeocodingProgress] = useState({ current: 0, total: 0 });
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isSearchBarFixed, setIsSearchBarFixed] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setError(null);
        setIsLoading(true);

        console.log('Fetching services from Firebase...');
        const servicesCollection = collection(db, "services");
        const q = query(servicesCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const docs = querySnapshot.docs;
        console.log(`Found ${docs.length} services`);

        if (docs.length === 0) {
          setServices([]);
          setFilteredServices([]);
          setIsLoading(false);
          return;
        }

        // Initialize progress
        setGeocodingProgress({ current: 0, total: docs.length });

        // Process services with proper error handling and rate limiting
        const servicesData: Service[] = [];
        
        for (let i = 0; i < docs.length; i++) {
          const doc = docs[i];
          const data = doc.data() as Omit<Service, 'id' | 'lat' | 'lng'>;
          
          try {
            // Update progress
            setGeocodingProgress({ current: i + 1, total: docs.length });
            
            console.log(`Geocoding service ${i + 1}/${docs.length}: ${data.postalCode}`);
            
            // Add delay between requests to respect rate limits (except for first)
            if (i > 0) {
              await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay
            }
            
            // Get coordinates with fallback
            const coords = await geocodePostalCodeWithFallback(data.postalCode);
            
            servicesData.push({
              ...data,
              id: doc.id,
              lat: coords.lat,
              lng: coords.lng,
            });

            console.log(`✓ Geocoded ${data.postalCode}: ${coords.lat}, ${coords.lng}`);
            
          } catch (geocodeError) {
            console.warn(`Failed to geocode ${data.postalCode}, using fallback coordinates:`, geocodeError);
            
            // Use default coordinates for Denmark
            servicesData.push({
              ...data,
              id: doc.id,
              lat: 56.2639, // Center of Denmark
              lng: 9.5018,
            });
          }
        }

        console.log(`✓ Successfully processed ${servicesData.length} services`);
        setServices(servicesData);
        setFilteredServices(servicesData);

      } catch (error) {
        console.error("Error fetching services:", error);
        setError(error instanceof Error ? error.message : "Failed to load services. Please try again later.");
      } finally {
        setIsLoading(false);
        setGeocodingProgress({ current: 0, total: 0 });
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerBottom = headerRef.current.offsetTop + headerRef.current.offsetHeight;
        const scrollY = window.scrollY;
        setIsSearchBarFixed(scrollY > headerBottom - 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (filters: { category: string; postalCode: string; keyword: string }) => {
    let filtered = services;

    if (filters.category && filters.category !== 'Alle kategorier') {
      filtered = filtered.filter(service =>
        String(service.category).toLowerCase().trim() === filters.category.toLowerCase().trim()
      );
    }

    if (filters.postalCode) {
      filtered = filtered.filter(service =>
        service.postalCode.includes(filters.postalCode)
      );
    }

    if (filters.keyword) {
      filtered = filtered.filter(service =>
        service.serviceName.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        service.description.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        service.name.toLowerCase().includes(filters.keyword.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  };

  const mapServices: MapService[] = filteredServices.map(service => ({
    id: service.id,
    images: service.images[0] ? [service.images[0]] : ['/placeholder.jpg'],
    price: service.price,
    name: service.name,
    serviceName: service.serviceName,
    description: service.description,
    postalCode: service.postalCode,
    lat: service.lat,
    lng: service.lng,
  }));

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Noget gik galt</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Prøv igen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Fixed Search Bar - Animated */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-lg transition-all duration-500 ease-in-out ${
        isSearchBarFixed ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* Hero Header */}
      <div 
        ref={headerRef}
        className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-300 text-white py-12 sm:py-20 lg:py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">Find lokale tjenester</h1>
          <div className="mt-8">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Mobile View Toggle */}
        <div className="lg:hidden flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tilgængelige tjenester</h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={16} />
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MapIcon size={16} />
              Map
            </button>
          </div>
        </div>

        {/* Desktop Title */}
        <div className="hidden lg:block mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">tilgængelige tjenester</h2>
        </div>

        {/* Loading Progress */}
        {isLoading && geocodingProgress.total > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">
                Indlæser services og placering...
              </span>
              <span className="text-sm text-blue-600">
                {geocodingProgress.current}/{geocodingProgress.total}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${(geocodingProgress.current / geocodingProgress.total) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        )}

        {isLoading ? (
          // Loading State
          <div className="lg:grid lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-4">
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-80 w-full rounded-lg" />
                ))}
              </div>
            </div>
            <div className="hidden lg:block lg:col-span-8">
              <Skeleton className="h-[600px] w-full rounded-lg" />
            </div>
          </div>
        ) : filteredServices.length > 0 ? (
          <>
            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6">
              {/* Services Column - Scrollable */}
              <div className="lg:col-span-4">
                <div className="max-h-[800px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {filteredServices.map((service) => (
                    <div key={service.id} className="w-full">
                      <ServiceCard {...service} />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Map Column - Fixed */}
              <div className="lg:col-span-8">
                <div className="sticky top-24">
                  <ServicesMap services={mapServices} />
                </div>
              </div>
            </div>

          {/* Mobile Layout */}
<div className="lg:hidden">
  {viewMode === 'list' ? (
    <div className="space-y-6">
      {filteredServices.map((service) => (
        <ServiceCard key={service.id} {...service} />
      ))}
    </div>
  ) : (
    <div className="relative h-screen -mx-4 sm:-mx-6">
      {/* Full Screen Map Background */}
      <div className="absolute inset-0 z-0">
        <ServicesMap services={mapServices} />
      </div>

      {/* Floating Horizontal Cards on Map Bottom */}
      <div className="absolute bottom-4 left-0 right-0 z-10 px-4">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent scroll-snap-x-mandatory">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="min-w-[280px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 snap-start"
            >
              <ServiceCard {...service} />
            </div>
          ))}
        </div>
      </div>

      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setViewMode('list')}
          className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all"
        >
          <List size={20} className="text-gray-700" />
        </button>
      </div>

      {/* Service Count Indicator */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-pink-600 text-white px-3 py-2 rounded-full text-sm font-semibold shadow-lg">
          {filteredServices.length} services
        </div>
      </div>
    </div>
  )}
</div>

          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen tjenester fundet.</h3>
            <p className="text-gray-500">Prøv at justere dine søgekriterier eller tilføj den første tjeneste.</p>
          </div>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
          .scroll-snap-x-mandatory {
            scroll-snap-type: x mandatory;
          }
          .snap-start {
            scroll-snap-align: start;
          }

        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background-color: #f3f4f6;
          border-radius: 3px;
        }
        .scrollbar-thumb-white\\/30::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default Services;