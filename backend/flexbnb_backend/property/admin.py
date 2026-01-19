from django.contrib import admin

from .models import Property

class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'price_per_night', 'country', 'category')
    # list_filter = ('country', 'category')
    # search_fields = ('title', 'description')
    # list_per_page = 20

admin.site.register(Property, PropertyAdmin)

