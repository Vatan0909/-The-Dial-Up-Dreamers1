from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.contrib import messages
from .models import Order, OrderItem
from cart.cart import Cart
from users.models import Address


@login_required
@transaction.atomic
def order_create(request):
    cart = Cart(request)

    if not cart:
        messages.warning(request, "سبد خرید شما خالی است.")
        return redirect('cart:cart_detail')

    if request.method == 'POST':

        address_id = request.POST.get('address_id')

        if not address_id:
            messages.error(request, "لطفاً یک آدرس انتخاب کنید.")
            return redirect('orders:checkout')

        address_obj = get_object_or_404(Address, id=address_id, user=request.user)

        full_address_text = f"{address_obj.state}، {address_obj.city}، {address_obj.postal_address} - کد پستی: {address_obj.zip_code}"


        total_price = cart.get_total_price()


        order = Order.objects.create(
            user=request.user,
            address=full_address_text,
            phone=request.user.profile.phone,
            total_price=total_price
        )

        order_items = []
        for item in cart:
            order_items.append(
                OrderItem(
                    order=order,
                    variant=item['variant'],
                    price=item['price'],
                    quantity=item['quantity']
                )
            )


        OrderItem.objects.bulk_create(order_items)


        cart.clear()

        # ریدایرکت به درگاه پرداخت یا صفحه موفقیت
        # return redirect('payment:request', order_id=order.id)
        messages.success(request, "سفارش شما با موفقیت ثبت شد.")
        return redirect('orders:order_detail', order_id=order.id)

    user_addresses = Address.objects.filter(user=request.user)
    return render(request, 'orders/checkout.html', {
        'cart': cart,
        'addresses': user_addresses
    })


@login_required
def order_detail(request, order_id):

    order = get_object_or_404(Order, id=order_id, user=request.user)

    context = {
        'order': order,
    }
    return render(request, 'orders/order_detail.html', context)
