'use client';

import Image from "next/image";
import Link from "next/link";
import ReservationSideBar from "@/app/components/Properties/ReservationSideBar";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ShareIcon,
  HeartIcon,
  StarIcon,
  MapPinIcon,
  HomeIcon,
  UserGroupIcon,
  BeakerIcon,
  WifiIcon,
  TvIcon,
  TruckIcon,
  FireIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  BuildingOfficeIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const PropertyDetailPage = () => {
    const params = useParams();
    const [property, setProperty] = useState<any>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [showAllPhotos, setShowAllPhotos] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);

    // Mock data for demonstration
    const mockImages = [
        property?.image_url || "/api/placeholder/800/600",
        "/api/placeholder/800/600",
        "/api/placeholder/800/600", 
        "/api/placeholder/800/600",
        "/api/placeholder/800/600"
    ];

    const mockAmenities = [
        { name: "WiFi", iconName: "WifiIcon", available: true },
        { name: "TV", iconName: "TvIcon", available: true },
        { name: "Kitchen", iconName: "HomeIcon", available: true },
        { name: "Parking", iconName: "TruckIcon", available: true },
        { name: "Heating", iconName: "FireIcon", available: true },
        { name: "Pool", iconName: "BuildingOfficeIcon", available: false },
        { name: "Hot tub", iconName: "BeakerIcon", available: true },
        { name: "Gym", iconName: "UserGroupIcon", available: false }
    ];

    const mockReviews = [
        {
            id: 1,
            user: "Ali Hassan Iqbal",
            avatar: "/api/placeholder/40/40",
            rating: 5,
            date: "March 2024",
            comment: "Amazing place! Perfect location and the host was very responsive. Would definitely stay again."
        },
        {
            id: 2,
            user: "Ali Hassan Iqbal",
            avatar: "/api/placeholder/40/40", 
            rating: 5,
            date: "February 2024",
            comment: "Beautiful property with stunning views. Everything was exactly as described."
        },
        {
            id: 3,
            user: "Ali Hassan Iqbal",
            avatar: "/api/placeholder/40/40",
            rating: 4,
            date: "January 2024", 
            comment: "Great stay overall. The place was clean and comfortable. Minor issues with parking but host resolved quickly."
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/properties/${params.id}`);
                const data = await res.json();
                setProperty(data);
            } catch (error) {
                console.error('Error fetching property:', error);
            }
        };

        if (params?.id) {
            fetchData();
        }
    }, [params?.id]);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % mockImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + mockImages.length) % mockImages.length);
    };

    if (!property) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                </div>
            </div>
        );
    }

    const ImageGallery = () => (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
                <button
                    onClick={() => setShowAllPhotos(false)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
                
                <button
                    onClick={prevImage}
                    className="absolute left-4 z-10 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                >
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>
                
                <div className="relative w-4/5 h-4/5">
                    <Image
                        src={mockImages[currentImageIndex]}
                        alt={`Property image ${currentImageIndex + 1}`}
                        fill
                        className="object-cover rounded-lg"
                    />
                </div>
                
                <button
                    onClick={nextImage}
                    className="absolute right-4 z-10 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                >
                    <ChevronRightIcon className="h-6 w-6" />
                </button>
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
                    {currentImageIndex + 1} / {mockImages.length}
                </div>
            </div>
        </div>
    );

    const renderAmenityIcon = (iconName: string) => {
        const iconProps = { className: "h-6 w-6" };
        
        switch (iconName) {
            case "WifiIcon":
                return <WifiIcon {...iconProps} />;
            case "TvIcon":
                return <TvIcon {...iconProps} />;
            case "HomeIcon":
                return <HomeIcon {...iconProps} />;
            case "TruckIcon":
                return <TruckIcon {...iconProps} />;
            case "FireIcon":
                return <FireIcon {...iconProps} />;
            case "BeakerIcon":
                return <BeakerIcon {...iconProps} />;
            case "BuildingOfficeIcon":
                return <BuildingOfficeIcon {...iconProps} />;
            case "UserGroupIcon":
                return <UserGroupIcon {...iconProps} />;
            default:
                return <HomeIcon {...iconProps} />;
        }
    };

    return (
        <>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {/* Header Section */}
                <div className="pt-6 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 break-words">{property.title}</h1>
                            <div className="flex flex-wrap items-center mt-2 text-sm text-gray-600 gap-x-2">
                                <div className="flex items-center">
                                    <StarIconSolid className="h-4 w-4 text-yellow-400 mr-1" />
                                    <span className="font-medium">4.9</span>
                                </div>
                                <span className="hidden sm:inline">·</span>
                                <span className="underline">127 reviews</span>
                                <span className="hidden sm:inline">·</span>
                                <div className="flex items-center">
                                    <MapPinIcon className="h-4 w-4 mr-1" />
                                    <span>{property.country || 'Location'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                            <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                <ShareIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="hidden sm:inline">Share</span>
                            </button>
                            <button 
                                onClick={() => setIsLiked(!isLiked)}
                                className="flex items-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                                {isLiked ? (
                                    <HeartIconSolid className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                                ) : (
                                    <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                )}
                                <span className="hidden sm:inline">Save</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Image Gallery */}
                <div className="relative mb-6 sm:mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] sm:h-[400px] lg:h-[500px]">
                        <div className="md:col-span-2 relative overflow-hidden rounded-xl md:rounded-l-xl md:rounded-r-none">
                            <Image
                                src={mockImages[0]}
                                alt="Main property image"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <div className="hidden md:grid grid-cols-1 gap-2">
                            <div className="relative overflow-hidden">
                                <Image
                                    src={mockImages[1]}
                                    alt="Property image 2"
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="relative overflow-hidden">
                                <Image
                                    src={mockImages[2]}
                                    alt="Property image 3"
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        </div>
                        <div className="hidden md:grid grid-cols-1 gap-2">
                            <div className="relative overflow-hidden">
                                <Image
                                    src={mockImages[3]}
                                    alt="Property image 4"
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="relative overflow-hidden rounded-tr-xl rounded-br-xl">
                                <Image
                                    src={mockImages[4]}
                                    alt="Property image 5"
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setShowAllPhotos(true)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg font-medium"
                                    >
                                        <PhotoIcon className="h-5 w-5" />
                                        <span>Show all photos</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setShowAllPhotos(true)}
                        className="md:hidden absolute bottom-4 right-4 flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-90 rounded-lg font-medium text-sm"
                    >
                        <PhotoIcon className="h-4 w-4" />
                        <span>Show all photos</span>
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-12">
                    <div className="lg:col-span-2 space-y-6 sm:space-y-8 min-w-0">
                        {/* Property Overview */}
                        <div className="border-b border-gray-200 pb-6 sm:pb-8">
                            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Property Details</h2>
                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-gray-600 mb-4 sm:mb-6">
                                <div className="flex items-center space-x-2">
                                    <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="text-sm sm:text-base">{property.guests} guests</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <HomeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="text-sm sm:text-base">{property.bedrooms} bedrooms</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <BeakerIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="text-sm sm:text-base">{property.bathrooms} bathrooms</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <div className="flex items-center space-x-2">
                                    <BanknotesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                                    <span className="text-xl sm:text-2xl font-bold">${property.price_per_night}</span>
                                    <span className="text-gray-600 text-sm sm:text-base">per night</span>
                                </div>
                                {property.is_hourly_booking && (
                                    <>
                                        <div className="text-gray-400 hidden sm:block">•</div>
                                        <div className="flex items-center space-x-2">
                                            <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                            <span className="text-lg sm:text-xl font-bold">${property.price_per_hour}</span>
                                            <span className="text-gray-600 text-sm sm:text-base">per hour</span>
                                        </div>
                                        <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                                            Hourly Available
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="border-b border-gray-200 pb-6 sm:pb-8">
                            <h2 className="text-xl sm:text-2xl font-semibold mb-4">About this place</h2>
                            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                {property.description}
                            </p>
                        </div>

                        {/* Amenities */}
                        <div className="border-b border-gray-200 pb-6 sm:pb-8">
                            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">What this place offers</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {mockAmenities.slice(0, showAllAmenities ? mockAmenities.length : 6).map((amenity, index) => (
                                    <div key={index} className="flex items-center space-x-3 sm:space-x-4 py-2">
                                        <div className={amenity.available ? 'text-gray-700' : 'text-gray-400'}>
                                            {renderAmenityIcon(amenity.iconName)}
                                        </div>
                                        <span className={`text-sm sm:text-base ${amenity.available ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                                            {amenity.name}
                                        </span>
                                        {!amenity.available && (
                                            <span className="text-xs text-gray-500 italic">Not available</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {mockAmenities.length > 6 && (
                                <button
                                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                                    className="mt-4 px-4 sm:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                                >
                                    {showAllAmenities ? 'Show less' : `Show all ${mockAmenities.length} amenities`}
                                </button>
                            )}
                        </div>

                        {/* Reviews */}
                        <div className="border-b border-gray-200 pb-6 sm:pb-8">
                            <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                                <StarIconSolid className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                                <h2 className="text-xl sm:text-2xl font-semibold">4.9 · 127 reviews</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
                                {mockReviews.slice(0, showAllReviews ? mockReviews.length : 4).map((review) => (
                                    <div key={review.id} className="space-y-3 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <Image
                                                src={review.avatar}
                                                alt={review.user}
                                                width={32}
                                                height={32}
                                                className="rounded-full sm:w-10 sm:h-10"
                                            />
                                            <div>
                                                <div className="font-medium text-sm sm:text-base">{review.user}</div>
                                                <div className="text-xs sm:text-sm text-gray-600">{review.date}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <StarIconSolid
                                                    key={i}
                                                    className={`h-3 w-3 sm:h-4 sm:w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                            
                            {mockReviews.length > 4 && (
                                <button
                                    onClick={() => setShowAllReviews(!showAllReviews)}
                                    className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                                >
                                    {showAllReviews ? 'Show less' : `Show all ${mockReviews.length} reviews`}
                                </button>
                            )}
                        </div>

                        {/* Host Information */}
                        <div className="pb-6 sm:pb-8">
                            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Meet your Host</h2>
                            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                                    <div className="relative self-center sm:self-start flex-shrink-0">
                                        {property.host?.avatar_url ? (
                                            <Image
                                                src={property.host.avatar_url}
                                                width={64}
                                                height={64}
                                                className="rounded-full sm:w-20 sm:h-20"
                                                alt={property.host.name}
                                            />
                                        ) : (
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-300 flex items-center justify-center">
                                                <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                                            <ShieldCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 text-center sm:text-left">
                                        <h3 className="text-lg sm:text-xl font-semibold mb-2">{property.host?.name || 'Ali Hassan Iqbal'}</h3>
                                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                                            <div className="flex items-center space-x-1">
                                                <StarIconSolid className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                                                <span>4.9 rating</span>
                                            </div>
                                            <span className="hidden sm:inline">•</span>
                                            <span>127 reviews</span>
                                            <span className="hidden sm:inline">•</span>
                                            <span>3 years hosting</span>
                                        </div>
                                        <div className="flex items-center justify-center sm:justify-start space-x-2 mb-3 sm:mb-4">
                                            <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                                            <span className="text-xs sm:text-sm">Identity verified</span>
                                        </div>
                                        <p className="text-gray-700 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                                            Welcome to my place! I'm a local host who loves sharing the beauty of this area with guests. 
                                            I'm always available to help make your stay memorable.
                                        </p>
                                        <Link
                                            href={`/hosts/${property.host?.id}`}
                                            className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-xs sm:text-sm"
                                        >
                                            Contact Host
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reservation Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-24">
                            {/* Mobile: Prominent booking section */}
                            <div className="lg:hidden mb-8">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                                    <div className="text-center mb-4">
                                        <h3 className="text-xl font-bold mb-2">Ready to Book?</h3>
                                        <div className="flex items-center justify-center space-x-2">
                                            <span className="text-2xl font-bold">${property.price_per_night}</span>
                                            <span className="text-sm opacity-90">per night</span>
                                        </div>
                                        {property.is_hourly_booking && (
                                            <div className="mt-2 text-sm opacity-90">
                                                or ${property.price_per_hour} per hour
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Desktop and Mobile Sidebar */}
                            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-visible">
                                <div className="w-full">
                                    <ReservationSideBar property={property} />
                                </div>
                            </div>
                            
                            {/* Desktop: Additional info */}
                            <div className="hidden lg:block mt-6">
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                                        <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                                        <span>Secure booking guaranteed</span>
                                    </div>
                                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mt-2">
                                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                        <span>Free cancellation available</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Image Gallery Modal */}
            {showAllPhotos && <ImageGallery />}
        </>
    );
};

export default PropertyDetailPage;

