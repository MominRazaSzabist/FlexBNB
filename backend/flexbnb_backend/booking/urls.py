from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/stats/', views.host_dashboard_stats, name='host_dashboard_stats'),
    path('reservations/', views.host_reservations, name='host_reservations'),
    path('reservations/create/', views.create_reservation, name='create_reservation'),
    path('reservations/<uuid:reservation_id>/status/', views.update_reservation_status, name='update_reservation_status'),
    path('earnings/', views.host_earnings, name='host_earnings'),
    path('messages/', views.host_messages, name='host_messages'),
    path('messages/send/', views.send_message, name='send_message'),
    path('analytics/', views.property_analytics, name='property_analytics'),
    path('reviews/', views.property_reviews, name='property_reviews'),
]

urlpatterns += [
    path('guest/dashboard/stats/', views.guest_dashboard_stats, name='guest_dashboard_stats'),
    path('guest/reservations/', views.guest_reservations, name='guest_reservations'),
    path('guest/invoices/', views.guest_invoices, name='guest_invoices'),
    path('guest/offers/', views.guest_offers, name='guest_offers'),
    path('guest/wishlist/', views.guest_wishlist, name='guest_wishlist'),
]