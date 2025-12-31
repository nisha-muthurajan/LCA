from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Project
from .serializers import ProjectSerializer
from lca_engine.calculations import calculate_lca
from django.http import HttpResponse
from reports.pdf_generator import generate_pdf_report
from ai_models.recommender import get_ai_recommendations
# from ai_models.predict import predict_emissions # Uncomment when AI model is ready

class LCAAnalysisView(APIView):
    def post(self, request):
        data = request.data
        
        # 1. Run Calculations
        results = calculate_lca(data)
        
        # 2. (Optional) Run AI Prediction
        # ai_results = predict_emissions(data) 
        
        # 3. Save to DB (Optional, requires user auth)
        # project = Project.objects.create(**data, **results)
        
        return Response({
            "message": "Analysis Complete",
            "results": results
        }, status=status.HTTP_200_OK)
    

class GenerateReportView(APIView):
    def post(self, request):
        data = request.data.get('project_data')
        results = request.data.get('results')
        
        # Add AI recommendations before generating report
        results['recommendations'] = get_ai_recommendations(
            results['carbon_footprint'], 
            float(data['energy_consumption']), 
            data['industry_type']
        )
        
        pdf = generate_pdf_report(data, results)
        
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="LCA_Report.pdf"'
        return response