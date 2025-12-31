from reportlab.pdfgen import canvas
from io import BytesIO

def generate_pdf_report(project_data, results):
    buffer = BytesIO()
    p = canvas.Canvas(buffer)
    
    # Title
    p.setFont("Helvetica-Bold", 16)
    p.drawString(100, 800, f"LCA Sustainability Report: {project_data['name']}")
    
    # Details
    p.setFont("Helvetica", 12)
    p.drawString(100, 750, f"Industry: {project_data['industry_type']}")
    p.drawString(100, 730, f"Date: {project_data.get('date', 'N/A')}")
    
    # Results Section
    p.setFont("Helvetica-Bold", 14)
    p.drawString(100, 680, "Assessment Results")
    
    p.setFont("Helvetica", 12)
    p.drawString(100, 650, f"Carbon Footprint: {results.get('carbon_footprint')} kg CO2e")
    p.drawString(100, 630, f"Circularity Score: {results.get('circularity_score')}/100")
    
    # AI Recommendations
    p.setFont("Helvetica-Bold", 14)
    p.drawString(100, 580, "AI Recommendations")
    
    y_position = 550
    recommendations = results.get('recommendations', [])
    for rec in recommendations:
        p.setFont("Helvetica", 10)
        p.drawString(100, y_position, f"- {rec}")
        y_position -= 20

    p.showPage()
    p.save()
    
    buffer.seek(0)
    return buffer