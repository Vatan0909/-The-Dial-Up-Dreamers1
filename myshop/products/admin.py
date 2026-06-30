from django.contrib import admin
from itertools import product
from .models import Category, Product, ProductFeature, ProductVariants, ProductImage, Story


class ProductFeatureInline(admin.TabularInline):
    model = ProductFeature
    extra = 1


class ProductVariantInline(admin.TabularInline):
    model = ProductVariants
    extra = 1


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

# برای اینه که ادمین راحت تر بتونه محصولاتش رو اضافه کنه
@admin.action(description="Generate variants")
def generate_variants(modeladmin, request, queryset):
    for product_obj in queryset:
        combos = product(
            product_obj.models_available,
            product_obj.colors_available,
            product_obj.memories_available,
        )

        for model, color, memory in combos:
            ProductVariants.objects.get_or_create(
                product=product_obj,
                model=model,
                color=color,
                memory=memory,
                defaults={"price": 0, "stock": 0},
            )

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    actions = [generate_variants]
    list_display = ("name", "category", "created_at")
    list_filter = ("category",)
    search_fields = ("name",)
#وقتی وارد Add Product می‌شوی، این سه بخش داخل همان صفحه نمایش داده می‌شوند.
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

