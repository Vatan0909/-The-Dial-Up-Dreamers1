"""
URL configuration for myshop project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls.static import static
from django.contrib import admin
from django.shortcuts import render
from django.urls import path, include
from django.views.static import serve as static_serve
from pathlib import Path

from myshop import settings
from myshop.Views import home_page, contact_us_page

urlpatterns = [
    path("admin/", admin.site.urls),
    path('', home_page, name='home'),
    path("contact-us/", contact_us_page, name="contact"),
    path("user/", include("users.urls")),
    path("element-order/", include("element_orders.urls")),
    path("", include("products.urls")),
]

if settings.DEBUG:
    _static_dir = Path(settings.BASE_DIR) / 'static'
    urlpatterns += [
        path('assets/<path:path>', static_serve, {'document_root': _static_dir / 'assets'}),
        path('bootstrap-pack/<path:path>', static_serve, {'document_root': _static_dir / 'bootstrap-pack'}),
        # partial templates fetched by JS
        path('header.html', lambda req: render(req, 'header.html')),
        path('footer.html', lambda req: render(req, 'footer.html')),
        # all HTML pages accessible by filename
        path('index.html', lambda req: render(req, 'index.html')),
        path('cart.html', lambda req: render(req, 'cart.html')),
        path('product.html', lambda req: render(req, 'product.html')),
        path('contact.html', lambda req: render(req, 'contact.html')),
        path('element.html', lambda req: render(req, 'element.html')),
        path('iphone-tasviri.html', lambda req: render(req, 'iphone-tasviri.html')),
        path('jack-dar-parking.html', lambda req: render(req, 'jack-dar-parking.html')),
        path('mohafez-bargh.html', lambda req: render(req, 'mohafez-bargh.html')),
        path('login.html', lambda req: render(req, 'login.html')),
        path('register.html', lambda req: render(req, 'register.html')),
        path('loader-test.html', lambda req: render(req, 'loader-test.html')),
        path('auth.html', lambda req: render(req, 'auth.html')),
    ]
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)