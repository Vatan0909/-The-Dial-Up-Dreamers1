from django.shortcuts import render, redirect
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

