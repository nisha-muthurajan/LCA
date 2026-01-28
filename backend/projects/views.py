from rest_framework.decorators import api_view, parser_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.http import HttpResponse

import pandas as pd


from ai_models.predict import analyze_dataset
from ai_models.recommender import get_ai_recommendation
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

    # Build an AI recommender input from the uploaded dataset.
    # Prefer the model feature names used by analyze_dataset normalization.
    energy = float(pd.to_numeric(df.get("energy_consumption"), errors="coerce").fillna(0).mean()) if "energy_consumption" in df.columns else 0.0
    water = float(pd.to_numeric(df.get("water_usage"), errors="coerce").fillna(0).mean()) if "water_usage" in df.columns else 0.0
    waste = float(pd.to_numeric(df.get("waste_generated"), errors="coerce").fillna(0).mean()) if "waste_generated" in df.columns else 0.0
    co2 = float(pd.to_numeric(df.get("co2_emission"), errors="coerce").fillna(0).mean()) if "co2_emission" in df.columns else 0.0
    material = float(pd.to_numeric(df.get("raw_material_qty"), errors="coerce").fillna(0).mean()) if "raw_material_qty" in df.columns else 0.0

    ai_recommendation = get_ai_recommendation({
        "energy_consumption": energy,
        "water_usage": water,
        "raw_material_qty": material,
        "waste_generated": waste,
        "co2_emission": co2,
        "sustainability_score": analysis_results.get("average_score"),
    })

    return Response({
        "status": "success",
        "analysis": analysis_results,
        "ai_recommendation": ai_recommendation,
        "recommendations": [ai_recommendation]
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
                # AI-based recommendation from aggregate dataset features
                energy = float(pd.to_numeric(df.get("energy_consumption"), errors="coerce").fillna(0).mean()) if "energy_consumption" in df.columns else 0.0
                water = float(pd.to_numeric(df.get("water_usage"), errors="coerce").fillna(0).mean()) if "water_usage" in df.columns else 0.0
                waste = float(pd.to_numeric(df.get("waste_generated"), errors="coerce").fillna(0).mean()) if "waste_generated" in df.columns else 0.0
                co2 = float(pd.to_numeric(df.get("co2_emission"), errors="coerce").fillna(0).mean()) if "co2_emission" in df.columns else 0.0
                material = float(pd.to_numeric(df.get("raw_material_qty"), errors="coerce").fillna(0).mean()) if "raw_material_qty" in df.columns else 0.0

                ai_recommendation = get_ai_recommendation({
                    "energy_consumption": energy,
                    "water_usage": water,
                    "raw_material_qty": material,
                    "waste_generated": waste,
                    "co2_emission": co2,
                    "sustainability_score": analysis_results.get("average_score"),
                })

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

                # Use AI recommendation text for the dashboard summary.
                recommendation = ai_recommendation.get("recommendation") if isinstance(ai_recommendation, dict) else None

                return Response({
                    "message": f"Successfully processed {len(df)} rows.",
                    "results": {
                        "carbon_footprint": round(total_carbon, 2),
                        "circularity_score": round(avg_circularity, 2),
                        "recommendation": recommendation,
                        "recommendations": [ai_recommendation],
                        "analysis": analysis_results
                    },
                    "ai_recommendation": ai_recommendation,
                    "rows_processed": len(df)
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({"error": f"File processing failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Manual form entry
        data = request.data
        results = calculate_lca(data)

        # Build a tiny dataframe to reuse AI recommender for single entry
        manual_df = pd.DataFrame([{
            'energy_consumption': float(data.get('energy_consumption', 0)),
            'water_usage': float(data.get('water_usage', 0)),
            'waste_generated': float(data.get('waste_generated', 0) or 0),
            'co2_emission': float(data.get('co2_emission', 0) or 0),
        }])
        analysis_results = analyze_dataset(manual_df)
        ai_recommendation = get_ai_recommendation({
            "energy_consumption": float(data.get('energy_consumption', 0) or 0),
            "water_usage": float(data.get('water_usage', 0) or 0),
            "raw_material_qty": float(data.get('raw_material_qty', 0) or 0),
            "waste_generated": float(data.get('waste_generated', 0) or 0),
            "co2_emission": float(data.get('co2_emission', 0) or 0),
            "sustainability_score": analysis_results.get("average_score"),
        })

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
            "ai_recommendation": ai_recommendation,
            "recommendations": [ai_recommendation]
        }, status=status.HTTP_201_CREATED)


class GenerateReportView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        data = request.data.get('project_data', {})
        results = request.data.get('results', {})
        
        if not data and not results:
             return Response({"error": "Missing project data or results"}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure data has a name
        if not data.get('name'):
            data['name'] = 'LCA Assessment Report'
        if not data.get('industry_type'):
            data['industry_type'] = 'Mining'
        if not data.get('date'):
            from datetime import datetime
            data['date'] = datetime.now().strftime('%Y-%m-%d')

        # Add AI recommendations before generating report
        try:
            ai_rec = get_ai_recommendation({
                'energy_consumption': float(data.get('energy_consumption', 0) or 0),
                'water_usage': float(data.get('water_usage', 0) or 0),
                'raw_material_qty': float(data.get('raw_material_qty', 0) or 0),
                'waste_generated': float(data.get('waste_generated', 0) or 0),
                'co2_emission': float(data.get('co2_emission', 0) or results.get('carbon_footprint', 0) or 0),
                'sustainability_score': results.get('circularity_score', 0.5) / 100 if results.get('circularity_score', 0) > 1 else results.get('circularity_score', 0.5),
                'industry_type': data.get('industry_type', 'Mining')
            })
            # Extract recommendation text for PDF
            if isinstance(ai_rec, dict):
                rec_text = ai_rec.get('recommendation', 'AI analysis complete.')
                results['recommendations'] = [rec_text] if isinstance(rec_text, str) else rec_text
            else:
                results['recommendations'] = [str(ai_rec)]
        except Exception as e:
            print(f"AI recommendation error: {e}")
            results['recommendations'] = ["AI sustainability analysis completed."]
        
        pdf = generate_pdf_report(data, results)
        
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="LCA_Report.pdf"'
        return response


class GenerateExcelView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        # 1. Get Data
        data = request.data.get('project_data', {})
        results = request.data.get('results', {})

        if not data and not results:
             return Response({"error": "Missing project data or results"}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Add AI recommendations (Consistency with PDF)
        try:
            ai_rec = get_ai_recommendation({
                'energy_consumption': float(data.get('energy_consumption', 0) or 0),
                'water_usage': float(data.get('water_usage', 0) or 0),
                'raw_material_qty': float(data.get('raw_material_qty', 0) or 0),
                'waste_generated': float(data.get('waste_generated', 0) or 0),
                'co2_emission': float(data.get('co2_emission', 0) or results.get('carbon_footprint', 0) or 0),
                'sustainability_score': results.get('circularity_score', 0.5) / 100 if results.get('circularity_score', 0) > 1 else results.get('circularity_score', 0.5),
                'industry_type': data.get('industry_type', 'Mining')
            })
            # Extract recommendation text for Excel
            if isinstance(ai_rec, dict):
                rec_text = ai_rec.get('recommendation', 'AI analysis complete.')
                results['recommendations'] = [rec_text] if isinstance(rec_text, str) else rec_text
            else:
                results['recommendations'] = [str(ai_rec)]
        except Exception as e:
            print(f"AI recommendation error: {e}")
            results['recommendations'] = ["AI sustainability analysis completed."]

        # 3. Create a temporary Project object for the generator
        # (The generator expects an object with .name, .industry_type, etc.)
        class MockProject:
            def __init__(self, data):
                self.name = data.get('name', 'LCA Assessment')
                self.industry_type = data.get('industry_type', 'Mining')
                self.energy_consumption = data.get('energy_consumption', 0)
                self.water_usage = data.get('water_usage', 0)
                self.raw_material_qty = data.get('raw_material_qty', 0)
        
        project_obj = MockProject(data)

        # 4. Generate Excel
        excel_file = generate_excel_report(project_obj, results)

        # 5. Return Response
        return excel_file


class CompareIndustriesView(APIView):
    """Compare environmental impact between two industry datasets"""
    permission_classes = [AllowAny]
    authentication_classes = []
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file1 = request.FILES.get('file1')
        file2 = request.FILES.get('file2')
        industry1_name = request.data.get('industry1_name', 'Industry 1')
        industry2_name = request.data.get('industry2_name', 'Industry 2')

        if not file1 or not file2:
            return Response({"error": "Both files are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Read datasets
            if file1.name.lower().endswith('.csv'):
                df1 = pd.read_csv(file1)
            else:
                df1 = pd.read_excel(file1)

            if file2.name.lower().endswith('.csv'):
                df2 = pd.read_csv(file2)
            else:
                df2 = pd.read_excel(file2)

            # Process each dataset
            metrics1 = self._calculate_industry_metrics(df1)
            metrics2 = self._calculate_industry_metrics(df2)

            # Calculate differences (percentage)
            differences = self._calculate_differences(metrics1, metrics2)

            # Determine better performer for each metric
            better_performer = self._determine_better_performer(metrics1, metrics2, industry1_name, industry2_name)

            # Generate AI suggestions for improvements
            suggestions = self._generate_suggestions(metrics1, metrics2, industry1_name, industry2_name, differences)

            # Determine overall winner
            overall_winner = self._determine_overall_winner(metrics1, metrics2, industry1_name, industry2_name)

            return Response({
                "industry1": {
                    "name": industry1_name,
                    "metrics": metrics1,
                    "rows_processed": len(df1)
                },
                "industry2": {
                    "name": industry2_name,
                    "metrics": metrics2,
                    "rows_processed": len(df2)
                },
                "differences": differences,
                "better_performer": better_performer,
                "suggestions": suggestions,
                "overall_winner": overall_winner
            }, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": f"Failed to process datasets: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    def _calculate_industry_metrics(self, df):
        """Calculate aggregate metrics from a dataset"""
        def safe_mean(col_names):
            for col in col_names:
                matching = [c for c in df.columns if col.lower() in c.lower()]
                if matching:
                    return float(pd.to_numeric(df[matching[0]], errors='coerce').fillna(0).mean())
            return 0.0

        def safe_sum(col_names):
            for col in col_names:
                matching = [c for c in df.columns if col.lower() in c.lower()]
                if matching:
                    return float(pd.to_numeric(df[matching[0]], errors='coerce').fillna(0).sum())
            return 0.0

        # Extract metrics
        energy = safe_sum(['energy', 'energy_consumption', 'power', 'kwh'])
        water = safe_sum(['water', 'water_usage', 'h2o'])
        material = safe_sum(['material', 'raw_material', 'ore', 'mass', 'metal'])
        waste = safe_sum(['waste', 'waste_generated'])
        co2 = safe_sum(['co2', 'emission', 'carbon'])

        # Calculate carbon footprint using LCA engine logic
        total_carbon = 0
        total_circularity = 0
        count = 0

        for _, row in df.iterrows():
            row_dict = {str(k).strip().lower(): row[k] for k in row.keys()}
            
            def get_val(keys, default=0):
                for key in keys:
                    for col, val in row_dict.items():
                        if key in col and pd.notna(val):
                            try:
                                return float(val)
                            except:
                                pass
                return default

            data = {
                'energy_consumption': get_val(['energy', 'power', 'kwh']),
                'water_usage': get_val(['water', 'h2o']),
                'raw_material_qty': get_val(['material', 'ore', 'metal', 'mass']),
            }
            
            try:
                result = calculate_lca(data)
                total_carbon += result.get('carbon_footprint', 0)
                total_circularity += result.get('circularity_score', 0)
                count += 1
            except:
                pass

        avg_circularity = total_circularity / count if count > 0 else 0

        return {
            'carbon_footprint': round(total_carbon, 2),
            'energy_consumption': round(energy, 2),
            'water_usage': round(water, 2),
            'raw_material_qty': round(material, 2),
            'waste_generated': round(waste, 2),
            'co2_emission': round(co2, 2),
            'circularity_score': round(avg_circularity, 2)
        }

    def _calculate_differences(self, metrics1, metrics2):
        """Calculate percentage differences between two sets of metrics"""
        def pct_diff(v1, v2):
            if v2 == 0:
                return 100 if v1 > 0 else 0
            return round(((v1 - v2) / v2) * 100, 2)

        return {
            'carbon_footprint_diff': pct_diff(metrics1['carbon_footprint'], metrics2['carbon_footprint']),
            'energy_diff': pct_diff(metrics1['energy_consumption'], metrics2['energy_consumption']),
            'water_diff': pct_diff(metrics1['water_usage'], metrics2['water_usage']),
            'material_diff': pct_diff(metrics1['raw_material_qty'], metrics2['raw_material_qty']),
            'circularity_diff': pct_diff(metrics1['circularity_score'], metrics2['circularity_score'])
        }

    def _determine_better_performer(self, metrics1, metrics2, name1, name2):
        """Determine which industry performs better for each metric"""
        return {
            'carbon': name1 if metrics1['carbon_footprint'] < metrics2['carbon_footprint'] else name2,
            'energy': name1 if metrics1['energy_consumption'] < metrics2['energy_consumption'] else name2,
            'water': name1 if metrics1['water_usage'] < metrics2['water_usage'] else name2,
            'material': name1 if metrics1['raw_material_qty'] < metrics2['raw_material_qty'] else name2,
            'circularity': name1 if metrics1['circularity_score'] > metrics2['circularity_score'] else name2  # Higher is better
        }

    def _determine_overall_winner(self, metrics1, metrics2, name1, name2):
        """Determine overall winner based on weighted scoring"""
        score1 = 0
        score2 = 0
        
        # Lower is better for these
        if metrics1['carbon_footprint'] < metrics2['carbon_footprint']:
            score1 += 3  # Carbon weighted higher
        else:
            score2 += 3
            
        if metrics1['energy_consumption'] < metrics2['energy_consumption']:
            score1 += 2
        else:
            score2 += 2
            
        if metrics1['water_usage'] < metrics2['water_usage']:
            score1 += 2
        else:
            score2 += 2
            
        # Higher is better for circularity
        if metrics1['circularity_score'] > metrics2['circularity_score']:
            score1 += 2
        else:
            score2 += 2
            
        return name1 if score1 > score2 else name2

    def _generate_suggestions(self, metrics1, metrics2, name1, name2, differences):
        """Generate AI-driven suggestions for environmental improvement"""
        suggestions1 = []
        suggestions2 = []
        general = []

        # Industry 1 suggestions
        if metrics1['carbon_footprint'] > metrics2['carbon_footprint']:
            suggestions1.append(f"Reduce carbon emissions by {abs(differences['carbon_footprint_diff']):.1f}% to match {name2}'s performance")
            suggestions1.append("Consider transitioning to renewable energy sources like solar or wind")
            suggestions1.append("Implement carbon capture technologies at major emission points")
        else:
            suggestions1.append("Maintain current carbon efficiency practices")
            suggestions1.append("Document best practices for industry-wide sharing")

        if metrics1['energy_consumption'] > metrics2['energy_consumption']:
            suggestions1.append(f"Target {abs(differences['energy_diff']):.1f}% energy reduction through efficiency upgrades")
            suggestions1.append("Invest in energy-efficient equipment and LED lighting systems")
        else:
            suggestions1.append("Continue optimizing energy usage patterns")

        if metrics1['water_usage'] > metrics2['water_usage']:
            suggestions1.append(f"Implement water recycling to reduce usage by {abs(differences['water_diff']):.1f}%")
            suggestions1.append("Install closed-loop cooling systems to minimize water loss")
        else:
            suggestions1.append("Maintain water conservation measures")

        # Industry 2 suggestions
        if metrics2['carbon_footprint'] > metrics1['carbon_footprint']:
            suggestions2.append(f"Reduce carbon emissions by {abs(differences['carbon_footprint_diff']):.1f}% to match {name1}'s performance")
            suggestions2.append("Consider transitioning to renewable energy sources")
            suggestions2.append("Implement carbon capture or offset programs")
        else:
            suggestions2.append("Maintain current carbon efficiency practices")
            suggestions2.append("Share best practices with industry partners")

        if metrics2['energy_consumption'] > metrics1['energy_consumption']:
            suggestions2.append(f"Target {abs(differences['energy_diff']):.1f}% energy reduction")
            suggestions2.append("Conduct energy audit to identify inefficiencies")
        else:
            suggestions2.append("Continue energy optimization efforts")

        if metrics2['water_usage'] > metrics1['water_usage']:
            suggestions2.append(f"Implement water conservation to reduce by {abs(differences['water_diff']):.1f}%")
            suggestions2.append("Use recycled water for non-critical processes")
        else:
            suggestions2.append("Maintain water efficiency standards")

        # General insights
        general.append(f"Carbon footprint gap: {abs(differences['carbon_footprint_diff']):.1f}% - focus on reducing this for maximum environmental benefit")
        general.append(f"Energy efficiency gap: {abs(differences['energy_diff']):.1f}% - renewable energy adoption can help close this")
        general.append(f"Water usage gap: {abs(differences['water_diff']):.1f}% - water recycling systems are highly effective")
        general.append("Consider circular economy practices to improve material efficiency")
        general.append("Regular environmental audits help track improvement progress")
        general.append("Cross-industry collaboration can accelerate sustainability improvements")

        return {
            'industry1': suggestions1[:5],
            'industry2': suggestions2[:5],
            'general': general
        }
