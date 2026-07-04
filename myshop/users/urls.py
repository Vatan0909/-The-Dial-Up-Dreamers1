
from django.urls import path
from . import views

urlpatterns = [
    path("", views.auth_page, name="auth"),
    path("login/", views.login_page, name="login"),
    path("logout/", views.logout_page, name="logout"),
    path("register/", views.register_phone, name="register_phone"),
    path("register/verify/", views.register_verify, name="register_verify"),
    path("register/complete/", views.register_complete, name="register_complete"),
]
