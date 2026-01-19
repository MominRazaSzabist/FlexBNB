"""
Custom exception handler to convert 403 to 401 for authentication failures
and ensure all errors return JSON instead of HTML
"""
from rest_framework.views import exception_handler
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied, APIException
from rest_framework import status
from rest_framework.response import Response
import traceback

def custom_exception_handler(exc, context):
    """
    Custom exception handler that:
    1. Converts PermissionDenied (403) to AuthenticationFailed (401) when it's actually an auth issue
    2. Ensures all exceptions return JSON instead of HTML
    3. Logs full traceback for debugging
    """
    # First, try the default DRF exception handler
    response = exception_handler(exc, context)
    
    if response is not None:
        # If we get a 403 and the user is not authenticated, it's likely an auth issue
        if response.status_code == status.HTTP_403_FORBIDDEN:
            request = context.get('request')
            if request and (not hasattr(request, 'user') or not request.user.is_authenticated):
                # This is actually an authentication issue, not a permission issue
                return Response({
                    'error': 'Authentication required. Please sign in to make a reservation.',
                    'detail': 'Your session may have expired. Please sign in again.',
                    'status': 401
                }, status=status.HTTP_401_UNAUTHORIZED)
    
    # If DRF handler didn't catch it, it's likely a non-DRF exception
    # We need to catch it and return JSON
    if response is None:
        # Log the full traceback for debugging
        error_traceback = traceback.format_exc()
        error_type = type(exc).__name__
        error_message = str(exc)
        
        print(f"[CUSTOM_EXCEPTION_HANDLER] ❌ Unhandled exception: {error_type}")
        print(f"[CUSTOM_EXCEPTION_HANDLER] Error message: {error_message}")
        print(f"[CUSTOM_EXCEPTION_HANDLER] Full traceback:\n{error_traceback}")
        
        # Return JSON error response instead of letting Django return HTML
        return Response(
            {
                'error': 'An unexpected error occurred',
                'detail': error_message,
                'type': error_type,
                'message': 'Please check backend logs for full traceback'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return response

