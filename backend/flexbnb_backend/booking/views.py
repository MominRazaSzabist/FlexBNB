from rest_framework import status, permissions
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Avg, Count, Q
from django.utils import timezone
from django.conf import settings
from datetime import datetime, timedelta
from useraccount.auth import ClerkAuthentication
from .models import (
    Reservation, 
    HostEarnings, 
    HostMessage, 
    PropertyAnalytics, 
    PropertyReview
)
from .serializers import (
    ReservationSerializer,
    HostEarningsSerializer,
    HostMessageSerializer,
    PropertyAnalyticsSerializer,
    PropertyReviewSerializer,
    HostDashboardStatsSerializer
)
from property.models import Property
from decimal import Decimal
from useraccount.models import Wishlist

@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def create_reservation(request):
    """Create a reservation for a property (guest flow)."""
    # Enhanced authentication check with detailed logging
    print(f"=== Reservation Creation Request ===")
    print(f"User: {request.user}")
    print(f"Is Authenticated: {request.user.is_authenticated if request.user else False}")
    print(f"Auth Header Present: {'Authorization' in request.headers}")
    print(f"Request Method: {request.method}")
    print(f"Request Path: {request.path}")
    
    # Check authentication first
    if not request.user or not request.user.is_authenticated:
        print("ERROR: User not authenticated!")
        print(f"User object: {request.user}")
        print(f"Request headers: {dict(request.headers)}")
        return Response({
            'error': 'Authentication required. Please sign in to make a reservation.',
            'detail': 'User is not authenticated. Please ensure you are signed in and your session is valid.',
            'debug_info': {
                'user': str(request.user) if request.user else None,
                'is_authenticated': request.user.is_authenticated if request.user else False,
                'has_auth_header': 'Authorization' in request.headers
            } if settings.DEBUG else None
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        data = request.data
        property_id = data.get('propertyId') or data.get('property_id')
        if not property_id:
            return Response({'error': 'propertyId is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            prop = Property.objects.get(id=property_id)
        except Property.DoesNotExist:
            return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)

        guest = request.user
        host = prop.Host

        # Dates
        check_in_date = data.get('startDate') or data.get('check_in_date')
        check_out_date = data.get('endDate') or data.get('check_out_date')
        if not check_in_date or not check_out_date:
            return Response({'error': 'startDate and endDate are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Normalize to YYYY-MM-DD
        if isinstance(check_in_date, str):
            check_in_date_str = check_in_date[:10]
        else:
            check_in_date_str = str(check_in_date)
        if isinstance(check_out_date, str):
            check_out_date_str = check_out_date[:10]
        else:
            check_out_date_str = str(check_out_date)

        # Guests count
        guests_count = int(data.get('guestsCount') or data.get('guests_count') or 1)

        # Pricing
        use_hourly = bool(data.get('useHourlyBooking') or False)
        selected_start_time = data.get('startTime')
        selected_end_time = data.get('endTime')

        total_price = Decimal('0')
        booking_fee = Decimal('0')
        host_earnings = Decimal('0')

        if use_hourly and prop.is_hourly_booking and selected_start_time and selected_end_time and prop.price_per_hour:
            # Hourly price calculation to nearest minute
            try:
                start_h, start_m = map(int, str(selected_start_time).split(':'))
                end_h, end_m = map(int, str(selected_end_time).split(':'))
                start_minutes = start_h * 60 + start_m
                end_minutes = end_h * 60 + end_m
                duration_minutes = max(end_minutes - start_minutes, 0)
                total_hours = Decimal(duration_minutes) / Decimal(60)
                total_price = Decimal(prop.price_per_hour) * total_hours
            except Exception:
                total_price = Decimal(prop.price_per_night)
        else:
            # Nightly booking: days difference
            try:
                nights = (timezone.datetime.fromisoformat(check_out_date_str) - timezone.datetime.fromisoformat(check_in_date_str)).days
                nights = max(nights, 1)
            except Exception:
                nights = 1
            total_price = Decimal(prop.price_per_night) * Decimal(nights)

        # Platform fee 10%
        booking_fee = total_price * Decimal('0.10')
        host_earnings = total_price - booking_fee

        reservation = Reservation.objects.create(
            property=prop,
            guest=guest,
            host=host,
            check_in_date=check_in_date_str,
            check_out_date=check_out_date_str,
            guests_count=guests_count,
            total_price=total_price,
            booking_fee=booking_fee,
            host_earnings=host_earnings,
            status='pending',
            special_requests=data.get('specialRequests', ''),
            check_in_time=selected_start_time if use_hourly else None,
            check_out_time=selected_end_time if use_hourly else None,
        )

        print(f"[CREATE_RESERVATION] Reservation created successfully!")
        print(f"[CREATE_RESERVATION] Reservation ID: {reservation.id}")
        print(f"[CREATE_RESERVATION] Host: {host} (ID: {host.id}, Email: {host.email})")
        print(f"[CREATE_RESERVATION] Guest: {guest} (ID: {guest.id}, Email: {guest.email})")
        print(f"[CREATE_RESERVATION] Property: {prop.title} (ID: {prop.id})")
        print(f"[CREATE_RESERVATION] Status: {reservation.status}")

        serializer = ReservationSerializer(reservation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        import traceback
        from django.conf import settings
        error_trace = traceback.format_exc()
        print(f"Reservation creation error: {str(e)}")
        print(f"Traceback: {error_trace}")
        return Response({
            'error': str(e),
            'detail': 'Failed to create reservation. Please check your input and try again.',
            'traceback': error_trace if settings.DEBUG else None
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def host_dashboard_stats(request):
    """Get comprehensive dashboard statistics for the host"""
    user = request.user
    
    # Get all properties for this host
    host_properties = Property.objects.filter(Host=user)
    
    # Calculate stats
    total_properties = host_properties.count()
    
    # Reservations stats
    all_reservations = Reservation.objects.filter(host=user)
    total_reservations = all_reservations.count()
    pending_requests = all_reservations.filter(status='pending').count()
    
    # Earnings stats
    earnings = HostEarnings.objects.filter(host=user)
    total_earnings = earnings.aggregate(total=Sum('net_earnings'))['total'] or 0
    
    # This month earnings
    this_month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    this_month_earnings = earnings.filter(
        created_at__gte=this_month_start
    ).aggregate(total=Sum('net_earnings'))['total'] or 0
    
    # Analytics aggregation
    analytics = PropertyAnalytics.objects.filter(property__in=host_properties)
    occupancy_rate = analytics.aggregate(avg_rate=Avg('occupancy_rate'))['avg_rate'] or 0
    average_rating = analytics.aggregate(avg_rating=Avg('average_rating'))['avg_rating'] or 0
    
    # Unread messages
    unread_messages = HostMessage.objects.filter(
        receiver=user, 
        is_read=False
    ).count()
    
    stats_data = {
        'total_properties': total_properties,
        'total_reservations': total_reservations,
        'pending_requests': pending_requests,
        'total_earnings': total_earnings,
        'this_month_earnings': this_month_earnings,
        'occupancy_rate': occupancy_rate,
        'average_rating': average_rating,
        'unread_messages': unread_messages
    }
    
    serializer = HostDashboardStatsSerializer(stats_data)
    return Response(serializer.data)


@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def host_reservations(request):
    """Get all reservations for the host's properties"""
    user = request.user
    status_filter = request.query_params.get('status', None)
    
    print(f"[HOST_RESERVATIONS] User: {user} (ID: {user.id}, Email: {user.email})")
    print(f"[HOST_RESERVATIONS] Status filter: {status_filter}")
    
    # Get all reservations for this host
    reservations = Reservation.objects.filter(host=user)
    
    print(f"[HOST_RESERVATIONS] Total reservations found: {reservations.count()}")
    
    if status_filter:
        reservations = reservations.filter(status=status_filter)
        print(f"[HOST_RESERVATIONS] After status filter: {reservations.count()}")
    
    reservations = reservations.order_by('-created_at')[:50]  # Limit to latest 50
    
    # Convert to list to ensure it's serializable
    reservations_list = list(reservations)
    print(f"[HOST_RESERVATIONS] Returning {len(reservations_list)} reservations")
    
    serializer = ReservationSerializer(reservations_list, many=True)
    print(f"[HOST_RESERVATIONS] Serialized data: {len(serializer.data)} items")
    
    return Response(serializer.data)


@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def update_reservation_status(request, reservation_id):
    """Approve or decline a booking request"""
    try:
        reservation = Reservation.objects.get(id=reservation_id, host=request.user)
        new_status = request.data.get('status')
        
        if new_status not in ['approved', 'declined']:
            return Response(
                {'error': 'Invalid status. Must be approved or declined'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reservation.status = new_status
        reservation.save()
        
        # If approved, create earnings record
        if new_status == 'approved' and not hasattr(reservation, 'earnings_record'):
            platform_fee = reservation.total_price * 0.1  # 10% platform fee
            net_earnings = reservation.total_price - platform_fee
            
            HostEarnings.objects.create(
                host=request.user,
                reservation=reservation,
                gross_earnings=reservation.total_price,
                platform_fee=platform_fee,
                net_earnings=net_earnings
            )
        
        serializer = ReservationSerializer(reservation)
        return Response(serializer.data)
        
    except Reservation.DoesNotExist:
        return Response(
            {'error': 'Reservation not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def host_earnings(request):
    """Get earnings and financial reports for the host"""
    user = request.user
    
    earnings = HostEarnings.objects.filter(host=user).order_by('-created_at')
    
    # Filter by date range if provided
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    if start_date:
        earnings = earnings.filter(created_at__date__gte=start_date)
    if end_date:
        earnings = earnings.filter(created_at__date__lte=end_date)
    
    serializer = HostEarningsSerializer(earnings, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def host_messages(request):
    """Get messages for the host"""
    user = request.user
    
    messages = HostMessage.objects.filter(
        Q(sender=user) | Q(receiver=user)
    ).order_by('-created_at')
    
    # Mark messages as read if they're received by current user
    unread_messages = messages.filter(receiver=user, is_read=False)
    unread_messages.update(is_read=True)
    
    serializer = HostMessageSerializer(messages, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def send_message(request):
    """Send a message to a guest"""
    reservation_id = request.data.get('reservation_id')
    message_text = request.data.get('message')
    
    try:
        reservation = Reservation.objects.get(id=reservation_id, host=request.user)
        
        message = HostMessage.objects.create(
            reservation=reservation,
            sender=request.user,
            receiver=reservation.guest,
            message=message_text
        )
        
        serializer = HostMessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Reservation.DoesNotExist:
        return Response(
            {'error': 'Reservation not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def property_analytics(request):
    """Get analytics for all host properties"""
    user = request.user
    
    host_properties = Property.objects.filter(Host=user)
    analytics = PropertyAnalytics.objects.filter(property__in=host_properties)
    
    serializer = PropertyAnalyticsSerializer(analytics, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def property_reviews(request):
    """Get all reviews for host properties"""
    user = request.user
    
    host_properties = Property.objects.filter(Host=user)
    reviews = PropertyReview.objects.filter(property__in=host_properties).order_by('-created_at')
    
    serializer = PropertyReviewSerializer(reviews, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def guest_dashboard_stats(request):
    user = request.user
    reservations = Reservation.objects.filter(guest=user)
    total_reservations = reservations.count()
    upcoming_trips = reservations.filter(check_in_date__gt=timezone.now(), status='approved').count()
    total_spent = reservations.aggregate(total=Sum('total_price'))['total'] or 0
    wishlist_count = Wishlist.objects.filter(user=user).count()
    unread_messages = HostMessage.objects.filter(receiver=user, is_read=False).count()
    average_rating_given = PropertyReview.objects.filter(guest=user).aggregate(avg=Avg('rating'))['avg'] or 0

    stats_data = {
        'total_reservations': total_reservations,
        'upcoming_trips': upcoming_trips,
        'total_spent': total_spent,
        'wishlist_count': wishlist_count,
        'unread_messages': unread_messages,
        'average_rating_given': average_rating_given
    }
    serializer = GuestDashboardStatsSerializer(stats_data)
    return Response(serializer.data)

@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def guest_reservations(request):
    reservations = Reservation.objects.filter(guest=request.user).order_by('-created_at')
    serializer = ReservationSerializer(reservations, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def guest_invoices(request):
    invoices = Invoice.objects.filter(reservation__guest=request.user).order_by('-created_at')
    serializer = InvoiceSerializer(invoices, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def guest_offers(request):
    today = timezone.now().date()
    offers = Offer.objects.filter(valid_to__gte=today, valid_from__lte=today)
    serializer = OfferSerializer(offers, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
@permission_classes([permissions.IsAuthenticated])
def guest_wishlist(request):
    wishlist = Wishlist.objects.filter(user=request.user).order_by('-added_at')
    serializer = WishlistSerializer(wishlist, many=True)
    return Response(serializer.data)