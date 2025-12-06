"""
Initial seed data for the application.
Run with: python manage.py shell < seed_data.py
Or import and call seed_all() after migrations.
"""


# DISABLED - PersonalityTrait model doesn't exist in simplified version
# def seed_personality_traits():
#     """Create default personality traits"""
#     from apps.users.models import PersonalityTrait
#     
#     traits = [
#         {"name": "Friendly", "icon": "😊", "color": "#22c55e", "description": "Warm and welcoming to new people"},
#         {"name": "Nerdy", "icon": "🤓", "color": "#8b5cf6", "description": "Loves learning and intellectual discussions"},
#         {"name": "Athletic", "icon": "💪", "color": "#ef4444", "description": "Active and sporty lifestyle"},
#         {"name": "Creative", "icon": "🎨", "color": "#f59e0b", "description": "Artistic and imaginative"},
#         {"name": "Adventurous", "icon": "🏔️", "color": "#06b6d4", "description": "Loves exploring and trying new things"},
#         {"name": "Foodie", "icon": "🍕", "color": "#ec4899", "description": "Passionate about food and culinary experiences"},
#         {"name": "Chill", "icon": "😌", "color": "#6366f1", "description": "Relaxed and easy-going personality"},
#         {"name": "Outgoing", "icon": "🎉", "color": "#f97316", "description": "Social and loves meeting new people"},
#         {"name": "Bookworm", "icon": "📚", "color": "#84cc16", "description": "Loves reading and literature"},
#         {"name": "Gamer", "icon": "🎮", "color": "#a855f7", "description": "Passionate about video games"},
#         {"name": "Music Lover", "icon": "🎵", "color": "#14b8a6", "description": "Lives and breathes music"},
#         {"name": "Nature Lover", "icon": "🌿", "color": "#22c55e", "description": "Enjoys the outdoors and nature"},
#     ]
#     
#     for trait_data in traits:
#         PersonalityTrait.objects.get_or_create(
#             name=trait_data["name"],
#             defaults=trait_data
#         )
#     
#     print(f"Created {len(traits)} personality traits")


def seed_activity_categories():
    """Create default activity categories"""
    from apps.activities.models import ActivityCategory
    
    categories = [
        {"name": "Sports & Fitness", "icon": "⚽", "color": "#ef4444", "description": "Physical activities and sports"},
        {"name": "Food & Dining", "icon": "🍽️", "color": "#f59e0b", "description": "Restaurants, cafes, and food experiences"},
        {"name": "Outdoor Adventures", "icon": "🏕️", "color": "#22c55e", "description": "Hiking, camping, and nature activities"},
        {"name": "Social & Meetups", "icon": "👥", "color": "#3b82f6", "description": "General social gatherings"},
        {"name": "Games & Entertainment", "icon": "🎮", "color": "#8b5cf6", "description": "Board games, video games, and fun"},
        {"name": "Arts & Culture", "icon": "🎭", "color": "#ec4899", "description": "Museums, galleries, and cultural events"},
        {"name": "Learning & Education", "icon": "📖", "color": "#06b6d4", "description": "Study groups and educational activities"},
        {"name": "Tech & Gaming", "icon": "💻", "color": "#6366f1", "description": "Tech meetups and gaming sessions"},
        {"name": "Music & Concerts", "icon": "🎵", "color": "#a855f7", "description": "Live music and musical activities"},
        {"name": "Movies & TV", "icon": "🎬", "color": "#f97316", "description": "Watch parties and film events"},
        {"name": "Wellness & Mindfulness", "icon": "🧘", "color": "#14b8a6", "description": "Yoga, meditation, and wellness"},
        {"name": "Pets & Animals", "icon": "🐕", "color": "#84cc16", "description": "Pet-related activities and events"},
    ]
    
    for category_data in categories:
        ActivityCategory.objects.get_or_create(
            name=category_data["name"],
            defaults=category_data
        )
    
    print(f"Created {len(categories)} activity categories")


def seed_all():
    """Run all seed functions"""
    # seed_personality_traits()  # Disabled - model doesn't exist
    seed_activity_categories()
    print("Seeding complete!")


if __name__ == "__main__":
    import django
    django.setup()
    seed_all()
