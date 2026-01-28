from django.urls import path
from .views import LCAAnalysisView, GenerateReportView, GenerateExcelView, CompareIndustriesView, upload_lca_dataset

urlpatterns = [
    path('analyze/', LCAAnalysisView.as_view(), name='analyze-lca'),
    path('report/', GenerateReportView.as_view(), name='generate-report'),
    path('report/pdf/', GenerateReportView.as_view(), name='generate-report-pdf'),
    path('report/excel/', GenerateExcelView.as_view(), name='report-excel'),
    path('compare/', CompareIndustriesView.as_view(), name='compare-industries'),
    path("upload-lca/", upload_lca_dataset),
]