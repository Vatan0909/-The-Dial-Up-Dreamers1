from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Profile(models.Model):
    # making one to one relationship between profile model and User model
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=11, null = False, blank = False, unique = True)

    def __str__(self):
        return self.user.username


class Address(models.Model):
    # every user can have multiple addresses
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    title = models.CharField(max_length=50, verbose_name="address title")
    address_text = models.TextField(verbose_name="detailed address")
    postal_code = models.CharField(max_length=10, blank=True, null=True)
    is_default = models.BooleanField(default=False, verbose_name="is default address")

    def __str__(self):
        return f"{self.user.username} - {self.title}"