from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/stats/', views.host_dashboard_stats, name='host_dashboard_stats'),
    path('reservations/', views.host_reservations, name='host_reservations'),
    path('reservations/<uuid:reservation_id>/status/', views.update_reservation_status, name='update_reservation_status'),
    path('earnings/', views.host_earnings, name='host_earnings'),
    path('messages/', views.host_messages, name='host_messages'),
    path('messages/send/', views.send_message, name='send_message'),
    path('analytics/', views.property_analytics, name='property_analytics'),
    path('reviews/', views.property_reviews, name='property_reviews'),
] 