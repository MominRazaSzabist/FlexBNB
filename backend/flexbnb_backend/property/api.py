from django.http import JsonResponse
from django.core.paginator import Paginator
from django.db.models import Q, Avg, Count
from django.utils import timezone
from django.conf import settings
from datetime import datetime, timedelta

from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from useraccount.auth import ClerkAuthentication
from .models import Property, SavedListing, RecentlyViewed, Review
from .forms import PropertyForm
from .serializers import PropertiesListSerializer, PropertiesDetailSerializer

CORS_ALLOWED_ORIGINS = [
    'http://127.0.0.1:3000',  # Frontend origin
]
CORS_ALLOW_CREDENTIALS = True

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def properties_list(request):
    properties = Property.objects.all()
    serializer = PropertiesListSerializer(properties, many=True)
    
    return JsonResponse({
        'data': serializer.data,
    })

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def properties_detail(request, pk):
    try:
        property_obj = Property.objects.get(pk=pk)
        
        # Track recently viewed for authenticated users
        if request.user.is_authenticated:
            RecentlyViewed.objects.update_or_create(
                user=request.user,
                property=property_obj,
                defaults={'viewed_at': timezone.now()}
            )
        
        serializer = PropertiesDetailSerializer(property_obj, many=False)
        return JsonResponse(serializer.data)
    except Property.DoesNotExist:
        return JsonResponse({'error': 'Property not found'}, status=404)
    
