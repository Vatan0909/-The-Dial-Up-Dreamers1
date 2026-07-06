from django.db.models import Q, OuterRef, Subquery, Prefetch, Min
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from . import models
from .forms import AddToCartForm

def product_detail(request, slug):
    product = get_object_or_404(
        models.Product.objects.prefetch_related("variants", "images", "features", "variants__color"), 
        slug=slug
    )
    form = AddToCartForm(
        product=product,
        initial={"product_id": product.id}
    )
    
    variants = product.variants.all()
    
    # استخراج هوشمند رنگ‌ها با توجه به فیلد کلید خارجی
    available_colors = list(set([v.color.name for v in variants if v.color]))
    available_colors.sort()
    
    memory_flags = [v.has_recording_memory for v in variants]
    available_storages = []
    if True in memory_flags:
        available_storages.append("حافظه‌دار")
    if False in memory_flags:
        available_storages.append("بدون حافظه")
        
    default_color = available_colors[0] if available_colors else None
    default_storage = available_storages[0] if available_storages else None
    memory_map = {"حافظه‌دار": True, "بدون حافظه": False}
    has_recording_memory = memory_map.get(default_storage, False)
    
    # جستجو بر اساس نامِ رنگ متصل شده
    selected_variant = variants.filter(
        color__name=default_color,
        has_recording_memory=has_recording_memory
    ).first()

    if not selected_variant:
        selected_variant = product.variants.first()

    context = {
        'product' : product,
        'form': form,
        'product_colors' : available_colors,
        'product_memories' : available_storages,
        'variants' : variants,
        'default_color': default_color,
        'default_storage': default_storage,
        'default_has_recording_memory': has_recording_memory,
        "selected_variant" : selected_variant,
        'images': product.images.all(),
        'features': product.features.all(),
    }
    return render(request, 'product.html', context)


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
        .order_by("name")
    )
    subcategories = category.children.prefetch_related(
        Prefetch("products", queryset=products_queryset)
    ).order_by("name")

    context = {
        "category": category,
        "subcategories": subcategories
    }
    template_map = {
        "iphone-tasviri": "iphone-tasviri.html",
        "jack-dar-parking": "jack-dar-parking.html",
        "element": "element.html",
        "mohafez-bargh": "mohafez-bargh.html",
    }
    return render(request, template_map.get(slug, "index.html"), context)


def home(request):
    main_categories = models.Category.objects.filter(parent__isnull=True).order_by("name")
    home_sections = []

    for cat in main_categories:
        sub_ids = cat.children.values_list("id", flat=True)
        products = (
            models.Product.objects
            .filter(category_id__in=sub_ids)
            .annotate(min_price=Min("variants__price"))
            .prefetch_related("images")
            .order_by("name")
        )
        home_sections.append({
            "category": cat,
            "products": products
        })

    context = {"home_sections": home_sections}
    return render(request, "index.html", context)


def variant_price(request):
    product_id = request.GET.get("product")
    color = request.GET.get("color")
    memory = request.GET.get("memory")
    
    filter_kwargs = {"product_id": product_id}
    if color:
        filter_kwargs["color__name"] = color  # فیلتر روی جدول متصل
    if memory in ("true", "false"):
        filter_kwargs["has_recording_memory"] = (memory == "true")
    
    variant = models.ProductVariants.objects.filter(**filter_kwargs).first()

    if variant:
        return JsonResponse({"price": variant.price})
    return JsonResponse({"error": "variant not found"})


def search(request):
    query = (request.GET.get("q") or "").strip()
    category_slug = (request.GET.get("category") or "").strip()
    pack_filter = (request.GET.get("pack") or "").strip()
    memory_filter = (request.GET.get("memory") or "").strip()
    color_filter = (request.GET.get("color") or "").strip()
    min_price = request.GET.get("min_price")
    max_price = request.GET.get("max_price")

    products = models.Product.objects.select_related("category", "category__parent")

    if query:
        products = products.filter(
            Q(name__icontains=query) |
            Q(warranty_info__icontains=query) |
            Q(technical_specs__icontains=query) |
            Q(additional_details__icontains=query)
        )

    if category_slug and category_slug not in ('all', 'همه'):
        products = products.filter(
            Q(category__slug=category_slug, category__parent__isnull=True) |
            Q(category__parent__slug=category_slug)
        )

    variant_filters = {}
    
    if pack_filter == "pack":
        variant_filters["variants__is_pack"] = True
    elif pack_filter == "single":
        variant_filters["variants__is_pack"] = False
        
    if memory_filter in ("true", "false"):
        variant_filters["variants__has_recording_memory"] = (memory_filter == "true")
        
    if color_filter and color_filter not in ('all', 'همه', 'null', 'None'):
        variant_filters["variants__color__name"] = color_filter
        
    if min_price:
        variant_filters["variants__price__gte"] = min_price
    if max_price:
        variant_filters["variants__price__lte"] = max_price

    if variant_filters:
        products = products.filter(**variant_filters)

    products = products.distinct()

    variant_kwargs = {k.replace('variants__', ''): v for k, v in variant_filters.items()}
    matching_variants = models.ProductVariants.objects.filter(product=OuterRef('pk'))
    
    if variant_kwargs:
        matching_variants = matching_variants.filter(**variant_kwargs)

    products = (
        products
        .annotate(
            min_price=Subquery(
                matching_variants.order_by('price').values('price')[:1]
            )
        )
        .order_by("name")[:48]
    )

    pref_qs = models.ProductVariants.objects.filter(**variant_kwargs) if variant_kwargs else models.ProductVariants.objects.all()
    products = products.prefetch_related(
        "images",
        Prefetch("variants", queryset=pref_qs)
    )

    parent_categories = models.Category.objects.filter(parent__isnull=True).order_by("name")
    
    # دریافت رنگ‌ها از طریق رابطه کلید خارجی با مرتب‌سازی الفبایی
    colors = list(
        models.ProductVariants.objects
        .exclude(color__isnull=True)
        .values_list("color__name", flat=True)
        .distinct()
        .order_by("color__name")
    )
    
    all_memory_flags = models.ProductVariants.objects.values_list("has_recording_memory", flat=True).distinct()
    memories = []
    if True in all_memory_flags:
        memories.append("حافظه‌دار")
    if False in all_memory_flags:
        memories.append("بدون حافظه")

    if request.headers.get("x-requested-with") == "XMLHttpRequest" or request.GET.get("format") == "json":
        return JsonResponse({
            "query": query,
            "results": [
                {
                    "name": product.name,
                    "slug": product.slug,
                    "price": product.min_price,
                    "url": f"/product/{product.slug}/" if product.slug else "#",
                }
                for product in products
            ],
        })

    return render(request, "search.html", {
        "query": query,
        "products": products,
        "parent_categories": parent_categories,
        "colors": colors,
        "memories": memories,
        "filters": {
            "category": category_slug,
            "pack": pack_filter,
            "memory": memory_filter,
            "color": color_filter,
            "min_price": min_price or "",
            "max_price": max_price or "",
        },
    })