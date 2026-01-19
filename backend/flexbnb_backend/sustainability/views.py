from rest_framework import status, permissions, viewsets
from rest_framework.decorators import api_view, authentication_classes, permission_classes, action
from rest_framework.response import Response
from django.db.models import Q, Avg, Sum, Count
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
from math import radians, cos, sin, asin, sqrt

from useraccount.auth import ClerkAuthentication
from property.models import Property
from .models import (
    GreenCertification,
    CarbonFootprint,
    EcoIncentive,
    EcoIncentiveUsage,
    EnergyUsage,
    SustainableExperience
)
from .serializers import (
    GreenCertificationSerializer,
    GreenCertificationCreateSerializer,
    CarbonFootprintSerializer,
    CarbonFootprintCalculateSerializer,
    EcoIncentiveSerializer,
    EcoIncentiveUsageSerializer,
    EnergyUsageSerializer,
    EnergyUsageStatsSerializer,
    SustainableExperienceSerializer
)


# ==================== GREEN CERTIFICATION ====================

@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.AllowAny])
def green_certifications_list(request):
    """List all approved green certifications"""
    try:
        # Filter by status
        status_filter = request.query_params.get('status', 'approved')
        certifications = GreenCertification.objects.filter(status=status_filter)
        
        # Filter by host (for host dashboard) - requires authentication
        if request.query_params.get('my_certifications'):
            if not request.user.is_authenticated:
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            certifications = certifications.filter(host=request.user)
        
        serializer = GreenCertificationSerializer(certifications, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def apply_green_certification(request):
    """Apply for green certification for a property"""
    try:
        user = request.user
        property_id = request.data.get('property')
        
        # Verify property ownership
        try:
            property_obj = Property.objects.get(id=property_id, host=user)
        except Property.DoesNotExist:
            return Response(
                {'error': 'Property not found or you do not own this property'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already has certification
        if hasattr(property_obj, 'green_certification'):
            return Response(
                {'error': 'Property already has a certification application'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = GreenCertificationCreateSerializer(data=request.data)
        if serializer.is_valid():
            certification = serializer.save(host=user, status='pending')
            response_serializer = GreenCertificationSerializer(certification)
            return Response(
                {
                    'success': True,
                    'message': 'Green certification application submitted successfully',
                    'certification': response_serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.AllowAny])
def green_certification_detail(request, property_id):
    """Get green certification for a specific property"""
    try:
        property_obj = Property.objects.get(id=property_id)
        if hasattr(property_obj, 'green_certification'):
            serializer = GreenCertificationSerializer(property_obj.green_certification)
            return Response(serializer.data)
        return Response({'error': 'Property does not have green certification'}, status=status.HTTP_404_NOT_FOUND)
    except Property.DoesNotExist:
        return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== CARBON FOOTPRINT ====================

@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.AllowAny])
def calculate_carbon_footprint(request):
    """Calculate carbon footprint for a trip"""
    import traceback
    try:
        serializer = CarbonFootprintCalculateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Create temporary carbon footprint object to calculate
        property_obj = None
        if data.get('property_id'):
            try:
                property_obj = Property.objects.get(id=data.get('property_id'))
            except Property.DoesNotExist:
                pass  # Property not found, continue without it
        
        # Create CarbonFootprint instance (don't save yet)
        carbon_calc = CarbonFootprint(
            user=request.user if (hasattr(request, 'user') and request.user.is_authenticated) else None,
            property_obj=property_obj,
            transport_type=data['transport_type'],
            distance_km=data['distance_km'],
            stay_duration_days=data['stay_duration_days'],
            number_of_guests=data['number_of_guests']
        )
        
        # Calculate carbon
        carbon_calc.calculate_carbon()
        
        # Save if user is authenticated
        is_saved = False
        if hasattr(request, 'user') and request.user.is_authenticated:
            try:
                carbon_calc.save()
                is_saved = True
            except Exception as save_error:
                print(f"[CARBON CALC] Error saving: {save_error}")
                # Continue without saving
        
        # Prepare response with recommendations
        response_data = {
            'transport_carbon': round(carbon_calc.transport_carbon, 2),
            'accommodation_carbon': round(carbon_calc.accommodation_carbon, 2),
            'total_carbon': round(carbon_calc.total_carbon, 2),
            'equivalent_trees': round(carbon_calc.total_carbon / 21, 1),  # ~21kg CO2/tree/year
            'recommendations': get_carbon_recommendations(carbon_calc),
            'is_saved': is_saved
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    except Exception as e:
        error_traceback = traceback.format_exc()
        print(f"[CARBON CALC] Error: {str(e)}")
        print(f"[CARBON CALC] Traceback: {error_traceback}")
        return Response({'error': str(e), 'detail': error_traceback if settings.DEBUG else 'An error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def get_carbon_recommendations(carbon_calc):
    """Generate recommendations to reduce carbon footprint"""
    recommendations = []
    
    # Transport recommendations
    if carbon_calc.transport_type in ['car', 'flight_domestic', 'flight_international']:
        recommendations.append({
            'category': 'transport',
            'message': 'Consider using train or bus for shorter distances to reduce your carbon footprint by up to 80%',
            'impact': 'high'
        })
    
    if carbon_calc.transport_type == 'car':
        recommendations.append({
            'category': 'transport',
            'message': 'Switching to an electric car could reduce your transport emissions by 70%',
            'impact': 'medium'
        })
    
    # Accommodation recommendations
    if not (carbon_calc.property_obj and hasattr(carbon_calc.property_obj, 'green_certification')):
        recommendations.append({
            'category': 'accommodation',
            'message': 'Choosing a Green Stay certified property can reduce accommodation emissions by 30%',
            'impact': 'medium'
        })
    
    # General recommendations
    recommendations.append({
        'category': 'offset',
        'message': f'Consider purchasing carbon offsets for ${round(carbon_calc.total_carbon * 0.02, 2)} to neutralize your trip',
        'impact': 'high'
    })
    
    return recommendations


@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def my_carbon_history(request):
    """Get carbon footprint history for authenticated user"""
    try:
        calculations = CarbonFootprint.objects.filter(user=request.user).order_by('-created_at')[:20]
        serializer = CarbonFootprintSerializer(calculations, many=True)
        
        # Calculate totals
        total_carbon = sum(calc.total_carbon for calc in calculations)
        total_offset = calculations.filter(offset_purchased=True).count()
        
        return Response({
            'calculations': serializer.data,
            'summary': {
                'total_carbon': round(total_carbon, 2),
                'total_trips': calculations.count(),
                'offset_purchased': total_offset,
                'equivalent_trees': round(total_carbon / 21, 1)
            }
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== ECO INCENTIVES ====================

@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.AllowAny])
def eco_incentives_list(request):
    """List all active eco incentives"""
    try:
        now = timezone.now()
        incentives = EcoIncentive.objects.filter(
            is_active=True,
            valid_from__lte=now,
            valid_until__gte=now
        )
        
        serializer = EcoIncentiveSerializer(incentives, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def my_eco_incentives(request):
    """Get eco incentives usage history for authenticated user"""
    try:
        usage = EcoIncentiveUsage.objects.filter(user=request.user).order_by('-used_at')[:20]
        serializer = EcoIncentiveUsageSerializer(usage, many=True)
        
        # Calculate total savings
        total_saved = sum(u.amount_saved for u in usage)
        
        return Response({
            'usage_history': serializer.data,
            'total_saved': round(total_saved, 2),
            'total_uses': usage.count()
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== ENERGY & WATER MONITORING ====================

@api_view(['GET', 'POST'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def energy_usage_list(request):
    """List or create energy usage records for host properties"""
    try:
        if request.method == 'GET':
            property_id = request.query_params.get('property_id')
            
            if not property_id:
                return Response({'error': 'property_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify property ownership
            try:
                property_obj = Property.objects.get(id=property_id, host=request.user)
            except Property.DoesNotExist:
                return Response({'error': 'Property not found or access denied'}, status=status.HTTP_403_FORBIDDEN)
            
            # Get date range
            days = int(request.query_params.get('days', 30))
            start_date = timezone.now().date() - timedelta(days=days)
            
            usage_records = EnergyUsage.objects.filter(
                property=property_obj,
                date__gte=start_date
            ).order_by('-date')
            
            serializer = EnergyUsageSerializer(usage_records, many=True)
            
            # Calculate statistics
            stats = calculate_energy_stats(usage_records)
            
            return Response({
                'usage_records': serializer.data,
                'statistics': stats
            })
        
        elif request.method == 'POST':
            # Verify property ownership
            property_id = request.data.get('property')
            try:
                property_obj = Property.objects.get(id=property_id, host=request.user)
            except Property.DoesNotExist:
                return Response({'error': 'Property not found or access denied'}, status=status.HTTP_403_FORBIDDEN)
            
            serializer = EnergyUsageSerializer(data=request.data)
            if serializer.is_valid():
                usage = serializer.save()
                
                # Run AI analysis
                analyze_energy_usage(usage)
                usage.save()
                
                response_serializer = EnergyUsageSerializer(usage)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def calculate_energy_stats(usage_records):
    """Calculate energy usage statistics"""
    if not usage_records:
        return {}
    
    total_electricity = sum(u.electricity_kwh for u in usage_records)
    total_water = sum(u.water_liters for u in usage_records)
    total_guests = sum(u.number_of_guests for u in usage_records if u.number_of_guests > 0)
    
    guest_count = len([u for u in usage_records if u.number_of_guests > 0])
    
    return {
        'total_electricity_kwh': round(total_electricity, 2),
        'total_water_liters': round(total_water, 2),
        'avg_electricity_per_day': round(total_electricity / len(usage_records), 2),
        'avg_water_per_day': round(total_water / len(usage_records), 2),
        'avg_electricity_per_guest': round(total_electricity / total_guests, 2) if total_guests > 0 else 0,
        'avg_water_per_guest': round(total_water / total_guests, 2) if total_guests > 0 else 0,
        'anomaly_count': len([u for u in usage_records if u.is_anomaly]),
        'records_count': len(usage_records)
    }


def analyze_energy_usage(usage):
    """
    AI-based analysis of energy usage
    This is a simplified version - in production, you'd use actual ML models
    """
    # Get historical average for this property
    historical = EnergyUsage.objects.filter(
        property_obj=usage.property_obj,
        date__lt=usage.date
    ).order_by('-date')[:30]
    
    if historical.count() < 7:
        # Not enough historical data
        return
    
    # Calculate averages
    avg_electricity = sum(h.electricity_kwh for h in historical) / historical.count()
    avg_water = sum(h.water_liters for h in historical) / historical.count()
    
    # Detect anomalies (usage > 50% above average)
    recommendations = []
    
    if usage.electricity_kwh > avg_electricity * 1.5:
        usage.is_anomaly = True
        recommendations.append("⚡ High electricity usage detected!")
        recommendations.append("• Check for appliances left on")
        recommendations.append("• Consider upgrading to LED lights")
        recommendations.append("• Set thermostat to energy-saving mode")
    
    if usage.water_liters > avg_water * 1.5:
        usage.is_anomaly = True
        recommendations.append("💧 High water usage detected!")
        recommendations.append("• Check for leaks in pipes and faucets")
        recommendations.append("• Install low-flow showerheads")
        recommendations.append("• Educate guests about water conservation")
    
    # General recommendations based on usage per guest
    if usage.number_of_guests > 0:
        elec_per_guest = usage.electricity_kwh / usage.number_of_guests
        water_per_guest = usage.water_liters / usage.number_of_guests
        
        if elec_per_guest > 20:  # High electricity per guest
            recommendations.append("💡 Consider installing smart thermostats and motion sensors")
        
        if water_per_guest > 200:  # High water per guest
            recommendations.append("🚿 Consider water-efficient appliances and fixtures")
    
    # Positive feedback
    if not usage.is_anomaly and historical.count() >= 30:
        recommendations.append("✅ Great job! Your usage is within normal ranges")
        recommendations.append("🌱 Keep up the sustainable practices")
    
    usage.ai_recommendation = "\n".join(recommendations)


# ==================== SUSTAINABLE EXPERIENCES ====================

@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.AllowAny])
def sustainable_experiences_list(request):
    """List sustainable experiences, optionally filtered by location"""
    try:
        experiences = SustainableExperience.objects.filter(is_active=True)
        
        # Filter by city
        city = request.query_params.get('city')
        if city:
            experiences = experiences.filter(city__icontains=city)
        
        # Filter by category
        category = request.query_params.get('category')
        if category:
            experiences = experiences.filter(category=category)
        
        # Filter by eco features
        if request.query_params.get('carbon_neutral') == 'true':
            experiences = experiences.filter(carbon_neutral=True)
        
        if request.query_params.get('eco_certified') == 'true':
            experiences = experiences.filter(eco_certified=True)
        
        # Calculate distance if property location provided
        property_lat = request.query_params.get('latitude')
        property_lon = request.query_params.get('longitude')
        
        if property_lat and property_lon:
            try:
                property_lat = float(property_lat)
                property_lon = float(property_lon)
                
                # Calculate distance for each experience
                experiences_list = list(experiences)
                for exp in experiences_list:
                    if exp.latitude is not None and exp.longitude is not None:
                        exp.distance_from_property = haversine_distance(
                            property_lat, property_lon,
                            exp.latitude, exp.longitude
                        )
                    else:
                        exp.distance_from_property = None
                
                # Sort by distance
                experiences_list.sort(key=lambda x: x.distance_from_property if x.distance_from_property else float('inf'))
                
                serializer = SustainableExperienceSerializer(experiences_list, many=True)
            except ValueError:
                serializer = SustainableExperienceSerializer(experiences, many=True)
        else:
            serializer = SustainableExperienceSerializer(experiences, many=True)
        
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two points on Earth using Haversine formula
    Returns distance in kilometers
    """
    # Convert to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    
    # Earth radius in kilometers
    r = 6371
    
    return round(c * r, 2)


# ==================== DASHBOARD STATS ====================

@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def sustainability_dashboard_stats(request):
    """Get overall sustainability statistics for host"""
    try:
        user = request.user
        
        # Count green certified properties
        certified_properties = GreenCertification.objects.filter(
            host=user,
            status='approved'
        ).count()
        
        # Get total properties
        total_properties = Property.objects.filter(host=user).count()
        
        # Calculate average sustainability score
        certifications = GreenCertification.objects.filter(host=user, status='approved')
        avg_score = sum(c.sustainability_score for c in certifications) / len(certifications) if certifications else 0
        
        # Get recent energy usage trend
        recent_usage = EnergyUsage.objects.filter(
            property__host=user,
            date__gte=timezone.now().date() - timedelta(days=7)
        )
        
        anomaly_count = recent_usage.filter(is_anomaly=True).count()
        
        return Response({
            'certified_properties': certified_properties,
            'total_properties': total_properties,
            'certification_rate': round((certified_properties / total_properties * 100), 1) if total_properties > 0 else 0,
            'avg_sustainability_score': round(avg_score, 1),
            'recent_anomalies': anomaly_count,
            'total_usage_records': recent_usage.count()
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

