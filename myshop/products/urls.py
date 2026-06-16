from django.urls import path
from . import views

app_name = "products"

urlpatterns = [

    # صفحه اصلی سایت
    path("", views.home, name="home"),

    # صفحه محصول
    path("product/<slug:slug>/", views.product_detail, name="product_detail"),

    # صفحه دسته بندی
    path("category/<slug:slug>/", views.category_products, name="category_products"),

    # api گرفتن قیمت واریانت
    path("variant-price/", views.variant_price, name="variant_price"),

    # جستجو
    path("search/", views.search, name="search"),
]
