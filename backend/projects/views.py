from rest_framework.decorators import api_view, parser_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.http import HttpResponse

import pandas as pd


from ai_models.predict import analyze_dataset
from ai_models.recommender import generate_recommendations
from reports.pdf_generator import generate_pdf_report
from reports.excel_generator import generate_excel_report

# Models & Serializers
from .models import Project
from .serializers import ProjectSerializer

# Logic Engines
from lca_engine.calculations import calculate_lca


# Report Generators
@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def upload_lca_dataset(request):
    file = request.FILES.get("file")

    if not file:
        return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        df = pd.read_csv(file)
    except Exception as exc:
        return Response({"error": f"Unable to read file: {exc}"}, status=status.HTTP_400_BAD_REQUEST)

    analysis_results = analyze_dataset(df)
    recommendations = generate_recommendations(analysis_results)

    return Response({
        "status": "success",
        "analysis": analysis_results,
        "recommendations": recommendations
    })

# Report Generators
class LCAAnalysisView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        projects = Project.objects.all().order_by('-created_at')
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Handle manual JSON or CSV/Excel uploads."""
        # File upload flow
        if 'file' in request.FILES:
            file = request.FILES['file']
            try:
                if file.name.lower().endswith('.csv'):
                    df = pd.read_csv(file)
                else:
                    df = pd.read_excel(file)

                # Run AI analysis on the dataset for recommendations
                analysis_results = analyze_dataset(df)
                recommendations = generate_recommendations(analysis_results)

                processed_results = []
                
                def to_float(val, default=0.0):
                    try:
                        return float(val)
                    except (TypeError, ValueError):
                        return default

                def pick_by_substring(substrs, default=None):
                    for key, val in normalized.items():
                        for sub in substrs:
                            if sub in key and pd.notna(val):
                                return val
                    return default

                for index, row in df.iterrows():
                    normalized = {str(k).strip().lower(): row[k] for k in row.keys()}

                    def pick(keys, default=0):
                        for key in keys:
                            if key in normalized and pd.notna(normalized[key]):
                                return normalized[key]
                        return default

                    data = {
                        'name': pick(['name', 'project', 'project_name', 'batch_id'], f"Batch Project {index}"),
                        'industry_type': pick(['industry', 'industry_type', 'ore_type'], 'Mining'),
                        'energy_consumption': to_float(
                            pick([
                                'energy', 'energy_consumption', 'energy (kwh)', 'energy_kwh', 'energy_con'
                            ], pick_by_substring(['energy']))
                            or pick_by_substring(['co2', 'emission'], 0)
                            or pick_by_substring(['power'], 0)
                            or pick_by_substring(['kwh'], 0)
                            or 0
                        ),
                        'water_usage': to_float(
                            pick([
                                'water', 'water_usage', 'water (liters)', 'water_liters', 'water_recv'
                            ], pick_by_substring(['water', 'h2o']))
                            or 0
                        ),
                        'raw_material_qty': to_float(
                            pick([
                                'material', 'raw_material_qty', 'raw_material', 'material_tons', 'metal_reco', 'extraction'
                            ], pick_by_substring(['metal', 'waste', 'reco', 'ore', 'mass']))
                            or 0
                        ),
                    }

                    results = calculate_lca(data)

                    Project.objects.create(
                        name=data['name'],
                        industry_type=data['industry_type'],
                        energy_consumption=data['energy_consumption'],
                        water_usage=data['water_usage'],
                        raw_material_qty=data['raw_material_qty'],
                        carbon_footprint=results['carbon_footprint'],
                        circularity_score=results['circularity_score']
                    )

                    processed_results.append({**data, **results})

                if not processed_results:
                    return Response({"error": "No valid rows found in the uploaded file."}, status=status.HTTP_400_BAD_REQUEST)

                total_carbon = sum(item['carbon_footprint'] for item in processed_results)
                avg_circularity = sum(item['circularity_score'] for item in processed_results) / len(processed_results)

                # Include a simple aggregate recommendation for the dashboard
                recommendation = "Batch Analysis Complete. Check Reports for detailed breakdown."

                return Response({
                    "message": f"Successfully processed {len(df)} rows.",
                    "results": {
                        "carbon_footprint": round(total_carbon, 2),
                        "circularity_score": round(avg_circularity, 2),
                        "recommendation": recommendation,
                        "recommendations": recommendations,
                        "analysis": analysis_results
                    },
                    "rows_processed": len(df)
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({"error": f"File processing failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Manual form entry
        data = request.data
        results = calculate_lca(data)

        # Build a tiny dataframe to reuse AI recommender for single entry
        manual_df = pd.DataFrame([{
            'energy': float(data.get('energy_consumption', 0)),
            'water': float(data.get('water_usage', 0)),
            'material': float(data.get('raw_material_qty', 0)),
            'process_stage': data.get('process_stage', 'Unknown')
        }])
        analysis_results = analyze_dataset(manual_df)
        recommendations = generate_recommendations(analysis_results)

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
            project_id = project.id
        except Exception as e:
            print(f"Error saving project: {e}")
            project_id = None

        return Response({
            "message": "Analysis Complete",
            "results": results,
            "project_id": project_id,
            "analysis": analysis_results,
            "recommendations": recommendations
        }, status=status.HTTP_201_CREATED)


class GenerateReportView(APIView):
    def post(self, request):
        data = request.data.get('project_data')
        results = request.data.get('results')
        
        if not data or not results:
             return Response({"error": "Missing project data or results"}, status=status.HTTP_400_BAD_REQUEST)

        # Add AI recommendations before generating report
        try:
            results['recommendations'] = generate_recommendations(
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
             results['recommendations'] = generate_recommendations(
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