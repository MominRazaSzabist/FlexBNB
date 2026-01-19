"""
Custom middleware to handle authentication errors and provide better error messages
"""
from rest_framework.exceptions import AuthenticationFailed
from django.http import JsonResponse
import traceback

class AuthenticationErrorMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        if isinstance(exception, AuthenticationFailed):
            return JsonResponse({
                'error': str(exception),
                'detail': 'Authentication failed. Please ensure you are signed in and your session is valid.',
                'status': 401
            }, status=401)
        return None

