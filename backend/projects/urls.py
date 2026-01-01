from django.urls import path
from .views import LCAAnalysisView , GenerateReportView , GenerateExcelView, upload_lca_dataset

urlpatterns = [
    path('analyze/', LCAAnalysisView.as_view(), name='analyze-lca'),
    path('report/', GenerateReportView.as_view(), name='generate-report'),
    path('report/excel/', GenerateExcelView.as_view(), name='report-excel'),
    path("upload-lca/", upload_lca_dataset),
]