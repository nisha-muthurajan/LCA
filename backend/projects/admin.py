from django.contrib import admin
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'industry_type', 'carbon_footprint', 'circularity_score', 'created_at')
    list_filter = ('industry_type', 'created_at')
    search_fields = ('name', 'material')