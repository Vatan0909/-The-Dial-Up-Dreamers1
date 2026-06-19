from django import forms
from django.contrib.auth import get_user_model

User = get_user_model()

#--register
class PhoneForm(forms.Form):
    phone_number = forms.CharField(
        max_length=15,
        widget=forms.TextInput(attrs={"placeholder": "09xxxxxxxxx"}),
    )

    def clean_phone_number(self):
        phone = self.cleaned_data["phone_number"]
        if not phone.startswith("09") or not phone.isdigit() or len(phone) != 11:
            raise forms.ValidationError("شماره تلفن معتبر نیست.")
        return phone


class OTPVerifyForm(forms.Form):
    code = forms.CharField(
        max_length=6,
        min_length=6,
        widget=forms.TextInput(attrs={"placeholder": "کد 6 رقمی"}),
    )


class CompleteRegisterForm(forms.Form):
    username = forms.CharField(max_length=150)
    password = forms.CharField(widget=forms.PasswordInput)
    password2 = forms.CharField(widget=forms.PasswordInput, label="تکرار رمز عبور")

    def clean_username(self):
        username = self.cleaned_data["username"]
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError("این نام کاربری قبلاً ثبت شده.")
        return username

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        password2 = cleaned_data.get("password2")
        if password and password2 and password != password2:
            raise forms.ValidationError("رمزهای عبور مطابقت ندارند.")
        return cleaned_data

#--login
class LoginForm(forms.Form):
    username = forms.CharField(max_length=150)
    password = forms.CharField(widget=forms.PasswordInput)