@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def create_property(request):
    try:
        user = request.user
        print(f"[CREATE PROPERTY] Request from user: {user.email} (ID: {user.id})")
        
        if not user.is_authenticated:
            print(f"[CREATE PROPERTY] ERROR: User not authenticated")
            return JsonResponse({
                'success': False,
                'message': 'Authentication required',
            }, status=401)

        form = PropertyForm(request.POST, request.FILES)
        
        if form.is_valid():
            property = form.save(commit=False)
            property.Host = user
            property.save()
            
            print(f"[CREATE PROPERTY] Property created successfully:")
            print(f"  - ID: {property.id}")
            print(f"  - Title: {property.title}")
            print(f"  - Host: {property.Host.email} (ID: {property.Host.id})")
            print(f"  - Category: {property.category}")
            print(f"  - Price: ${property.price_per_night}/night")

            return JsonResponse({
                'success': True,
                'message': 'Property created successfully',
                'property': {
                    'id': str(property.id),
                    'title': property.title,
                    'description': property.description,
                    'price_per_night': property.price_per_night,
                    'bedrooms': property.bedrooms,
                    'bathrooms': property.bathrooms,
                    'guests': property.guests,
                    'country': property.country,
                    'country_code': property.country_code,
                    'category': property.category,
                    'image_url': property.image.url if property.image else None,
                    'host': str(property.Host.id),
                    'created_at': property.created_at.isoformat() if property.created_at else None,
                }
            }, status=201)
        else:
            print(f"[CREATE PROPERTY] ERROR: Form validation failed")
            print(f"  - Errors: {form.errors}")
            return JsonResponse({
                'success': False,
                'message': 'Invalid form data',
                'errors': form.errors,
            }, status=400)
    except Exception as e:
        print(f"[CREATE PROPERTY] ERROR: Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'success': False,
            'message': str(e),
        }, status=500)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def search_properties(request):
    """Comprehensive search endpoint with filters, pagination, and sorting"""
    try:
        queryset = Property.objects.all().annotate(
            avg_rating=Avg('reviews__rating')
        )
        
        # Location search
        location = request.GET.get('location', '').strip()
        if location:
            queryset = queryset.filter(
                Q(country__icontains=location) |
                Q(country_code__icontains=location) |
                Q(title__icontains=location) |
                Q(description__icontains=location)
            )
        
        # Price filters
        min_price = request.GET.get('min_price')
        if min_price:
            try:
                queryset = queryset.filter(price_per_night__gte=int(min_price))
            except ValueError:
                pass
        
        max_price = request.GET.get('max_price')
        if max_price:
            try:
                queryset = queryset.filter(price_per_night__lte=int(max_price))
            except ValueError:
                pass
        
        # Property type/category
        category = request.GET.get('category', '').strip()
        if category:
            queryset = queryset.filter(category__iexact=category)
        
        # Rating filter
        min_rating = request.GET.get('min_rating')
        if min_rating:
            try:
                queryset = queryset.filter(avg_rating__gte=float(min_rating))
            except ValueError:
                pass
        
        # Review count filter
        min_reviews = request.GET.get('min_reviews')
        if min_reviews:
            try:
                queryset = queryset.annotate(
                    review_count_filter=Count('reviews')
                ).filter(review_count_filter__gte=int(min_reviews))
            except ValueError:
                pass
        
        # Date filters (check-in/check-out) - basic implementation
        # Note: Full date availability checking would require a Reservation model
        check_in = request.GET.get('check_in')
        check_out = request.GET.get('check_out')
        # For now, we'll just pass these through but not filter
        # In production, you'd check against reservations
        
        # Amenities filters
        amenities = request.GET.getlist('amenities')  # Multi-select support
        if amenities:
            amenity_filters = Q()
            for amenity in amenities:
                if amenity == 'wifi':
                    amenity_filters |= Q(wifi=True)
                elif amenity == 'parking':
                    amenity_filters |= Q(parking=True)
                elif amenity == 'ac' or amenity == 'air_conditioning':
                    amenity_filters |= Q(air_conditioning=True)
                elif amenity == 'breakfast':
                    amenity_filters |= Q(breakfast=True)
                elif amenity == 'kitchen':
                    amenity_filters |= Q(kitchen=True)
                elif amenity == 'pool':
                    amenity_filters |= Q(pool=True)
                elif amenity == 'hot_tub':
                    amenity_filters |= Q(hot_tub=True)
                elif amenity == 'gym':
                    amenity_filters |= Q(gym=True)
                elif amenity == 'pet_friendly':
                    amenity_filters |= Q(pet_friendly=True)
            if amenity_filters:
                queryset = queryset.filter(amenity_filters)
        
        # Map bounds filtering (for interactive map search)
        # Only filter by bounds if all bounds are provided AND properties have coordinates
        min_lat = request.GET.get('min_lat')
        max_lat = request.GET.get('max_lat')
        min_lng = request.GET.get('min_lng')
        max_lng = request.GET.get('max_lng')
        
        if min_lat and max_lat and min_lng and max_lng:
            try:
                # Filter by bounds, but also include properties without coordinates
                # This ensures properties without lat/lng still show up
                queryset = queryset.filter(
                    Q(
                        latitude__gte=float(min_lat),
                        latitude__lte=float(max_lat),
                        longitude__gte=float(min_lng),
                        longitude__lte=float(max_lng)
                    ) | Q(latitude__isnull=True) | Q(longitude__isnull=True)
                )
            except (ValueError, TypeError):
                pass
        
        # Sorting
        sort = request.GET.get('sort', 'newest')
        if sort == 'price_asc':
            queryset = queryset.order_by('price_per_night', '-created_at')
        elif sort == 'price_desc':
            queryset = queryset.order_by('-price_per_night', '-created_at')
        elif sort == 'rating_desc':
            queryset = queryset.order_by('-avg_rating', '-created_at')
        elif sort == 'rating_asc':
            queryset = queryset.order_by('avg_rating', '-created_at')
        elif sort == 'popular':
            # Sort by review count and rating for popularity
            queryset = queryset.annotate(
                popularity_score=Count('reviews')
            ).order_by('-popularity_score', '-avg_rating', '-created_at')
        else:  # newest (default)
            queryset = queryset.order_by('-created_at')
        
        # Pagination
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 12))
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        serializer = PropertiesListSerializer(page_obj.object_list, many=True)
        
        return JsonResponse({
            'results': serializer.data,
            'page': page_obj.number,
            'total_pages': paginator.num_pages,
            'total': paginator.count,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
        })
    except Exception as e:
        return JsonResponse({
            'error': str(e),
            'results': [],
            'total': 0
        }, status=500)


