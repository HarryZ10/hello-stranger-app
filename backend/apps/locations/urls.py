from django.urls import path

from .views import CurrentLocationView, MyLocationHistoryView, UpdateLocationView

app_name = 'locations'

urlpatterns = [
    path('update/', UpdateLocationView.as_view(), name='update_location'),
    path('current/', CurrentLocationView.as_view(), name='current_location'),
    path('history/', MyLocationHistoryView.as_view(), name='location_history'),
]
