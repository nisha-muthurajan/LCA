from django.urls import path
from .views import LCAAnalysisView , GenerateReportView , GenerateExcelView

urlpatterns = [
    path('analyze/', LCAAnalysisView.as_view(), name='analyze-lca'),
    path('report/', GenerateReportView.as_view(), name='generate-report'),
    path('report/excel/', GenerateExcelView.as_view(), name='report-excel'),
]