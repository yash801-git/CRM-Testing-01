import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Square, ArrowLeft, Share2, Heart, Star, Calendar, MessageSquare, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePropertyStore } from './store';
import { useEffect, useState } from 'react';
import PropertyForm from './components/PropertyForm';
import VisitForm from '../site-visits/components/VisitForm';
import DealForm from '../deals/components/DealForm';

const PropertyDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, fetchAll } = usePropertyStore();
  const [editOpen, setEditOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [dealOpen, setDealOpen] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const propertyData = data.find(p => p.id === id);

  if (!propertyData) {
    return <div className="p-8 text-center text-muted-foreground font-bold">Loading property details...</div>;
  }

  const property = {
    id: propertyData.id,
    title: propertyData.title,
    price: `₹${(Number(propertyData.price) / 100000).toFixed(2)} Lakhs`,
    location: `${propertyData.city}, ${propertyData.state}`,
    type: propertyData.type,
    beds: propertyData.bedrooms || 0,
    baths: propertyData.bathrooms || 0,
    area: propertyData.areaSqFt || 0,
    rating: 4.8, // Static for now
    description: propertyData.description || 'No description provided.',
    images: propertyData.images?.length > 0 ? propertyData.images : [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80'
    ],
    amenities: propertyData.amenities || []
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-2xl font-bold gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Inventory
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" size="icon" className="rounded-2xl h-11 w-11 border-border/50">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-2xl h-11 w-11 border-border/50">
            <Heart className="h-4 w-4" />
          </Button>
          <Button onClick={() => setEditOpen(true)} className="rounded-2xl h-11 font-bold px-6 shadow-lg shadow-primary/20">Edit Property</Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Media & Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Image Gallery */}
          <div className={`grid gap-4 ${property.images.length === 1 ? 'grid-cols-1' : property.images.length === 2 ? 'grid-cols-2' : 'grid-cols-4'} grid-rows-2 h-[500px]`}>
             <div className={`${property.images.length === 1 || property.images.length === 2 ? 'col-span-1 row-span-2' : 'col-span-3 row-span-2'} rounded-[2.5rem] overflow-hidden shadow-2xl`}>
                <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
             </div>
             {property.images[1] && (
               <div className={`${property.images.length === 2 ? 'col-span-1 row-span-2' : 'col-span-1 row-span-1'} rounded-[2rem] overflow-hidden shadow-xl`}>
                  <img src={property.images[1]} alt="Interior 1" className="w-full h-full object-cover" />
               </div>
             )}
             {property.images[2] && (
               <div className="col-span-1 row-span-1 rounded-[2rem] overflow-hidden shadow-xl relative">
                  <img src={property.images[2]} alt="Interior 2" className="w-full h-full object-cover" />
                  {property.images.length > 3 && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-black text-xl">+{property.images.length - 3}</div>}
               </div>
             )}
          </div>

          {/* Details Content */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                   <span className="bg-primary/10 text-primary px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">{property.type}</span>
                   <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-lg text-xs font-black">
                      <Star className="h-3 w-3 fill-current" /> {property.rating}
                    </div>
                </div>
                <h1 className="text-4xl font-black tracking-tighter">{property.title}</h1>
                <div className="flex items-center text-muted-foreground font-bold mt-2 gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> {property.location}
                </div>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-1">List Price</p>
                <div className="text-4xl font-black text-primary">{property.price}</div>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-3 gap-4 py-8 border-y border-border/50">
               <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-primary shadow-inner">
                    <BedDouble className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black leading-none">{property.beds}</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase mt-1">Bedrooms</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-primary shadow-inner">
                    <Bath className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black leading-none">{property.baths}</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase mt-1">Bathrooms</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-primary shadow-inner">
                    <Square className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black leading-none">{property.area}</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase mt-1">Sq. Footage</p>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-black tracking-tight">Description</h3>
              <p className="text-muted-foreground font-medium leading-relaxed text-lg">
                {property.description}
              </p>
              {property.amenities.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-black text-sm uppercase tracking-widest text-muted-foreground mb-3">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity: string, idx: number) => (
                      <span key={idx} className="bg-secondary/50 text-secondary-foreground px-3 py-1 rounded-lg text-sm font-bold">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interaction Card */}
        <div className="space-y-6">
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-md rounded-[2.5rem] sticky top-28 overflow-hidden">
            <CardHeader className="p-8 pb-4">
               <CardTitle className="text-xl font-black tracking-tight">Schedule a Site Visit</CardTitle>
               <CardDescription className="font-bold">Select a date and time to view the property.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
               <div className="space-y-4 pt-4 border-t border-border/50">
                  <Button onClick={() => setVisitOpen(true)} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
                    <Calendar className="mr-2 h-5 w-5" /> Book Tour
                  </Button>
                  <Button onClick={() => setDealOpen(true)} variant="outline" className="w-full h-14 rounded-2xl font-black border-primary/20 text-primary">
                    <MessageSquare className="mr-2 h-5 w-5" /> Inquire Now
                  </Button>
               </div>

               <div className="pt-6 border-t border-border/50">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Assigned Agent</p>
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-primary-foreground font-black shadow-lg">JD</div>
                    <div className="flex-1">
                      <p className="font-black text-sm">John Doe</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Broker Admin</p>
                    </div>
                    <Button size="icon" variant="ghost" className="rounded-xl bg-primary/5 text-primary">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Forms */}
      <PropertyForm open={editOpen} onOpenChange={setEditOpen} initialData={propertyData} />
      <VisitForm open={visitOpen} onOpenChange={setVisitOpen} initialData={{ propertyId: propertyData.id }} />
      <DealForm open={dealOpen} onOpenChange={setDealOpen} initialData={{ propertyId: propertyData.id }} />
    </div>
  );
};

export default PropertyDetails;
