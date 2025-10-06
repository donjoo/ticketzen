from django.db import migrations

def create_superuser(apps, schema_editor):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    username = "donjo"
    email = "donjorois@gmail.com"
    password = "Don@1234"
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)

class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_superuser),
    ]
