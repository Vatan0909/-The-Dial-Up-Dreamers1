from django.contrib import admin
from .models import Product


class Product_Admin(admin.ModelAdmin):
    list_display = ['__str__', 'title', 'slug','price', 'active']
    class Meta:
        model = Product


# Register your models here.
admin.site.register(Product, Product_Admin)
