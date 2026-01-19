from rest_framework import status, permissions
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Avg, Count, Q
from django.utils import timezone
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
    
    reservations = Reservation.objects.filter(host=user)
    
    if status_filter:
        reservations = reservations.filter(status=status_filter)
    
    reservations = reservations.order_by('-created_at')[:50]  # Limit to latest 50
    
    serializer = ReservationSerializer(reservations, many=True)
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