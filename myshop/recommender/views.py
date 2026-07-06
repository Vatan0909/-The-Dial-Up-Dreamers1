from django.shortcuts import render
from django.db.models import Prefetch, OuterRef, Subquery, Q
from products.models import Product, ProductVariants

def intercom_results(request):
    screen_size = request.GET.get("screenSize") or ""
    has_memory = request.GET.get("hasMemory")
    unit_type = request.GET.get("unitType") or ""

    # ۱. دریافت کوئری‌پایه محصولات آیفون تصویری (جستجو در خود دسته و تمام زیردسته‌های آن)
    products = Product.objects.filter(
        Q(category__slug="iphone-tasviri") | Q(category__parent__slug="iphone-tasviri")
    ).select_related("category")

    # ۲. اعمال فیلتر سایز مانیتور (مربوط به مدل اصلی Product)
    if screen_size and screen_size not in ("9", ""):
        products = products.filter(intercom_monitor_size=screen_size)

    # ۳. ساخت دیکشنری فیلترهای مربوط به Variantها
    variant_filters = {}
    
    if has_memory in ("true", "false"):
        variant_filters['variants__has_recording_memory'] = (has_memory == "true")

    if unit_type:
        if unit_type == "monitor-only":
            variant_filters['variants__is_pack'] = False
        elif unit_type.startswith("pack-"):
            try:
                variant_filters['variants__is_pack'] = True
                variant_filters['variants__unit_count'] = int(unit_type.split("-")[1])
            except (IndexError, ValueError):
                pass

    # ۴. اعمال تمام فیلترهای Variant به محصول اصلی
    if variant_filters:
        products = products.filter(**variant_filters).distinct()

    # ۵. ساب‌کوئری برای دریافت ارزان‌ترین قیمت دقیقاً از بین Variantهایی که با فیلتر کاربر تطابق دارند
    variant_kwargs = {k.replace('variants__', ''): v for k, v in variant_filters.items()}
    matching_variants = ProductVariants.objects.filter(product=OuterRef('pk'))
    
    if variant_kwargs:
        matching_variants = matching_variants.filter(**variant_kwargs)

    products = products.annotate(
        min_price=Subquery(
            matching_variants.order_by('price').values('price')[:1]
        )
    ).order_by("-created_at")

    # ۶. Prefetch کردن اطلاعات تا در قالب HTML فقط Variantهای مدنظر رندر شوند
    pref_qs = ProductVariants.objects.filter(**variant_kwargs) if variant_kwargs else ProductVariants.objects.all()
    products = products.prefetch_related(
        "images",
        Prefetch("variants", queryset=pref_qs)
    )

    context = {
        "products": products,
        "screen_size": screen_size,
        "has_memory": has_memory,
        "unit_type": unit_type,
    }
    
    return render(request, "recommender/results.html", context)