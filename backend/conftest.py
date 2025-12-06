import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def user_data():
    return {
        'email': 'test@example.com',
        'username': 'testuser',
        'password': 'testpass123',
        'first_name': 'Test',
        'last_name': 'User'
    }


@pytest.fixture
def create_user(db, user_data):
    def make_user(**kwargs):
        data = user_data.copy()
        data.update(kwargs)
        return User.objects.create_user(**data)
    return make_user
