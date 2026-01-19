from django.urls import path

from . import api


urlpatterns = [
    path('', api.properties_list, name='api_properties_list'),
    path('create/', api.create_property, name='api_create_property'),
    path('search/', api.search_properties, name='api_search_properties'),
    path('host/search/', api.host_properties_search, name='api_host_properties_search'),
    path('recommendations/', api.recommendations, name='api_recommendations'),
    path('saved/', api.saved_listings, name='api_saved_listings'),
    path('recently-viewed/', api.recently_viewed_list, name='api_recently_viewed'),
    path('<uuid:pk>/', api.properties_detail, name='api_properties_detail'),
    path('<uuid:pk>/toggle_favorite/', api.toggle_saved_listing, name='api_toggle_saved_listing'),
]