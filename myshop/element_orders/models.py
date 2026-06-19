from django.db import models
from django.contrib.auth.models import User

class ElementOrder(models.Model):

    # کاربر بدون لاگین هم میتونه سفارش ثبت کنه ولی شماره موبایل باید حتما وارد کنه
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='element_orders', null=True, blank=True)
    phone = models.CharField(max_length=15)
    size_cm = models.DecimalField(max_digits=6, decimal_places=2)
    watt = models.PositiveIntegerField(null=True, blank=True)
    is_processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order: {self.phone} - {self.size_cm}cm"
