import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import ServiceCard from '@/components/ServiceCard';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Service {
  id: string;
  name?: string;
  serviceName: string;
  description: string;
  rating?: number;
  price: string;
  postalCode?: string;
  category?: string;
  images: string[];
  providerImageUrl?: string;
}

const MyServices = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchServices = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'services'),
          where('providerId', '==', user.id)
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Service, 'id'>),
        }));
        setServices(fetched);
      } catch (err) {
        console.error('Failed to fetch services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [user]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteDoc(doc(db, 'services', deleteTarget.id));
      setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      await addDoc(collection(db, 'notifications'), {
          message: `Du har slettet en tjeneste ${deleteTarget.name}.`,
          providerId: user.id,
          timestamp: serverTimestamp(),
        });

      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  };

  if (loading) {
    return <p className="text-center py-10">Loading your services...</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {services.length > 0 ? (
  services.map((service) => (
    <div key={service.id} className="flex flex-col space-y-2">
      <ServiceCard
        id={service.id}
        name={service.name}
        images={service.images?.length ? service.images : []} // ✅ FIXED
        providerImageUrl={service.providerImageUrl}
        serviceName={service.serviceName}
        description={service.description}
        rating={service.rating || 0}
        postalCode={service.postalCode || ''}
        price={service.price}
        category={service.category || ''}
      />
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setDeleteTarget(service)}
          >
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
         <DialogTitle>Delete Service</DialogTitle> {/* ✅ Always present */}
          </DialogHeader>
          <p>
            {deleteTarget
              ? `Are you sure you want to delete "${deleteTarget.serviceName}"?`
              : 'Are you sure you want to delete this service?'}
          </p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ))
) : (
  <p className="text-center text-gray-500 col-span-full py-6">
    You haven’t posted any services yet.
  </p>
)}

    </div>
  );
};

export default MyServices;
