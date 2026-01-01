from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Project
from .serializers import ProjectSerializer
from lca_engine.calculations import calculate_lca
from django.http import HttpResponse
from reports.pdf_generator import generate_pdf_report
from reports.excel_generator import generate_excel_report
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
    
class GenerateExcelView(APIView):
    def post(self, request):
        # 1. Get Data
        data = request.data.get('project_data')
        results = request.data.get('results')

        if not data or not results:
             return Response({"error": "Missing project data or results"}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Add AI recommendations (Consistency with PDF)
        # We assume 'data' contains the raw inputs like energy_consumption, etc.
        # Ensure these are floats to avoid errors in the recommender
        try:
             results['recommendations'] = get_ai_recommendations(
                results.get('carbon_footprint', 0),
                float(data.get('energy_consumption', 0)),
                data.get('industry_type', 'Mining')
            )
        except (ValueError, TypeError):
             results['recommendations'] = ["Could not generate specific recommendations due to data error."]

        # 3. Create a temporary Project object object for the generator
        # (The generator expects an object with .name, .industry_type, etc.)
        class MockProject:
            def __init__(self, data):
                self.name = data.get('name', 'Untitled Project')
                self.industry_type = data.get('industry_type', 'Unknown')
                self.energy_consumption = data.get('energy_consumption', 0)
                self.water_usage = data.get('water_usage', 0)
                self.raw_material_qty = data.get('raw_material_qty', 0)
        
        project_obj = MockProject(data)

        # 4. Generate Excel
        excel_file = generate_excel_report(project_obj, results)

        # 5. Return Response
        return excel_file