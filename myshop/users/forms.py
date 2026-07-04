from django import forms
from django.contrib.auth import get_user_model

from .models import Profile

User = get_user_model()


def normalize_phone_number(value):
    persian_digits = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")
    phone = str(value or "").translate(persian_digits)
    phone = "".join(ch for ch in phone if ch.isdigit())

    if phone.startswith("0098"):
        phone = phone[4:]
    if phone.startswith("98") and len(phone) > 10:
        phone = phone[2:]
    if phone.startswith("0") and len(phone) > 10:
        phone = phone[1:]

    if len(phone) == 10 and phone.startswith("9"):
        return f"0{phone}"
    return phone


class PhoneForm(forms.Form):
    phone_number = forms.CharField(max_length=15)

    def clean_phone_number(self):
        phone = normalize_phone_number(self.cleaned_data["phone_number"])
        if not phone.startswith("09") or not phone.isdigit() or len(phone) != 11:
            raise forms.ValidationError("شماره تلفن معتبر نیست.")
        return phone


class OTPVerifyForm(forms.Form):
    code = forms.CharField(max_length=6, min_length=6)

    def clean_code(self):
        code = self.cleaned_data["code"]
        if not code.isdigit():
            raise forms.ValidationError("کد تایید باید عددی باشد.")
        return code


class CompleteRegisterForm(forms.Form):
    password = forms.CharField(widget=forms.PasswordInput, min_length=6)
    password2 = forms.CharField(widget=forms.PasswordInput, label="تکرار رمز عبور")

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        password2 = cleaned_data.get("password2")
        if password and password2 and password != password2:
            raise forms.ValidationError("رمزهای عبور مطابقت ندارند.")
        return cleaned_data


class LoginForm(PhoneForm):
    password = forms.CharField(widget=forms.PasswordInput, required=False)


def user_for_phone(phone):
    try:
        return Profile.objects.select_related("user").get(phone=phone).user
    except Profile.DoesNotExist:
        return User.objects.filter(username=phone).first()
