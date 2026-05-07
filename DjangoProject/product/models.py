import random
from logging import Manager

from django.db import models
import os
from django.db.models.signals import pre_save



def get_file_extension(file):
    base_name = os.path.basename(file)
    name, ext = os.path.splitext(base_name)
    return name, ext


def upload_image(instance, filename):
    rand_name = random.randint(1, 9999999)
    name, ext = get_file_extension(filename)
    final_name=f"{instance.id}-{instance.title}-{rand_name}{ext}"
    print(instance.id)
    print(instance.title)

# class ProductQuerySet(models.query.QuerySet):
#     def active(self):
#         return self.filter(active=True)

# Create your models here.
class ProductManageObject(models.Manager):
    def get_product_by_id(self, productID):
        # def get_queryset(self):
        #     return ProductQuerySet(self.model , self.__db)
        qs = self.get_queryset().filter(id=productID)
        if qs.count()==1:
            return qs.first()
        else:
            return None
    def get_active_products(self):
        return self.get_queryset().filter(active=True)


class Product(models.Model):
    title = models.CharField(max_length=100)
    slug= models.SlugField(default='kd', unique=True)
    description = models.TextField()
    description = models.TextField()
    price = models.DecimalField(max_digits=15, decimal_places=2)
    active = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to=upload_image, null=True, blank=True)
    objects=ProductManageObject()
    def __str__(self):
        return self.title
    def product_url(self):
        return f"/product/{self.slug}"
