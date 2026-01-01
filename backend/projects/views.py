from urllib import request
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.http import HttpResponse


from ai_models.predict import analyze_dataset
from ai_models.recommender import generate_recommendations

# Models & Serializers
from .models import Project
from .serializers import ProjectSerializer

# Logic Engines
from lca_engine.calculations import calculate_lca
from ai_models.recommender import get_ai_recommendations

# Report Generators
from reports.pdf_generator import generate_pdf_report
from reports.excel_generator import generate_excel_report

import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Project
from .serializers import ProjectSerializer
from lca_engine.calculations import calculate_lca
from ai_models.recommender import generate_recommendations


@APIView(["POST"])
def upload_lca_dataset(APIView):
    file = request.FILES.get("file")

    if not file:
        return Response({"error": "No file uploaded"}, status=400)

    df = pd.read_csv(file)

    analysis_results = analyze_dataset(df)
    recommendations = generate_recommendations(analysis_results)

    return Response({
        "status": "success",
        "analysis": analysis_results,
        "recommendations": recommendations
    })

class LCAAnalysisView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        projects = Project.objects.all().order_by('-created_at')
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Handles Single Entry OR Bulk File Upload
        """
        # 📂 CASE 1: File Upload (CSV/Excel)
        if 'file' in request.FILES:
            file = request.FILES['file']
            try:
                # Read file based on extension
                if file.name.endswith('.csv'):
                    df = pd.read_csv(file)
                else:
                    df = pd.read_excel(file)

                processed_results = []
                
                # Iterate through rows and process each as a project
                for index, row in df.iterrows():
                    # Map CSV columns to our data structure
                    # Expected CSV headers: name, industry, energy, water, material
                    data = {
                        'name': row.get('name', f"Batch Project {index}"),
                        'industry_type': row.get('industry', 'Mining'),
                        'energy_consumption': float(row.get('energy', 0)),
                        'water_usage': float(row.get('water', 0)),
                        'raw_material_qty': float(row.get('material', 0)),
                    }

                    # Run Calculation
                    results = calculate_lca(data)

                    # Save to DB
                    Project.objects.create(
                        name=data['name'],
                        industry_type=data['industry_type'],
                        energy_consumption=data['energy_consumption'],
                        water_usage=data['water_usage'],
                        raw_material_qty=data['raw_material_qty'],
                        carbon_footprint=results['carbon_footprint'],
                        circularity_score=results['circularity_score']
                    )
                    
                    # Add to results list for the response
                    processed_results.append({**data, **results})

                # Calculate Totals for the Dashboard
                total_carbon = sum(item['carbon_footprint'] for item in processed_results)
                avg_circularity = sum(item['circularity_score'] for item in processed_results) / len(processed_results)

                return Response({
                    "message": f"Successfully processed {len(df)} rows.",
                    "results": {
                        "carbon_footprint": round(total_carbon, 2),
                        "circularity_score": round(avg_circularity, 2),
                        "recommendation": "Batch Analysis Complete. Check Reports for detailed breakdown."
                    }
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({"error": f"File processing failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # 📝 CASE 2: Manual Form Entry (Existing Logic)
        else:
            data = request.data
            results = calculate_lca(data)
            
            try:
                project = Project.objects.create(
                    name=data.get('name', 'Untitled'),
                    industry_type=data.get('industry_type', 'Mining'),
                    energy_consumption=float(data.get('energy_consumption', 0)),
                    water_usage=float(data.get('water_usage', 0)),
                    raw_material_qty=float(data.get('raw_material_qty', 0)),
                    carbon_footprint=results['carbon_footprint'],
                    circularity_score=results['circularity_score']
                )
                return Response({
                    "message": "Analysis Complete",
                    "results": results,
                    "project_id": project.id
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    # Optional: Require login to see the list, but allow anyone to post for now
    permission_classes = [IsAuthenticatedOrReadOnly] 

    def get(self, request):
        """
        Fetch all past LCA projects for the Admin/Reports page.
        """
        # Fetch all projects, sorted by newest first
        projects = Project.objects.all().order_by('-created_at')
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        """
        Analyze a new project, calculate results, and save to database.
        """
        data = request.data
        
        # 1. Run Calculations
        results = calculate_lca(data)
        
        # 2. Save to DB
        # We explicitly map the incoming data to the Project model fields
        # This ensures the project appears in the list later
        try:
            project = Project.objects.create(
                name=data.get('name', 'Untitled Project'),
                industry_type=data.get('industry_type', 'Mining'),
                material=data.get('material', 'Unknown'),
                process_stage=data.get('process_stage', 'Unknown'),
                energy_consumption=float(data.get('energy_consumption', 0)),
                water_usage=float(data.get('water_usage', 0)),
                raw_material_qty=float(data.get('raw_material_qty', 0)),
                # Save calculated results
                carbon_footprint=results['carbon_footprint'],
                circularity_score=results['circularity_score']
            )
            
            project_id = project.id
        except Exception as e:
            # Fallback if DB save fails, still return results so UI doesn't break
            print(f"Error saving project: {e}")
            project_id = None

        return Response({
            "message": "Analysis Complete",
            "results": results,
            "project_id": project_id
        }, status=status.HTTP_201_CREATED)


class GenerateReportView(APIView):
    def post(self, request):
        data = request.data.get('project_data')
        results = request.data.get('results')
        
        if not data or not results:
             return Response({"error": "Missing project data or results"}, status=status.HTTP_400_BAD_REQUEST)

        # Add AI recommendations before generating report
        try:
            results['recommendations'] = get_ai_recommendations(
                results.get('carbon_footprint', 0), 
                float(data.get('energy_consumption', 0)), 
                data.get('industry_type', 'Mining')
            )
        except (ValueError, TypeError):
             results['recommendations'] = ["No specific recommendations generated."]
        
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
        try:
             results['recommendations'] = get_ai_recommendations(
                results.get('carbon_footprint', 0),
                float(data.get('energy_consumption', 0)),
                data.get('industry_type', 'Mining')
            )
        except (ValueError, TypeError):
             results['recommendations'] = ["Could not generate specific recommendations due to data error."]

        # 3. Create a temporary Project object for the generator
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