
# forms.py

from django import forms
from element_orders.models import ElementOrder


class ElementOrderForm(forms.ModelForm):

    class Meta:
        model = ElementOrder
        fields = ['size_cm', 'watt', 'phone']
        widgets = {
            'size_cm': forms.NumberInput(attrs={
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
            'size_cm': 'Size (cm)',
            'watt': 'Power (W)',
            'phone': 'phone number',
        }

