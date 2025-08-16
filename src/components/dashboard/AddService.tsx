// src/components/dashboard/AddService.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from '@/contexts/AuthContext';
import Pricing from './Pricing';

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_NAME; // Corrected based on your image
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;

interface AddServiceProps {
  navigateToTab: (tabId: string) => void;
}

const categories = [
 'Vælge kategorier',
  'Hundeluftning',
  'Husrengøring',
  "terapeut",
  "massage terapeut",
  'VVS',
  'Elektriker',
  'Havearbejde',
  'Undervisning',
  'Dyrepasser',
  'Handyman',
  'Skønhedsservices',
   "other"
];

const ServiceForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('');
  const [experience, setExperience] = useState('');
  const [priceDetails, setPriceDetails] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = async (): Promise<string[] | null> => {
    if (imageFiles.length === 0) {
      toast({ title: "Images Required", description: "Please select at least one image.", variant: "destructive" });
      return null;
    }
    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Image upload failed');

        const data = await response.json();
        uploadedUrls.push(data.secure_url);
      }
      return uploadedUrls;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      toast({ title: "Image Upload Failed", description: "Could not upload the service images.", variant: "destructive" });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Authentication Error", variant: "destructive" });
      return;
    }
    if (!category) {
      toast({ title: "Category Required", description: "Please select a category.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const imageUrls = await handleImageUpload();
    if (!imageUrls) {
      setIsLoading(false);
      return;
    }

    try {
      const newService = {
        providerId: user.id,
        name: user.name,
        providerImageUrl: user.imageUrl || '',
        contactPhone: user.phone || '',
        serviceName,
        category,
        price: `From ${price} DKK`,
        priceDetails,
        description,
        longDescription,
        postalCode,
        location,
        availability,
        experience,
        contactEmail,
        images: imageUrls,
        rating: 0,
        createdAt: new Date(),
      };
      await addDoc(collection(db, "services"), newService);
      await addDoc(collection(db, 'notifications'), {
        message: `du har oprettet en tjeneste  ${serviceName}.`,
        providerId: user.id,
        timestamp: serverTimestamp(),
      });
      toast({ title: "Success!", description: "Your new service has been added." });
      setServiceName(''); setCategory(''); setPrice(''); setDescription(''); setLongDescription('');
      setPostalCode(''); setLocation(''); setAvailability(''); setExperience('');
      setPriceDetails(''); setContactEmail(user?.email || ''); setImageFiles([]); setImagePreviews([]);
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({ title: "Error", description: "Could not save the service details.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files).slice(0, 4) : [];
    setImageFiles(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader><CardTitle>Beskriv din service</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="serviceName">tjenestenavn</Label>
              <Input id="serviceName" placeholder="e.g., Professional Dog Walking" value={serviceName} onChange={(e) => setServiceName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceImage">Service billeder (max 4)</Label>
              <Input id="serviceImage" type="file" accept="image/*" multiple onChange={handleImageChange} required />
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {imagePreviews.map((src, index) => (
                    <img key={index} src={src} alt={`Preview ${index + 1}`} className="w-24 h-24 object-cover rounded" />
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Startpris (in DKK)</Label>
                <Input id="price" type="number" placeholder="e.g., 40" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceDetails">Prisoplysningerv</Label>
                <Input id="priceDetails" placeholder="e.g., 40 kr for group, 60 kr for solo" value={priceDetails} onChange={(e) => setPriceDetails(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Kort beskrivelse (for servicekort)</Label>
              <Textarea id="description" placeholder="A brief, one-sentence summary of your service." value={description} onChange={(e) => setDescription(e.target.value)} required rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longDescription">Fuld beskrivelse af "Om mig"</Label>
              <Textarea id="longDescription" placeholder="Tell customers about yourself, your experience, and what makes your service special." value={longDescription} onChange={(e) => setLongDescription(e.target.value)} required rows={5} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postnummer</Label>
                <Input id="postalCode" placeholder="e.g., 4690" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Beliggenhed / by</Label>
                <Input id="location" placeholder="e.g., Dalby" value={location} onChange={(e) => setLocation(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="experience">Erfaring</Label>
                <Input id="experience" placeholder="e.g., 2+ years" value={experience} onChange={(e) => setExperience(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Tilgængelighed</Label>
                <Input id="availability" placeholder="e.g., Monday - Sunday, 7 AM - 7 PM" value={availability} onChange={(e) => setAvailability(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Offentlig kontakt e-mail</Label>
                <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading || isUploading}>
              {isLoading || isUploading ? 'Saving Service...' : 'tilføje service'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const AddService = ({ navigateToTab }: AddServiceProps) => {
  const { user } = useAuth();
  if (!user?.planName || user.planName === 'none') return <Pricing />;
  if (!user.phone) {
    return (
      <Card className="max-w-2xl mx-auto text-center">
        <CardHeader><CardTitle>Phone Number Required</CardTitle></CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Tilføj venligst et telefonnummer til din profil, før du kan angive en ny tjeneste.
          </p>
          <Button onClick={() => navigateToTab('settings')}>Go to Settings</Button>
        </CardContent>
      </Card>
    );
  }
  return <ServiceForm />;
};

export default AddService;
