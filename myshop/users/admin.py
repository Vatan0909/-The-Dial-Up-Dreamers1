from django.contrib import admin
from .models import Address, PhoneOTP, Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone")
    search_fields = ("user__username", "phone")


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("user", "title", "postal_code", "is_default")
    list_filter = ("is_default",)
    search_fields = ("user__username", "title", "address_text", "postal_code")


@admin.register(PhoneOTP)
class PhoneOTPAdmin(admin.ModelAdmin):
    list_display = ("phone_number", "code", "purpose", "is_verified", "created_at")
    list_filter = ("purpose", "is_verified", "created_at")
    search_fields = ("phone_number", "code")
    readonly_fields = ("created_at",)
