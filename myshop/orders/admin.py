
from django.contrib import admin
from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ('variant',)
    extra = 0
    
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'phone', 'total_price', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'phone', 'id')
    readonly_fields = ('total_price', 'created_at')
    inlines = [OrderItemInline]


    raw_id_fields = ('user',)


