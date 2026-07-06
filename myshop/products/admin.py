from django.contrib import admin
from .models import Category, Product, ProductFeature, ProductVariants, ProductImage, Story, Color

@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)

class ProductFeatureInline(admin.TabularInline):
    model = ProductFeature
    extra = 1

class ProductVariantInline(admin.TabularInline):
    model = ProductVariants
    extra = 1
    fields = ('color', 'has_recording_memory', 'is_pack', 'unit_count', 'price', 'stock')

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "created_at")
    list_filter = ("category",)
    search_fields = ("name",)
    inlines = [
        ProductFeatureInline,
        ProductVariantInline,
        ProductImageInline
    ]

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}

@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ("title", "order", "link", "created_at")
    list_editable = ("order",)
    search_fields = ("title",)
    ordering = ("order", "-created_at")
    fields = ("title", "image", "video", "link", "order")