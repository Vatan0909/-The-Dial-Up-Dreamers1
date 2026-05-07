from django.shortcuts import render, redirect
from django.contrib.auth import authenticate,login , get_user_model,logout
from django.http import Http404, HttpResponse

from DjangoProject.form import Contactform, Loginform, Registerform


def home_page(request):
    print(request.user.is_authenticated)
    context = {
        'message': 'sms from Views'
    }
    return render(request, 'home_page.html', context)
def about_us_page(request):
    context = {
        'message': 'sms from backend'
    }
    return render(request,'about_us_page.html', context)
def contact_us_page(request):
    contact_form=Contactform()
    if request.method == 'POST' :
        print(request.POST.get('Fullname'))
        print(request.POST.get('Email'))
        print(request.POST.get('Message'))
    context = {
        'message': 'sms from contact us page',
        'contact_form' : contact_form
    }
    return render(request,'contact_us_page.html', context,)
def login_page(request):


    login_form=Loginform(request.POST or None)

    if login_form.is_valid():
        username=login_form.cleaned_data.get('Username')
        password=login_form.cleaned_data.get('Password')
        user=authenticate(request,username=username,password=password)

        if user is not None:
            return  redirect('/')
        else :
            print('Error')

    context = {
        'message': 'sms from backend Login',
        'login_form': login_form
    }
    return render(request, 'auth/login_page.html', context)
user=get_user_model()
def register_page(request):
    register_form=Registerform(request.POST or None)
    if register_form.is_valid():
        username = register_form.cleaned_data.get('Username')
        print(username)
        email    = register_form.cleaned_data.get('email')
        password = register_form.cleaned_data.get('Password')
        user.objects.create_user(username=username,email=email,password=password)

    context={
        'title': 'Register Page',
        'message': 'Register Form',
        'register_form' : register_form
    }
    return render(request, 'auth/Register_page.html', context)


def log_out(request):
    logout(request)
    redirect('/')
