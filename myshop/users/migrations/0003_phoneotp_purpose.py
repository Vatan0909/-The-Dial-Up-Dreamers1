from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_phoneotp"),
    ]

    operations = [
        migrations.AddField(
            model_name="phoneotp",
            name="purpose",
            field=models.CharField(
                choices=[("register", "ثبت‌نام"), ("login", "ورود")],
                default="register",
                max_length=20,
            ),
        ),
    ]
