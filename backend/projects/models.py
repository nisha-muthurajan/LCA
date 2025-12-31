from django.db import models
from django.contrib.auth.models import User

class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.Model(max_length=200)
    industry_type = models.CharField(max_length=50, choices=[('Mining', 'Mining'), ('Metallurgy', 'Metallurgy')])
    material = models.CharField(max_length=50) # e.g., Iron, Aluminum
    process_stage = models.CharField(max_length=50) # e.g., Extraction
    
    # Input Data
    energy_consumption = models.FloatField(help_text="in kWh")
    water_usage = models.FloatField(help_text="in Liters")
    raw_material_qty = models.FloatField(help_text="in Tons")
    
    # AI/LCA Calculated Results (Stored after processing)
    carbon_footprint = models.FloatField(null=True, blank=True)
    circularity_score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name