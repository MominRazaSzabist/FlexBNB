from django.urls import path
from . import views

urlpatterns = [
    # Green Certification
    path('green-certifications/', views.green_certifications_list, name='green-certifications-list'),
    path('green-certifications/apply/', views.apply_green_certification, name='apply-green-certification'),
    path('green-certifications/<uuid:property_id>/', views.green_certification_detail, name='green-certification-detail'),
    
    # Carbon Footprint
    path('carbon-footprint/calculate/', views.calculate_carbon_footprint, name='calculate-carbon-footprint'),
    path('carbon-footprint/my-history/', views.my_carbon_history, name='my-carbon-history'),
    
    # Eco Incentives
    path('eco-incentives/', views.eco_incentives_list, name='eco-incentives-list'),
    path('eco-incentives/my-usage/', views.my_eco_incentives, name='my-eco-incentives'),
    
    # Energy & Water Monitoring
    path('energy-usage/', views.energy_usage_list, name='energy-usage-list'),
    
    # Sustainable Experiences
    path('sustainable-experiences/', views.sustainable_experiences_list, name='sustainable-experiences-list'),
    
    # Dashboard Stats
    path('dashboard-stats/', views.sustainability_dashboard_stats, name='sustainability-dashboard-stats'),
]

