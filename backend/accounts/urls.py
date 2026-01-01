from django.urls import path
from .views import RegisterView
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', obtain_auth_token, name='auth_login'),
]
