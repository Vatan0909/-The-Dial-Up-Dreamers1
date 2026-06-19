from django import forms
from .models import ProductVariants


class AddToCartForm(forms.Form):
    product_id = forms.IntegerField(widget=forms.HiddenInput())

    color = forms.CharField(
        required=False,
        widget=forms.Select()
    )

    memory = forms.CharField(
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
            colors = product.colors_available or []
            memories = product.memories_available or []

            self.fields["color"].widget.choices = [
                (c, c) for c in colors
            ]

            self.fields["memory"].widget.choices = [
                (m, m) for m in memories
            ]

    def clean(self):
        cleaned_data = super().clean()

        product_id = cleaned_data.get("product_id")
        color = cleaned_data.get("color")
        memory = cleaned_data.get("memory")

        variant = ProductVariants.objects.filter(
            product_id=product_id,
            color=color,
            memory=memory
        ).first()

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
