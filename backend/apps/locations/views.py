from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserLocation
from .serializers import UpdateLocationSerializer, UserLocationSerializer


class UpdateLocationView(APIView):
    """Update user's current location"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = UpdateLocationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            location = serializer.save()
            return Response(
                UserLocationSerializer(location).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyLocationHistoryView(generics.ListAPIView):
    """Get user's location history"""
    serializer_class = UserLocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserLocation.objects.filter(
            user=self.request.user
        ).order_by('-timestamp')[:50]


class CurrentLocationView(generics.RetrieveAPIView):
    """Get user's current location"""
    serializer_class = UserLocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return UserLocation.objects.filter(
            user=self.request.user,
            is_current=True
        ).first()
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"error": "No current location set"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
