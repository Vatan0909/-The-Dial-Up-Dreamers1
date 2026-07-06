from django import forms
from .models import ProductVariants

class AddToCartForm(forms.Form):
    product_id = forms.IntegerField(widget=forms.HiddenInput())

    color = forms.CharField(
        required=False,
        widget=forms.Select()
    )

    memory = forms.ChoiceField(
        choices=[('true', 'حافظه‌دار'), ('false', 'بدون حافظه')],
        required=False,
        widget=forms.Select()
    )

    quantity = forms.IntegerField(
        min_value=1,
        initial=1,
        label="تعداد",
        widget=forms.NumberInput(attrs={
            "class": "quantity-input",
            "min": 1
        })
    )

    def __init__(self, *args, **kwargs):
        product = kwargs.pop("product", None)
        super().__init__(*args, **kwargs)

        if product:
            colors = list(
                product.variants
                .exclude(color__isnull=True)
                .values_list('color__name', flat=True)
                .distinct()
            )
            self.fields["color"].widget.choices = [(c, c) for c in colors]

    def clean(self):
        cleaned_data = super().clean()

        product_id = cleaned_data.get("product_id")
        color = cleaned_data.get("color")
        memory = cleaned_data.get("memory")

        filter_kwargs = {"product_id": product_id}
        if color:
            filter_kwargs["color__name"] = color
        if memory in ("true", "false"):
            filter_kwargs["has_recording_memory"] = (memory == "true")

        variant = ProductVariants.objects.filter(**filter_kwargs).first()

        if not variant:
            raise forms.ValidationError("واریانت انتخاب شده وجود ندارد")

        cleaned_data["variant"] = variant

        return cleaned_data


class SearchForm(forms.Form):
    q = forms.CharField(
        max_length=100,
        required=False,
        label="جستجو",
        widget=forms.TextInput(attrs={
            "placeholder": "جستجوی محصول..."
        })
    )