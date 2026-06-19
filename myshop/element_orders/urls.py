from django.urls import path
from element_orders.views import element_order_create, element_order_success

urlpatterns = [
    path('element/', element_order_create, name='element_order_create'),
    path('element/success/', element_order_success, name='element_order_success'),
]