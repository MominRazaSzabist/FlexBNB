"""
Debug utility to test authentication
"""
from useraccount.auth import ClerkAuthentication
from django.http import HttpRequest

def test_authentication(token: str):
    """Test if a token can be authenticated"""
    auth = ClerkAuthentication()
    request = HttpRequest()
    request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'
    
    try:
        result = auth.authenticate(request)
        if result:
            user, _ = result
            return {
                'success': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'clerk_id': user.clerk_id
                }
            }
        else:
            return {
                'success': False,
                'error': 'Authentication returned None'
            }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

