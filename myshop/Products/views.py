from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from . import models
from django.db.models import Prefetch, Min
from django.http import JsonResponse

# slug رو هم میدیم. تا بتونیم محصول را با اون پیدا کنیم از دیتابیس 
# به جای id از slug استفاده میکنیم که از url میاد
def product_detail(request, slug):
    product = get_object_or_404( models.Product.objects.prefetch_related("variants", "images", "features")
                                , slug=slug)
    # برای اینکه همه واریانت ها رو یکباره به صفحه بفرستیم تا با جاوا اسکریپت بتونیم قیمت های واریانت های مختلف رو ببینیم
    variants = product.variants.all()
     #  استخراج گزینه‌های موجود برای نمایش در دکمه‌ها
    available_colors = product.colors_available or []
    available_storages = product.memories_available or []
     #  تعیین گزینه‌های پیش‌فرض (راست‌ترین گزینه‌ها)
    default_color = available_colors[0] if available_colors else None
    default_storage = available_storages[0] if available_storages else None
    # پیدا کردن واریانتی که دقیقاً این مشخصات را دارد
    selected_variant = variants.filter(
        color=default_color,
        memory=default_storage
    ).first()

    # اگر به هر دلیلی واریانتی با این ترکیب پیدا نشد، اولین واریانت موجود را برگردان
    if not selected_variant:
        selected_variant = product.variants.first()

    context = {
        # 'product_name' : product.name,
        # 'product_warranty' : product.warranty_info,
        # 'product_additional_detail' : product.additional_details,
        # 'product_tech_spec' : product.technical_specs,
        # 'default_price' : selected_variant.price,

        #  برای اینکه اصولی تر باشه و استفاده در html راحت تر فقط product رو میفرستم
        'product' : product,
        # برای نمایش گزینه ها
        'product_colors' : available_colors,
        'product_memories' : available_storages,
        
        'variants' : variants,
        # اینها برای اکتیو کردن دکمه های واریانت در صفحه لازم هستن
        'default_color': default_color,
        'default_storage': default_storage,
        # برای اینکه واریانت دیفالت رو هم همون اول بالا اومدن داشته باشیم
        "selected_variant" : selected_variant,
        'images': product.images.all(),
        'features': product.features.all(),
        
    }
    return render(request, '', context)

def category_products(request, slug):

    category = get_object_or_404(
        models.Category,
        slug=slug,
        parent__isnull=True
    )

    products_queryset = (
        models.Product.objects
        .prefetch_related("images", "variants")
        .annotate(min_price=Min("variants__price"))
    )

    subcategories = category.children.prefetch_related(
        Prefetch(
            "products",
            queryset=products_queryset
        )
    )

    context = {
        "category": category,
        "subcategories": subcategories
    }

    return render(request, "", context)

def home(request):

    main_categories = models.Category.objects.filter(parent__isnull=True)

    home_sections = []

    for cat in main_categories:
        
        sub_ids = cat.children.values_list("id", flat=True)
        #مثلا خروجی ای شبیه به این دارد
        #<QuerySet [3, 4, 7, 9]>
        products = (
            models.Product.objects
            .filter(category_id__in=sub_ids)
            .annotate(min_price=Min("variants__price"))
            .prefetch_related("images")
            .order_by("?")[:8]
        )
        # خروجی دیکشنری ای از هر دسته بندی اصلی و محصولات درونش هست
        home_sections.append({
            "category": cat,
            "products": products
        })

    context = {
        "home_sections": home_sections
    }

    return render(request, "index.html", context)

#(برای تغییر قیمت با JS)
#وقتی کاربر رنگ یا حافظه را تغییر می‌دهد.
def variant_price(request):

    product_id = request.GET.get("product")
    color = request.GET.get("color")
    memory = request.GET.get("memory")
    
    variant = models.ProductVariants.objects.filter(
        product_id=product_id,
        color=color,
        memory=memory,
    ).first()

    if variant:
        return JsonResponse({
            "price": variant.price
        })
#این قیمت جدید قراره توی کد های جاوا اسکریپت استفاده بشه
    return JsonResponse({"error": "variant not found"})


def search(request):

    return