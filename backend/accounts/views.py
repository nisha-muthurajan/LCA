from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer

@api_view(['GET'])
def user_me(request):
    user = request.user
    return Response({'username': str(user)})

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer
