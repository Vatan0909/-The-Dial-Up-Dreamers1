# forms.py

from django import forms
from element_orders.models import ElementOrder


class ElementOrderForm(forms.ModelForm):

    class Meta:
        model = ElementOrder
        fields = ['size_cm', 'power_watt', 'reference_image', 'user_notes']
        widgets = {
            'size_cm': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. 30',
                'min': 1,
            }),
            'power_watt': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. 1000',
                'min': 1,
            }),
            'reference_image': forms.ClearableFileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*',
            }),
            'user_notes': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Any additional notes...',
            }),
        }
        labels = {
            'size_cm': 'Size (cm)',
            'power_watt': 'Power (W)',
            'reference_image': 'Reference Image (optional)',
            'user_notes': 'Notes',
        }