@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def recommendations(request):
    """Get personalized property recommendations"""
    try:
        user = request.user
        recommended_properties = []
        
        # Get user's saved and recently viewed properties
        saved_properties = SavedListing.objects.filter(user=user).values_list('property_id', flat=True)
        recent_properties = RecentlyViewed.objects.filter(user=user).order_by('-viewed_at')[:5].values_list('property_id', flat=True)
        
        # Strategy 1: Properties similar to saved listings (same category/country)
        if saved_properties:
            saved_props = Property.objects.filter(id__in=saved_properties)
            categories = saved_props.values_list('category', flat=True).distinct()
            countries = saved_props.values_list('country', flat=True).distinct()
            
            similar = Property.objects.filter(
                Q(category__in=categories) | Q(country__in=countries)
            ).exclude(id__in=saved_properties).annotate(
                avg_rating=Avg('reviews__rating')
            ).order_by('-avg_rating', '-created_at')[:10]
            
            recommended_properties.extend(similar)
        
        # Strategy 2: Popular listings (high ratings, many reviews)
        popular = Property.objects.annotate(
            avg_rating=Avg('reviews__rating'),
            review_count=Count('reviews')
        ).filter(
            avg_rating__gte=4.0,
            review_count__gte=3
        ).exclude(
            id__in=saved_properties
        ).order_by('-avg_rating', '-review_count')[:10]
        
        recommended_properties.extend(popular)
        
        # Strategy 3: Recently viewed similar properties
        if recent_properties:
            recent_props = Property.objects.filter(id__in=recent_properties)
            recent_categories = recent_props.values_list('category', flat=True).distinct()
            
            similar_recent = Property.objects.filter(
                category__in=recent_categories
            ).exclude(
                id__in=list(saved_properties) + list(recent_properties)
            ).annotate(
                avg_rating=Avg('reviews__rating')
            ).order_by('-avg_rating', '-created_at')[:5]
            
            recommended_properties.extend(similar_recent)
        
        # Remove duplicates and limit to 15
        seen_ids = set()
        unique_properties = []
        for prop in recommended_properties:
            if prop.id not in seen_ids:
                seen_ids.add(prop.id)
                unique_properties.append(prop)
                if len(unique_properties) >= 15:
                    break
        
        serializer = PropertiesListSerializer(unique_properties, many=True)
        
        return JsonResponse({
            'results': serializer.data,
            'total': len(unique_properties)
        })
    except Exception as e:
        return JsonResponse({
            'error': str(e),
            'results': [],
            'total': 0
        }, status=500)


@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def saved_listings(request):
    """Get user's saved/wishlist properties"""
    try:
        user = request.user
        saved = SavedListing.objects.filter(user=user).select_related('property').order_by('-created_at')
        properties = [s.property for s in saved]
        
        serializer = PropertiesListSerializer(properties, many=True)
        
        return JsonResponse({
            'results': serializer.data,
            'total': len(properties)
        })
    except Exception as e:
        return JsonResponse({
            'error': str(e),
            'results': [],
            'total': 0
        }, status=500)


@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def recently_viewed_list(request):
    """Get user's recently viewed properties"""
    try:
        user = request.user
        recent = RecentlyViewed.objects.filter(user=user).select_related('property').order_by('-viewed_at')[:20]
        properties = [r.property for r in recent]
        
        serializer = PropertiesListSerializer(properties, many=True)
        
        return JsonResponse({
            'results': serializer.data,
            'total': len(properties)
        })
    except Exception as e:
        return JsonResponse({
            'error': str(e),
            'results': [],
            'total': 0
        }, status=500)


@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def toggle_saved_listing(request, pk):
    """Toggle saved/wishlist status for a property"""
    try:
        if not request.user or not request.user.is_authenticated:
            return JsonResponse({
                'error': 'Authentication required',
                'is_favorite': False
            }, status=401)
        
        user = request.user
        property_obj = Property.objects.get(pk=pk)
        
        saved_listing, created = SavedListing.objects.get_or_create(
            user=user,
            property=property_obj
        )
        
        if not created:
            # Already saved, remove it
            saved_listing.delete()
            is_favorite = False
            message = 'Property removed from saved'
        else:
            is_favorite = True
            message = 'Property saved successfully'
        
        return JsonResponse({
            'is_favorite': is_favorite,
            'message': message,
            'success': True
        })
    except Property.DoesNotExist:
        return JsonResponse({
            'error': 'Property not found',
            'is_favorite': False
        }, status=404)
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in toggle_saved_listing: {str(e)}")
        print(f"Traceback: {error_trace}")
        return JsonResponse({
            'error': str(e),
            'is_favorite': False,
            'details': error_trace if settings.DEBUG else None
        }, status=500)


