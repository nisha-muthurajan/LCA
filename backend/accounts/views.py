from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def user_me(request):
    user = request.user
    return Response({'username': str(user)})
