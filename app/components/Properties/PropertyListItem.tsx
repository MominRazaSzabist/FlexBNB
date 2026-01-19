'use client'

import Image from "next/image";
import { PropertyType } from "./PropertyList";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MessageHostButton from "../Messaging/MessageHostButton";
import GreenBadge from "../Sustainability/GreenBadge";
import { SignedIn } from "@clerk/nextjs";


interface PropertyProps {
    property: PropertyType,
}

const PropertyListItem: React.FC<PropertyProps> = ({
    property,
}) => {
    const router = useRouter();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // Get all images - use image_urls if available, otherwise fall back to image_url
    const allImages = property.image_urls && property.image_urls.length > 0 
        ? property.image_urls 
        : property.image_url 
            ? [property.image_url] 
            : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'];
    
    const currentImage = allImages[currentImageIndex] || property.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop';

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (allImages.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
        }
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (allImages.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
        }
    };

    return (
        <div 
            className="cursor-pointer"
            onClick={() => router.push(`/Properties/${property.id}`)}
        >
            <div className="relative overflow-hidden aspect-square rounded-xl group">
                <Image
                    fill
                    src={currentImage}
                    sizes="(max-width: 768px) 768px, (max-width: 1200px): 768px, 768px"
                    className="hover:scale-110 object-cover transition h-full w-full"
                    alt={property.title}
                    unoptimized
                    onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop';
                    }}
                />
                
                {/* Image counter badge */}
                {allImages.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs font-semibold">
                        {currentImageIndex + 1} / {allImages.length}
                    </div>
                )}

                {/* Green Stay Certification Badge */}
                {property.green_certification && (
                    <div className="absolute top-2 left-2 z-10">
                        <GreenBadge 
                            level={property.green_certification.level}
                            status={property.green_certification.status}
                            size="small"
                        />
                    </div>
                )}

                {/* Navigation arrows for multiple images */}
                {allImages.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Previous image"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Next image"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            <div className="mt-2 flex items-start justify-between gap-2">
                <p className="text-lg font-bold flex-1">{property.title}</p>
                {property.green_certification && (
                    <GreenBadge 
                        level={property.green_certification.level}
                        status={property.green_certification.status}
                        size="small"
                    />
                )}
            </div>

            <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center">
                    <p className="text-sm text-gray-500"><strong>${property.price_per_night}</strong> per night</p>
                    {property.is_hourly_booking && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs ml-2">
                        Hourly Available
                      </span>
                    )}
                </div>
            </div>

            {/* Message Host Button */}
            <SignedIn>
                <div className="mt-3">
                    <MessageHostButton
                        propertyId={property.id}
                        propertyTitle={property.title}
                        hostName={property.host?.name || property.Host?.name || 'Host'}
                        variant="compact"
                    />
                </div>
            </SignedIn>
        </div>
    )
}

export default PropertyListItem;