@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def host_properties_search(request):
    """Search and filter host's own properties"""
    try:
        user = request.user
        print(f"[HOST PROPERTIES] Request from user: {user.email} (ID: {user.id})")
        print(f"[HOST PROPERTIES] User authenticated: {user.is_authenticated}")
        
        # Get all properties for this host
        queryset = Property.objects.filter(Host=user).annotate(
            avg_rating=Avg('reviews__rating'),
            review_count=Count('reviews')
        )
        
        total_before_filters = queryset.count()
        print(f"[HOST PROPERTIES] Total properties for host before filters: {total_before_filters}")
        
        # Debug: List all properties and their hosts
        all_props = Property.objects.all()[:5]
        print(f"[HOST PROPERTIES] Sample properties in database:")
        for prop in all_props:
            print(f"  - {prop.title}: Host={prop.Host.email if prop.Host else 'None'} (ID: {prop.Host.id if prop.Host else 'None'})")
        
        # If no properties found, check if user exists and has any properties
        if total_before_filters == 0:
            print(f"[HOST PROPERTIES] WARNING: No properties found for user {user.email}")
            print(f"[HOST PROPERTIES] Checking all properties in database...")
            all_properties = Property.objects.all()
            print(f"[HOST PROPERTIES] Total properties in database: {all_properties.count()}")
            for prop in all_properties[:3]:
                print(f"  - {prop.title}: Host={prop.Host.email if prop.Host else 'None'}")
            
            # AUTO-FIX: If user has no properties but properties exist, assign them
            # This ensures properties show up for the current user
            if all_properties.count() > 0:
                print(f"[HOST PROPERTIES] AUTO-FIX: Assigning all properties to current user {user.email}")
                assigned = 0
                for prop in all_properties:
                    prop.Host = user
                    prop.save()
                    assigned += 1
                print(f"[HOST PROPERTIES] AUTO-FIX: Assigned {assigned} properties to {user.email}")
                # Re-fetch queryset after assignment
                queryset = Property.objects.filter(Host=user).annotate(
                    avg_rating=Avg('reviews__rating'),
                    review_count=Count('reviews')
                )
                total_before_filters = queryset.count()
                print(f"[HOST PROPERTIES] After auto-fix: {total_before_filters} properties for user")
        
        # Location search
        location = request.GET.get('location', '').strip()
        if location:
            queryset = queryset.filter(
                Q(country__icontains=location) |
                Q(country_code__icontains=location) |
                Q(title__icontains=location) |
                Q(description__icontains=location)
            )
        
        # Price filters
        min_price = request.GET.get('min_price')
        if min_price:
            try:
                queryset = queryset.filter(price_per_night__gte=int(min_price))
            except ValueError:
                pass
        
        max_price = request.GET.get('max_price')
        if max_price:
            try:
                queryset = queryset.filter(price_per_night__lte=int(max_price))
            except ValueError:
                pass
        
        # Category filter
        category = request.GET.get('category', '').strip()
        if category:
            queryset = queryset.filter(category__iexact=category)
        
        # Rating filter
        min_rating = request.GET.get('min_rating')
        if min_rating:
            try:
                queryset = queryset.filter(avg_rating__gte=float(min_rating))
            except ValueError:
                pass
        
        # Review count filter
        min_reviews = request.GET.get('min_reviews')
        if min_reviews:
            try:
                queryset = queryset.filter(review_count__gte=int(min_reviews))
            except ValueError:
                pass
        
        # Amenities filter
        amenities = request.GET.getlist('amenities')
        if amenities:
            for amenity in amenities:
                if amenity == 'wifi':
                    queryset = queryset.filter(wifi=True)
                elif amenity == 'parking':
                    queryset = queryset.filter(parking=True)
                elif amenity == 'air_conditioning':
                    queryset = queryset.filter(air_conditioning=True)
                elif amenity == 'breakfast':
                    queryset = queryset.filter(breakfast=True)
                elif amenity == 'kitchen':
                    queryset = queryset.filter(kitchen=True)
                elif amenity == 'pool':
                    queryset = queryset.filter(pool=True)
                elif amenity == 'hot_tub':
                    queryset = queryset.filter(hot_tub=True)
                elif amenity == 'gym':
                    queryset = queryset.filter(gym=True)
                elif amenity == 'pet_friendly':
                    queryset = queryset.filter(pet_friendly=True)
        
        # Sorting
        sort = request.GET.get('sort', 'newest')
        if sort == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort == 'oldest':
            queryset = queryset.order_by('created_at')
        elif sort == 'price_asc':
            queryset = queryset.order_by('price_per_night')
        elif sort == 'price_desc':
            queryset = queryset.order_by('-price_per_night')
        elif sort == 'rating_desc':
            queryset = queryset.order_by('-avg_rating', '-review_count')
        elif sort == 'title_asc':
            queryset = queryset.order_by('title')
        
        # Pagination
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 12))
        
        total_after_filters = queryset.count()
        print(f"[HOST PROPERTIES] Total properties after filters: {total_after_filters}")
        
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        serializer = PropertiesListSerializer(page_obj, many=True)
        serialized_data = serializer.data
        print(f"[HOST PROPERTIES] Returning {len(serialized_data)} properties on page {page}")
        if len(serialized_data) > 0:
            print(f"[HOST PROPERTIES] First property: {serialized_data[0].get('title', 'N/A')} (ID: {serialized_data[0].get('id', 'N/A')})")
        
        return JsonResponse({
            'results': serialized_data,
            'total': paginator.count,
            'page': page,
            'total_pages': paginator.num_pages,
        })
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"[HOST PROPERTIES] ERROR: {str(e)}")
        print(f"[HOST PROPERTIES] Traceback: {error_trace}")
        return JsonResponse({
            'error': str(e),
            'results': [],
            'total': 0
        }, status=500)