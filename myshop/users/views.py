from django.contrib import messages
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.db import IntegrityError, transaction
from django.shortcuts import redirect, render

from .forms import CompleteRegisterForm, LoginForm, OTPVerifyForm, PhoneForm, user_for_phone
from .models import PhoneOTP, Profile

User = get_user_model()


def home_page(request):
    return render(request, "index.html")


def contact_us_page(request):
    return render(request, "contact.html")


def _latest_otp(phone, purpose):
    return PhoneOTP.objects.filter(
        phone_number=phone,
        purpose=purpose,
        is_verified=False,
    ).order_by("-created_at").first()


def _create_otp(phone, purpose):
    PhoneOTP.objects.filter(phone_number=phone, purpose=purpose, is_verified=False).delete()
    return PhoneOTP.objects.create(
        phone_number=phone,
        purpose=purpose,
        code=PhoneOTP.generate_code(),
    )


def _verify_otp(phone, purpose, code):
    otp = _latest_otp(phone, purpose)
    if not otp or otp.code != code:
        return None, "کد وارد شده اشتباه است."
    if otp.is_expired():
        return None, "کد منقضی شده است. دوباره کد بگیرید."
    otp.is_verified = True
    otp.save(update_fields=["is_verified"])
    return otp, None


def auth_page(request, mode="register"):
    context = {
        "mode": mode,
        "register_step": 1,
        "login_step": 1,
        "login_method": "otp",
    }

    if request.method == "POST":
        action = request.POST.get("action", "")

        if action == "register_send_otp":
            form = PhoneForm(request.POST)
            context.update({"mode": "register", "register_step": 1})
            if form.is_valid():
                phone = form.cleaned_data["phone_number"]
                if user_for_phone(phone):
                    messages.error(request, "این شماره قبلاً ثبت شده است. لطفاً وارد شوید.")
                    context.update({"mode": "login", "login_step": 1, "login_phone": phone[1:]})
                else:
                    otp = _create_otp(phone, PhoneOTP.PURPOSE_REGISTER)
                    request.session["pending_register_phone"] = phone
                    request.session.pop("register_phone_verified", None)
                    context.update({
                        "mode": "register",
                        "register_step": 2,
                        "register_phone": phone[1:],
                        "register_otp_code": otp.code,
                    })
            else:
                messages.error(request, form.errors.get("phone_number", ["شماره تلفن معتبر نیست."])[0])
                context["register_phone"] = request.POST.get("phone_number", "")

        elif action == "register_verify_otp":
            phone = request.session.get("pending_register_phone")
            form = OTPVerifyForm(request.POST)
            context.update({"mode": "register", "register_step": 2, "register_phone": phone[1:] if phone else ""})
            if not phone:
                messages.error(request, "ابتدا شماره موبایل خود را وارد کنید.")
                context["register_step"] = 1
            elif form.is_valid():
                otp, error = _verify_otp(phone, PhoneOTP.PURPOSE_REGISTER, form.cleaned_data["code"])
                if error:
                    messages.error(request, error)
                    latest_otp = _latest_otp(phone, PhoneOTP.PURPOSE_REGISTER)
                    if latest_otp and not latest_otp.is_expired():
                        context["register_otp_code"] = latest_otp.code
                else:
                    request.session["register_phone_verified"] = True
                    context["register_step"] = 3
            else:
                messages.error(request, "کد تایید باید ۶ رقم باشد.")
                latest_otp = _latest_otp(phone, PhoneOTP.PURPOSE_REGISTER) if phone else None
                if latest_otp and not latest_otp.is_expired():
                    context["register_otp_code"] = latest_otp.code

        elif action == "register_complete":
            phone = request.session.get("pending_register_phone")
            form = CompleteRegisterForm(request.POST)
            context.update({"mode": "register", "register_step": 3, "register_phone": phone[1:] if phone else ""})
            if not phone or not request.session.get("register_phone_verified"):
                messages.error(request, "ابتدا شماره موبایل را با کد تایید اعتبارسنجی کنید.")
                context["register_step"] = 1
            elif form.is_valid():
                if user_for_phone(phone):
                    messages.error(request, "این شماره قبلاً ثبت شده است. لطفاً وارد شوید.")
                    context.update({"mode": "login", "login_step": 1, "login_phone": phone[1:]})
                else:
                    try:
                        with transaction.atomic():
                            user = User.objects.create_user(username=phone, password=form.cleaned_data["password"])
                            Profile.objects.create(user=user, phone=phone)
                    except IntegrityError:
                        messages.error(request, "ثبت‌نام برای این شماره امکان‌پذیر نیست.")
                    else:
                        request.session.pop("pending_register_phone", None)
                        request.session.pop("register_phone_verified", None)
                        login(request, user)
                        return redirect("products:home")
            else:
                error = form.non_field_errors() or form.errors.get("password") or form.errors.get("password2")
                messages.error(request, error[0] if error else "رمز عبور معتبر نیست.")

        elif action == "login_password":
            form = LoginForm(request.POST)
            context.update({"mode": "login", "login_step": 1, "login_method": "password"})
            if form.is_valid():
                phone = form.cleaned_data["phone_number"]
                password = form.cleaned_data.get("password")
                context["login_phone"] = phone[1:]
                if not password:
                    messages.error(request, "رمز عبور را وارد کنید.")
                    return render(request, "users/auth.html", context)
                user = authenticate(request, username=phone, password=password)
                if user is None:
                    candidate = user_for_phone(phone)
                    if candidate:
                        user = authenticate(request, username=candidate.username, password=password)
                if user is not None:
                    login(request, user)
                    return redirect("products:home")
                messages.error(request, "شماره موبایل یا رمز عبور اشتباه است.")
            else:
                messages.error(request, "شماره تلفن معتبر نیست.")
                context["login_phone"] = request.POST.get("phone_number", "")

        elif action == "login_send_otp":
            form = PhoneForm(request.POST)
            context.update({"mode": "login", "login_step": 1, "login_method": "otp"})
            if form.is_valid():
                phone = form.cleaned_data["phone_number"]
                context["login_phone"] = phone[1:]
                if not user_for_phone(phone):
                    messages.error(request, "کاربری با این شماره پیدا نشد. لطفاً ابتدا ثبت‌نام کنید.")
                    context.update({"mode": "register", "register_step": 1, "register_phone": phone[1:]})
                else:
                    otp = _create_otp(phone, PhoneOTP.PURPOSE_LOGIN)
                    request.session["pending_login_phone"] = phone
                    context.update({
                        "mode": "login",
                        "login_step": 2,
                        "login_method": "otp",
                        "login_otp_code": otp.code,
                    })
            else:
                messages.error(request, "شماره تلفن معتبر نیست.")
                context["login_phone"] = request.POST.get("phone_number", "")

        elif action == "login_verify_otp":
            phone = request.session.get("pending_login_phone")
            form = OTPVerifyForm(request.POST)
            context.update({"mode": "login", "login_step": 2, "login_method": "otp", "login_phone": phone[1:] if phone else ""})
            if not phone:
                messages.error(request, "ابتدا شماره موبایل خود را وارد کنید.")
                context["login_step"] = 1
            elif form.is_valid():
                otp, error = _verify_otp(phone, PhoneOTP.PURPOSE_LOGIN, form.cleaned_data["code"])
                if error:
                    messages.error(request, error)
                    latest_otp = _latest_otp(phone, PhoneOTP.PURPOSE_LOGIN)
                    if latest_otp and not latest_otp.is_expired():
                        context["login_otp_code"] = latest_otp.code
                else:
                    user = user_for_phone(phone)
                    if user is None:
                        messages.error(request, "کاربری با این شماره پیدا نشد.")
                        context["login_step"] = 1
                    else:
                        request.session.pop("pending_login_phone", None)
                        login(request, user)
                        return redirect("home")
            else:
                messages.error(request, "کد تایید باید ۶ رقم باشد.")
                latest_otp = _latest_otp(phone, PhoneOTP.PURPOSE_LOGIN) if phone else None
                if latest_otp and not latest_otp.is_expired():
                    context["login_otp_code"] = latest_otp.code

    return render(request, "users/auth.html", context)


def register_phone(request):
    return auth_page(request, mode="register")


def register_verify(request):
    return redirect("register_phone")


def register_complete(request):
    return redirect("register_phone")


def login_page(request):
    return auth_page(request, mode="login")


def logout_page(request):
    logout(request)
    return redirect("login")
