from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from . import models

# slug رو هم میدیم. تا بتونیم محصول را با اون پیدا کنیم از دیتابیس 
# به جای id از slug استفاده میکنیم که از url میاد
def product_detail(request, slug):
    product = get_object_or_404( models.Product.objects.prefetch_related("variants", "images", "features")
                                , slug=slug)
    # برای اینکه همه واریانت ها رو یکباره به صفحه بفرستیم تا با جاوا اسکریپت بتونیم قیمت های واریانت های مختلف رو ببینیم
    variants = product.variants.all()
     #  استخراج گزینه‌های موجود برای نمایش در دکمه‌ها
    available_models = product.models_available or []
    available_colors = product.colors_available or []
    available_storages = product.memories_available or []
     #  تعیین گزینه‌های پیش‌فرض (راست‌ترین گزینه‌ها)
    default_model = available_models[0] if available_models else None
    default_color = available_colors[0] if available_colors else None
    default_storage = available_storages[0] if available_storages else None
    # پیدا کردن واریانتی که دقیقاً این مشخصات را دارد
    selected_variant = variants.filter(
        model=default_model,
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
        'product_models' : available_models,
        'product_memories' : available_storages,
        
        'variants' : variants,
        # اینها برای اکتیو کردن دکمه های واریانت در صفحه لازم هستن
        'default_model': default_model,
        'default_color': default_color,
        'default_storage': default_storage,
        # برای اینکه واریانت دیفالت رو هم همون اول بالا اومدن داشته باشیم
        "selected_variant" : selected_variant,
        'images': product.images.all(),
        'features': product.features.all(),
        
    }
    return render(request, '', context)