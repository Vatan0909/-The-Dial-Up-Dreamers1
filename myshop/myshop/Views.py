from django.shortcuts import render, redirect
from django.contrib import messages

#from .models import Profile
def home_page(request):
    return render(request, 'index.html', {})

def contact_us_page(request):
    return render(request, 'contact.html', {})

