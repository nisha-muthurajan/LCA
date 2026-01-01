import openpyxl
from openpyxl.styles import Font
from django.http import HttpResponse
from io import BytesIO

def generate_excel_report(project, results):
    """
    Generates an Excel file for a specific project.
    """
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = f"LCA - {project.name}"

    # 1. Headers
    headers = ["Parameter", "Value", "Unit"]
    sheet.append(headers)
    
    # Style Header
    for cell in sheet[1]:
        cell.font = Font(bold=True, color="FFFFFF")
        sheet.column_dimensions[cell.column_letter].width = 20
        # Note: You might need a simpler fill logic depending on openpyxl version installed
        # This is a safe basic implementation

    # 2. Add Data
    data = [
        ("Project Name", project.name, "-"),
        ("Industry", project.industry_type, "-"),
        ("Energy Consumption", project.energy_consumption, "kWh"),
        ("Water Usage", project.water_usage, "Liters"),
        ("Material Processed", project.raw_material_qty, "Tons"),
        ("---", "---", "---"),
        ("Carbon Footprint", results.get('carbon_footprint'), "kg CO2e"),
        ("Circularity Score", results.get('circularity_score'), "/ 100"),
    ]

    for row in data:
        sheet.append(row)

    # 3. Recommendations
    sheet.append([])
    sheet.append(["AI Recommendations"])
    sheet["A10"].font = Font(bold=True)
    
    recs = results.get('recommendations', ["No specific recommendations generated."])
    if isinstance(recs, list):
        for rec in recs:
            sheet.append([rec])
    else:
        sheet.append([recs])

    # 4. Prepare Response
    buffer = BytesIO()
    workbook.save(buffer)
    buffer.seek(0)
    
    response = HttpResponse(buffer, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = f'attachment; filename=LCA_Report_{project.name}.xlsx'
    return response