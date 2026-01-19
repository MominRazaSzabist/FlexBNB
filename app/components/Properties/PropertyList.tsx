'use client'

import { useEffect, useState } from 'react';
import PropertyListItem from "./PropertyListItem";
import apiService from '../services/apiService';

export type PropertyType = {
  id: string;
  title: string;
  image_url: string;
  image_urls?: string[]; // Array of all property images
  price_per_night: number;
  price_per_hour?: number;
  is_hourly_booking: boolean;
  available_hours_start?: string;
  available_hours_end?: string;
  green_certification?: {
    status: string;
    level: string | null;
    sustainability_score: number;
  } | null;
  host?: {
    id: string;
    name: string;
    email: string;
  };
  Host?: {
    id: string;
    name: string;
    email: string;
  };
} 
const PropertyList=() =>{
  const [properties,setProperties]=useState<PropertyType[]>([]);
  const getProperties= async() =>{
    const tmpProperties=await apiService.get('/api/properties/',null);
    
    setProperties(tmpProperties.data);
  };

  useEffect(() =>{  
    getProperties()
  }, []);
  return (
    <>
        {properties.map((property) => {
            return (
                <PropertyListItem 
                    key={property.id}
                    property={property}
                />
            )
        })}
    </>
   ) 

}
export default PropertyList;

