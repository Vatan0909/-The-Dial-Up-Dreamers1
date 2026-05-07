from django.contrib.auth import authenticate, login, get_user, get_user_model
from django.shortcuts import render, redirect
from DjangoProject1_2.forms import Loginform ,Registerform
def header(request):
    context={
        'menu_item':'منو سفارشی از رندر پارشیال'

    }
    return render(request, 'base/header.html', context)
def footer(request):
    context={

    }
    return render(request, 'base/footer.html', context)
def home_page(request):
    print(request.user.is_authenticated)
    context={

    }
    return render(request, 'home_page.html', context)

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
    if register_form.is_valid():
        username = register_form.cleaned_data.get('Username')
        print(username)
        email = register_form.cleaned_data.get('email')
        password = register_form.cleaned_data.get('Password')
        new_user=User.objects.create_user(username=username, email=email, password=password)
        print(new_user)
    context={
        'register_form':register_form,
    }
    return render(request,'register.html',context)