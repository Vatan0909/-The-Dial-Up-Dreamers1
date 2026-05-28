from django.contrib.auth import authenticate, login, get_user, get_user_model , logout
from django.shortcuts import render, redirect
from .forms import Loginform, Registerform
from django.contrib import messages

#from .models import Profile
def home_page(request):
    print(request.user.is_authenticated)
    context = { }
    return render(request, 'index.html', context)

def contact_us_page(request):
    context = {

    }
    return render(request, '', context)

def login_page (request):
    login_form=Loginform(request.POST or None)

    if login_form.is_valid():
        username=login_form.cleaned_data.get('username')
        password=login_form.cleaned_data.get('password')
        user=authenticate(request,username=username,password=password)

        if user is not None:
            return  redirect('/')
        else :
            print('Error')
    context={

        'login_form':login_form,
    }
    return render(request,'login.html',context)
User = get_user_model()


def register_page(request):
    register_form = Registerform(request.POST or None)

    if request.method == 'POST' and register_form.is_valid():

        username = register_form.cleaned_data.get('Username')
        email = register_form.cleaned_data.get('Email')
        password = register_form.cleaned_data.get('Password')
        address = register_form.cleaned_data.get('Address')  #  گرفتن آدرس

        print(f"Username: {username}")
        print(f"Email: {email}")
        print(f"Address: {address}")

        new_user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        request.session['user_address'] = address

        print(f"User created: {new_user}")
        messages.success(request, f'کاربر {username} با موفقیت ثبت شد!')
        return redirect('login')

    elif request.method == 'POST':
        messages.error(request, 'لطفاً خطاهای فرم را اصلاح کنید')

    context = {
        'register_form': register_form,
    }
    return render(request, 'register.html', context)


def logout_page(request):
    logout_page(request)
    return redirect('/login')