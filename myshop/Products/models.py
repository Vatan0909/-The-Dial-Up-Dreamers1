from django.db import models

# Create your models here

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    warranty_info = models.CharField(max_length=200)
    technical_specs = models.TextField( blank=True, null=True)
    additional_details = models.TextField( blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
# برای توضیحاتی که در سایت با بولت گذاری نمایش داده میشه
class ProductFeature(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='features')
    # مثلا توصیفات کوتاه به این شکل :پشتیبانی از اتصال به پنل دوم
    description = models.CharField(max_length=300)

    def __str__(self):
        return f"{self.title}: {self.description}"

# برای ویژگی های متغیر
class ProductVariants(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
     # برای گزینه های متفاوتی از محصول که کاربر میتونه انتخاب کنه
    color = models.CharField(max_length=50, blank=True, null=True)
    memory = models.CharField(max_length=50, blank=True, null=True)
    model = models.CharField(max_length=50, blank=True, null=True)
    
    price = models.PositiveIntegerField
    stock = models.PositiveIntegerField(default=0)
    is_pack = models.BooleanField(default=False)
    def __str__(self):
        # نمایش نام محصول، ویژگی‌ها، قیمت و موجودی در یک خط
        return f"{self.product.name} | {self.color or ''} {self.memory or ''} {self.model or ''} | {self.price:,} price |stock {self.stock}"

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/%Y/%m/%d/')

    def __str__(self):
        return f"Image for {self.product.name}"
