from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from element_orders.forms import ElementOrderForm


@login_required
def element_order_create(request):
    if request.method == 'POST':
        form = ElementOrderForm(request.POST, request.FILES)
        if form.is_valid():
            order = form.save(commit=False)
            order.user = request.user
            order.save()
            messages.success(request, 'Your order has been submitted successfully.')
            return redirect('element_order_success')

    else:
        form = ElementOrderForm()

    return render(request, 'element_orders/element_order_form.html', {'form': form})


@login_required
def element_order_success(request):
    return render(request, 'element_orders/element_order_success.html')

