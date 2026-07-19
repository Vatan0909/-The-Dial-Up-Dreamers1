from .models import Story


def stories(request):
    return {
        "stories": Story.objects.all()
    }
