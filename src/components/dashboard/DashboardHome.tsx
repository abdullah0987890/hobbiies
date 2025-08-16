import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Star, List, Trash } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationAlert } from '@/components/NotificationAlert';
import { Button } from '@/components/ui/button';

const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalServices: 0,
    averageRating: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const servicesRef = collection(db, 'services');
    const servicesQuery = query(servicesRef, where('providerId', '==', user.id));
    const notificationsRef = collection(db, 'notifications');
    const notifQuery = query(
      notificationsRef,
      where('providerId', '==', user.id),
      orderBy('timestamp', 'desc')
    );

    const fetchStats = async () => {
      try {
        const servicesSnapshot = await getDocs(servicesQuery);
        const services = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const totalServices = services.length;

        let totalRating = 0;
        let totalRatingsCount = 0;

        for (const service of services) {
          const ratingsQuery = query(
            collection(db, 'ratings'),
            where('serviceId', '==', service.id)
          );
          const ratingSnapshot = await getDocs(ratingsQuery);
          const ratings = ratingSnapshot.docs.map(doc => doc.data());

          const sum = ratings.reduce((acc, r) => acc + (r.rating || 0), 0);
          totalRating += sum;
          totalRatingsCount += ratings.length;
        }

        const averageRating =
          totalRatingsCount > 0 ? totalRating / totalRatingsCount : 0;

        setStats({
          totalServices,
          averageRating: parseFloat(averageRating.toFixed(1)),
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();

    const unsubscribe = onSnapshot(notifQuery, notifSnapshot => {
      const notifData = notifSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notifData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Samlet listede tjenester</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
              </div>
              <List className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">gennemsnitlig vurdering</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>seneste aktivitet</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Book className="h-12 w-12 mx-auto mb-2" />
              <p>Recent activity and notifications will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className="flex items-start justify-between border p-4 rounded-md bg-gray-50"
                >
                  <NotificationAlert
                    message={notif.message}
                    timestamp={notif.timestamp}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteNotification(notif.id)}
                  >
                    <Trash className="w-5 h-5 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
