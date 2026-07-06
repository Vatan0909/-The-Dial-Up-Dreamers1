from django.db import models
from django.core.exceptions import ValidationError

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    parent = models.ForeignKey("self", on_delete=models.PROTECT, null=True, blank=True, related_name='children')

    def clean(self):
        if self.parent == self:
            raise ValidationError("یک دسته نمی‌تواند والد خودش باشد.")
    def __str__(self):
        return self.name

# جدول جدید و کاملاً داینامیک برای مدیریت رنگ‌ها
class Color(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="color name")

    class Meta:
        verbose_name = "color"
        verbose_name_plural = "colors"

    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    name = models.CharField(max_length=200)
    warranty_info = models.CharField(max_length=200)
    technical_specs = models.TextField(blank=True, null=True)
    additional_details = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    slug = models.SlugField(unique=True, null=True)
    intercom_monitor_size = models.CharField(
        max_length=10,
        choices=[('4.3', '4.3 اینچ'), ('7', '7 اینچ')],
        null=True, blank=True,
        verbose_name="size"
    )

    def clean(self):
        if self.category.children.exists():
            raise ValidationError(
                "این دسته‌بندی خیلی کلی است. محصول را در زیردسته‌بندی مختص به خودش قرار دهید."
            )
    def __str__(self):
        return self.name
    
class ProductFeature(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='features')
    description = models.CharField(max_length=300)

    def __str__(self):
        return f"{self.product.name} - {self.description}"

class ProductVariants(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    
    # فیلد رنگ حالا به صورت داینامیک از جدول Color خوانده می‌شود
    color = models.ForeignKey(Color, on_delete=models.SET_NULL, blank=True, null=True, verbose_name="color", related_name="variants")
    has_recording_memory = models.BooleanField(default=False, verbose_name="قابلیت ذخیره تصویر")
    
    price = models.PositiveIntegerField(default=0)
    stock = models.PositiveIntegerField(default=0)
    is_pack = models.BooleanField(default=False, verbose_name="آیا پک است؟")
    unit_count = models.PositiveSmallIntegerField(
        null=True, blank=True,
        choices=[(1, '1 واحدی'), (2, '2 واحدی'), (3, '3 واحدی'), (4, '4 واحدی')],
        verbose_name="تعداد واحد (برای پک)"
    )
    
    def __str__(self):
        color_name = self.color.name if self.color else ''
        return f"{self.product.name} | {color_name} | {self.price:,} price | stock {self.stock}"

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/%Y/%m/%d/')

    def __str__(self):
        return f"Image for {self.product.name}"

class Story(models.Model):
    title = models.CharField(max_length=100)
    image = models.ImageField(upload_to='stories/images/', blank=True, null=True)
    video = models.FileField(upload_to='stories/videos/', blank=True, null=True)
    link = models.URLField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("order", "-created_at")
        verbose_name_plural = "Stories"

    def clean(self):
        if not self.image and not self.video:
            raise ValidationError("برای استوری باید تصویر یا ویدیو انتخاب شود.")

    def __str__(self):
        return self.title