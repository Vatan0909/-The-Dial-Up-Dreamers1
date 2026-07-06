from django.urls import path
from . import views

app_name = "recommender"

urlpatterns = [
    path("intercom-results/", views.intercom_results, name="intercom_results"),
]
