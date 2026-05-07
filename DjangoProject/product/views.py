from django.http import Http404


from django.shortcuts import render, get_object_or_404, redirect
from .models import Product
from django.views.generic.list import ListView
from django.views.generic.detail import DetailView


# Create your views here.

def products_view(request):
    products = Product.objects.all()
    context = {
        'products_list': products
    }
    return render(request, 'product_list.html', context)


class Productsveiw(ListView):
    queryset = Product.objects.all()
    template_name = 'product_list.html'

    def get_context_data(self, *args, object_list=..., **kwargs):
        context = super(Productsveiw, self).get_context_data(*args, **kwargs)
        return context

    def get_queryset(self):
        return Product.objects.all()


def product_detail(request, productID):
    product = Product.objects.get_product_by_id(productID)
    if product == None:
        raise Http404("Product does not exist")

    # qs = Product.objects.filter(Product, id=productID)
    # if qs.exists() and qs.count() == 1:
    #     product = qs.first()
    # else:

    context = {
        'product': product
    }
    return render(request, 'product_detail.html', context)


class ProductDetail(DetailView):
    queryset = Product.objects.all()
    template_name = 'product_detail.html'

    def get_context_data(self, *args, object_list=..., **kwargs):
        context = super(ProductDetail, self).get_context_data(*args, **kwargs)
        return context

    def get_object(self, *args, **kwargs):
        productid = self.kwargs.get('pk')
        product = Product.objects.get_product_by_id(productid)
        if product == None:
            raise Http404("Product not exist")
        return product


class ProductActiveList(ListView):
    template_name = 'product_list.html'

    def get_queryset(self):
        return Product.objects.get_active_products()


class ProductActiveDetail(DetailView):
    template_name = 'product_detail.html'

    def get_queryset(self):
        return Product.objects.get_active_products()


class ProductShowWithSlug(DetailView):
    template_name = 'product_detail.html'

    def get_object(self, *args, **kwargs):
        slug = self.kwargs.get('slug')
        try:
            product = Product.objects.get(slug=slug, active=True)
        except Product.DoesNotExist:
            raise Http404("Product does not found")
        except Product.MultipleObjectsReturned:
            raise Http404('')
        return product


def log_out(request):
    logout(request)
    redirect("/")
