import json
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.contrib import messages
from .models import Cart, CartItem
from products.models import ProductVariants

@login_required(login_url='/user/') # آدرس صفحه لاگین خود را در صورت نیاز اینجا تغییر دهید
def cart_detail(request):
    # فقط رندر کردن تمپلیت (اطلاعات را در مرحله بعد با JS از API می‌گیریم)
    cart, _ = Cart.objects.get_or_create(user=request.user)
    return render(request, 'cart.html', {'cart': cart})

@login_required(login_url='/user/')
@require_POST
def cart_add(request):
    # دریافت مقادیر از فرم صفحه محصول
    product_id = request.POST.get('product_id')
    color = request.POST.get('color')
    memory = request.POST.get('memory')
    
    try:
        quantity = int(request.POST.get('quantity', 1))
    except ValueError:
        quantity = 1

    # پیدا کردن واریانت مربوطه
    filter_kwargs = {"product_id": product_id}
    if color:
        filter_kwargs["color__name"] = color
    if memory in ("true", "false"):
        filter_kwargs["has_recording_memory"] = (memory == "true")

    variant = ProductVariants.objects.filter(**filter_kwargs).first()

    # اگر کاربر دیتای عجیبی فرستاد
    if not variant:
        messages.error(request, 'مشخصات انتخاب شده (رنگ/حافظه) نامعتبر است.')
        return redirect(request.META.get('HTTP_REFERER', '/'))

    # ارور عدم موجودی
    if variant.stock == 0:
        messages.error(request, 'این محصول در حال حاضر ناموجود است و باید تماس بگیرید.')
        return redirect('products:product_detail', slug=variant.product.slug)

    # پیدا کردن یا ساختن سبد خرید کاربر
    cart, _ = Cart.objects.get_or_create(user=request.user)
    cart_item, created = CartItem.objects.get_or_create(cart=cart, variant=variant)

    # محاسبه تعداد جدید
    new_quantity = quantity if created else cart_item.quantity + quantity

    # ارور درخواست بیشتر از موجودی انبار
    if new_quantity > variant.stock:
        messages.error(request, f'موجودی کافی نیست! حداکثر {variant.stock} عدد قابل سفارش است.')
        if created:
            cart_item.delete() # پاک کردن آیتم اگر تازه ساخته شده بود
        return redirect('products:product_detail', slug=variant.product.slug)

    # ذخیره در صورت اوکی بودن موجودی
    cart_item.quantity = new_quantity
    cart_item.save()

    messages.success(request, 'محصول با موفقیت به سبد خرید اضافه شد.')
    return redirect('cart:cart_detail')

# === API های مخصوص جاوا اسکریپت (فرانت اند) ===

@login_required
def cart_update(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            item_id = data.get('item_id')
            action = data.get('action') # 'increase', 'decrease', 'set'
            value = data.get('value', 1)

            cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)

            if action == 'increase':
                new_qty = cart_item.quantity + 1
            elif action == 'decrease':
                new_qty = cart_item.quantity - 1
            elif action == 'set':
                new_qty = int(value)
            else:
                return JsonResponse({'success': False, 'error': 'عملیات نامعتبر است'})

            if new_qty > cart_item.variant.stock:
                return JsonResponse({'success': False, 'error': f'موجودی کافی نیست! حداکثر {cart_item.variant.stock} عدد موجود است.'})

            if new_qty < 1:
                cart_item.delete()
            else:
                cart_item.quantity = new_qty
                cart_item.save()

            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'درخواست نامعتبر'})

@login_required
def cart_remove(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            item_id = data.get('item_id')
            cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
            cart_item.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'درخواست نامعتبر'})

@login_required
def cart_data_api(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    items = []
    
    # استفاده از prefetch_related برای بهینه‌سازی دیتابیس
    query = cart.items.all().select_related(
        'variant', 'variant__product', 'variant__color'
    ).prefetch_related('variant__product__variants')
    
    for item in query:
        color_name = item.variant.color.name if item.variant.color else ""
        
        # لاجیک هوشمند: بررسی اینکه آیا این محصول اصلاً آپشن حافظه دارد؟
        memory_str = ""
        has_memory_option = any(v.has_recording_memory for v in item.variant.product.variants.all())
        
        if has_memory_option:
            memory_str = "حافظه‌دار" if item.variant.has_recording_memory else "بدون حافظه"
        
        image_url = ""
        image_obj = item.variant.product.images.first()
        if image_obj:
            image_url = image_obj.image.url

        items.append({
            "item_id": item.id,
            "title": item.variant.product.name,
            "price": item.variant.price,
            "qty": item.quantity,
            "color": color_name,
            "storage": memory_str,
            "image": image_url,
            "stock": item.variant.stock
        })
    
    return JsonResponse({
        "items": items,
        "total_price": cart.total_price,
        "total_count": cart.total_items
    })