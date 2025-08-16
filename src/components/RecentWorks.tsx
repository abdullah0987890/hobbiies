import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase';
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';

export default function RecentWorksCard({ userId }: { userId?: string }) {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const targetUserId = userId || auth.currentUser?.uid;
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const galleryRef = collection(db, 'users', targetUserId, 'galleries');
    const q = query(galleryRef, orderBy('uploadedAt', 'desc'), limit(6));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const images = snapshot.docs
        .map((doc) => doc.data().images as string)
        .filter(Boolean); // remove undefined/null
      setGalleryImages(images);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Recent Works</h3>
        <div className="grid grid-cols-3 gap-2 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (galleryImages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 w-80">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Recent Works</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🎨</div>
          <p className="text-sm">No works uploaded yet</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-2xl hover:shadow-lg transition-shadow duration-200">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Recent Works</h3>
        <div className="grid grid-cols-3 gap-2">
          {galleryImages.map((url, index) => (
            <div
              key={index}
              className="relative group cursor-pointer overflow-hidden rounded-md"
              onClick={() => setSelectedImage(url)}
            >
              <img
              key={index}
                src={url}
                alt={`Work ${index + 1}`}
                className="h-16 w-full object-cover transition-transform duration-200 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-lg">
            <img src={selectedImage} alt="Full size work" className="max-w-full max-h-full object-contain" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
