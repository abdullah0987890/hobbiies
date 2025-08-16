import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { toast } from 'sonner';

export default function GalleryUploader() {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const maxImages = 6;

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_NAME; // Corrected based on your image
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files).slice(0, maxImages);
    setSelectedImages(fileArray);

    const previews = fileArray.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  // Remove a preview before upload
  const removePreview = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload images to Cloudinary & Firestore
  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      toast.error('Please select at least one image.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast.error('Please login first.');
      return;
    }

    setIsUploading(true);

    try {
      for (const image of selectedImages) {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
          { method: 'POST', body: formData }
        );

        const data = await res.json();
        if (!data.secure_url) throw new Error('Cloudinary upload failed');

        await addDoc(collection(db, 'users', user.uid, 'galleries'), {
          images: data.secure_url,
          uploadedAt: serverTimestamp(),
        });
      }

      toast.success('Images uploaded successfully!');
      setSelectedImages([]);
      setPreviewImages([]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload images.');
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch user's gallery images
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const galleryRef = collection(db, 'users', user.uid, 'galleries');
    const q = query(galleryRef, orderBy('uploadedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const images = snapshot.docs
        .map((doc) => doc.data().images)
        .filter(Boolean);
      setGalleryImages(images);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">upload værkgalleri</h2>

      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
        <span className="text-gray-500">Click or drag & drop images (max {maxImages})</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* Preview Images */}
      {previewImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
          {previewImages.map((src, idx) => (
            <div key={idx} className="relative">
              <img
                src={src}
                alt={`Preview ${idx + 1}`}
                className="h-28 w-full object-cover rounded-lg border"
              />
              <button
                onClick={() => removePreview(idx)}
                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full px-2 py-1 text-xs hover:bg-opacity-70"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={isUploading}
        className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2 rounded-lg mt-2 disabled:opacity-50"
      >
        {isUploading ? 'Uploading...' : 'Upload billeder'}
      </button>

      {/* User's Gallery */}
      {galleryImages.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-2">Dit galleri</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {galleryImages.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Gallery ${index + 1}`}
                className="h-28 w-full object-cover rounded-lg border"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
