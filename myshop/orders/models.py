from django.db import models
from django.contrib.auth.models import User
from products.models import ProductVariants

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'در انتظار پرداخت'),
        ('paid', 'پرداخت شده'),
        ('processing', 'در حال پردازش'),
        ('shipped', 'ارسال شده'),
        ('cancelled', 'لغو شده'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    # آدرس را مستقیماً ذخیره می‌کنیم (چون آدرس کاربر ممکن است تغییر کند، 
    # اما آدرس این سفارش باید ثابت بماند
    #هنگامی که کاربر سفارش می‌دهد،  باید در ویو شماره موبایل را از user.profile.phone 
    # و آدرس را از مدل آدرس‌های کاربر خوانده شود و در فیلدهای
    #  phone و address مدل Order کپی شود.
    # قیمت کلی هم به همین شکل باید از مدل سبد خرید در ویو کپی بشه به اینجا
    address = models.TextField() 
    phone = models.CharField(max_length=15)
    total_price = models.DecimalField(max_digits=10, decimal_places=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"سفارش {self.id} - {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    variant = models.ForeignKey(ProductVariants, on_delete=models.PROTECT) # PROTECT برای جلوگیری از حذف واریانت خریداری شده
    price = models.DecimalField(max_digits=10, decimal_places=0) # قیمت در لحظه خرید
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.variant.product.name} - {self.quantity}"
