# forms.py

from django import forms
from element_orders.models import ElementOrder


class ElementOrderForm(forms.ModelForm):

    class Meta:
        model = ElementOrder
        fields = ['size', 'watt', 'phone',]
        widgets = {
            'size': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. 30',
                'min': 1,
            }),
            'watt': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. 1000',
                'min': 1,
            }),
            'phone': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. 09135558877',
                'min': 1,
                'max': 11,
            })

        }
        labels = {
            'size': 'Size (cm)',
            'watt': 'Power (W)',
            'phone': 'phone number',
        }

