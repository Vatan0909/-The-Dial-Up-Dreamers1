from django import forms
from django.contrib.auth import get_user_model
from symtable import Class

class Loginform(forms.Form):
    username=forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'enter your username'})

    )
    password=forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'enter your password'})
    )

User = get_user_model()

class Registerform(forms.Form):
    Username=forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'enter your username'})

    )
    Email=forms.EmailField(
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'enter your email'})
    )

    Password=forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form_control', 'placeholder': 'enter your password'})
    )
    Password2=forms.CharField(
        label='Confirm password',
        widget=forms.PasswordInput(attrs={'class': 'form_control', 'placeholder': 're-enter your password'})
    )
    def clean_Username(self):
        username=self.cleaned_data.get('Username')
        query = User.objects.filter(username=username)

        if query.exists():
            raise forms.ValidationError('this username is taken')
        return username
    def clean_email(self):
        email=self.cleaned_data.get('Email')
        query = User.objects.filter(email=email)

        if query.exists():
            raise forms.ValidationError('this email is taken')
        return email
    def clean(self):
        data = self.cleaned_data
        password=self.cleaned_data.get('Password')
        password2=self.cleaned_data.get('Password2')
        if password!=password2:
            raise forms.ValidationError("Passwords don't match")
        return data