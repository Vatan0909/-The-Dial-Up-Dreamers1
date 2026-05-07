from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from .views import (products_view , Productsveiw,product_detail , ProductDetail,
                    ProductActiveDetail ,ProductActiveList,ProductShowWithSlug)
app_name = 'products'
urlpatterns = [
    path('',products_view,name='productView'),
path('<slug>',ProductShowWithSlug.as_view(),name = 'detail'),

    # path('product-cb', Productsveiw.as_view()),
    # path('product-fb/<productID>',product_detail),
    # path('product-cb/<pk>',ProductDetail.as_view()),
    # path('product-active',ProductActiveList.as_view()),
    # path('product-active/<pk>',ProductActiveDetail.as_view()),

]