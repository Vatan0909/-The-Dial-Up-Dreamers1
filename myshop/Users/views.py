
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout, get_user_model
from .forms import PhoneForm, OTPVerifyForm, CompleteRegisterForm, LoginForm
from users.models import PhoneOTP

User = get_user_model()


def home_page(request):
    return render(request, "index.html")


def contact_us_page(request):
    return render(request, "contact.html")


#دریافت شماره تلفن --
def register_phone(request):
    form = PhoneForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        phone = form.cleaned_data["phone_number"]
        code = PhoneOTP.generate_code()

        PhoneOTP.objects.filter(phone_number=phone).delete()
        PhoneOTP.objects.create(phone_number=phone, code=code)


        print(f"[OTP] Phone: {phone} | Code: {code}")

        request.session["pending_phone"] = phone
        return redirect("register_verify")

    return render(request, "register_phone.html", {"form": form})


# تایید کد OTP --
def register_verify(request):
    phone = request.session.get("pending_phone")
    if not phone:
        return redirect("register_phone")

    form = OTPVerifyForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        code = form.cleaned_data["code"]
        try:
            otp = PhoneOTP.objects.get(phone_number=phone, code=code, is_verified=False)
        except PhoneOTP.DoesNotExist:
            form.add_error("code", "کد وارد شده اشتباه است.")
            return render(request, "register_verify.html", {"form": form})

        if otp.is_expired():
            form.add_error("code", "کد منقضی شده. دوباره ثبت‌نام کنید.")
            return render(request, "register_verify.html", {"form": form})

        otp.is_verified = True
        otp.save()
        request.session["phone_verified"] = True
        return redirect("register_complete")

    return render(request, "register_verify.html", {"form": form})


#ساخت اکانت --
def register_complete(request):
    if not request.session.get("phone_verified"):
        return redirect("register_phone")

    phone = request.session.get("pending_phone")
    form = CompleteRegisterForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        user = User.objects.create_user(
            username=form.cleaned_data["username"],
            password=form.cleaned_data["password"],
        )
        # اگر فیلد phone_number روی مدل User اضافه شد:
        # user.phone_number = phone
        # user.save()
        # الان شماره تلفن رو فقط توی session نگه می‌داره و به مدل User وصل نمی‌کنه

        del request.session["pending_phone"]
        del request.session["phone_verified"]

        login(request, user)
        return redirect("home")

    return render(request, "register_complete.html", {"form": form})


#-- Login
def login_page(request):
    form = LoginForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = authenticate(
            request,
            username=form.cleaned_data["username"],
            password=form.cleaned_data["password"],
        )
        if user is not None:
            login(request, user)
            return redirect("home")
        form.add_error(None, "نام کاربری یا رمز عبور اشتباه است.")

    return render(request, "login.html", {"form": form})


#-- Logout
def logout_page(request):
    logout(request)
    return redirect("login")

