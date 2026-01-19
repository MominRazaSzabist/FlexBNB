from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.conf import settings
import jwt
import requests
import os

User = get_user_model()

class ClerkAuthentication(BaseAuthentication):
    def authenticate(self, request):
        # Get the auth header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            print(f"[AUTH] No Authorization header or invalid format. Header: {auth_header[:50] if auth_header else 'None'}")
            return None

        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            print("[AUTH] Invalid Authorization header format")
            return None
        
        if not token or len(token) < 10:
            print(f"[AUTH] Token is too short or empty. Length: {len(token) if token else 0}")
            return None
        
        print(f"[AUTH] Token received. Length: {len(token)}")
        
        try:
            # Get Clerk's JWKS (JSON Web Key Set)
            clerk_issuer = settings.CLERK_ISSUER
            jwks_url = f"{clerk_issuer}/.well-known/jwks.json"
            
            # Decode the token header to get the key ID (kid)
            header = jwt.get_unverified_header(token)
            kid = header.get('kid')
            
            if not kid:
                raise AuthenticationFailed('Invalid token: no key ID')
            
            # Get the public key from Clerk
            response = requests.get(jwks_url)
            if response.status_code != 200:
                raise AuthenticationFailed('Failed to fetch public key')
            
            jwks = response.json()
            public_key = None
            
            # Find the correct public key
            for key in jwks.get('keys', []):
                if key.get('kid') == kid:
                    public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                    break
            
            if not public_key:
                raise AuthenticationFailed('Public key not found')
            
            # First decode without verification to check the audience
            unverified_payload = jwt.decode(token, options={'verify_signature': False})
            
            # Get the audience from the token
            token_aud = unverified_payload.get('aud', [])
            if isinstance(token_aud, str):
                token_aud = [token_aud]
            
            # Verify and decode the token - Try multiple strategies
            decoded = None
            allowed_audiences = os.environ.get('CLERK_ALLOWED_AUDIENCES', '')
            allowed_audiences_list = [aud.strip() for aud in allowed_audiences.split(',') if aud.strip()]
            
            # Strategy 1: Full verification with audience (if configured)
            if allowed_audiences_list:
                try:
                    decoded = jwt.decode(
                        token,
                        public_key,
                        algorithms=['RS256'],
                        audience=allowed_audiences_list if len(allowed_audiences_list) > 1 else allowed_audiences_list[0],
                        issuer=clerk_issuer,
                        options={
                            'verify_exp': True,
                            'verify_iss': True
                        }
                    )
                    print("Token verified with full validation (with audience)")
                except Exception as e:
                    print(f"Full validation failed: {str(e)}, trying fallback...")
                    decoded = None
            
            # Strategy 2: Without audience verification
            if not decoded:
                try:
                    decoded = jwt.decode(
                        token,
                        public_key,
                        algorithms=['RS256'],
                        issuer=clerk_issuer,
                        options={
                            'verify_exp': True,
                            'verify_iss': True,
                            'verify_aud': False
                        }
                    )
                    print("Token verified without audience check")
                except Exception as e:
                    print(f"Validation without audience failed: {str(e)}, trying lenient mode...")
                    decoded = None
            
            # Strategy 3: Lenient mode - only verify signature and expiration
            if not decoded:
                try:
                    decoded = jwt.decode(
                        token,
                        public_key,
                        algorithms=['RS256'],
                        options={
                            'verify_exp': True,
                            'verify_iss': False,  # Don't verify issuer
                            'verify_aud': False   # Don't verify audience
                        }
                    )
                    print("Token verified in lenient mode (signature + expiration only)")
                except jwt.ExpiredSignatureError:
                    print("Token has expired")
                    raise AuthenticationFailed('Token has expired. Please sign in again.')
                except Exception as e:
                    print(f"Lenient validation failed: {str(e)}")
                    decoded = None
            
            # Strategy 4: Last resort - minimal verification (only signature)
            if not decoded and settings.DEBUG:
                try:
                    decoded = jwt.decode(
                        token,
                        public_key,
                        algorithms=['RS256'],
                        options={
                            'verify_exp': False,  # In DEBUG mode, allow expired tokens
                            'verify_iss': False,
                            'verify_aud': False
                        }
                    )
                    print("Token verified in DEBUG mode (signature only)")
                except Exception as e:
                    print(f"DEBUG mode validation failed: {str(e)}")
                    # If all strategies fail, raise error
                    raise AuthenticationFailed(f'Token validation failed: {str(e)}')
            
            if not decoded:
                raise AuthenticationFailed('Unable to verify token. Please sign in again.')
            
            # Get user information from the token
            user_id = decoded.get('sub') or decoded.get('userId') or decoded.get('user_id')
            if not user_id:
                print(f"[AUTH] No user ID in token. Token payload keys: {list(decoded.keys())}")
                raise AuthenticationFailed('Invalid token: no user ID found in token')
            
            email = decoded.get('email', '') or decoded.get('email_address', '')
            name = decoded.get('name', '') or decoded.get('full_name', '') or f"User {user_id[:8]}"
            
            print(f"[AUTH] Token decoded successfully. User ID: {user_id}, Email: {email}")
            
            # Get or create user
            try:
                user, created = User.objects.get_or_create(
                    clerk_id=user_id,
                    defaults={
                        'email': email or f'user_{user_id}@example.com',
                        'name': name or f'User {user_id[:8]}',
                        'is_active': True
                    }
                )
                
                if not created and (user.email != email or user.name != name):
                    # Update user information if it has changed
                    if email:
                        user.email = email
                    if name:
                        user.name = name
                    user.save()
                
                print(f"[AUTH] User authenticated: {user.email} (ID: {user.id})")
                return (user, None)
            except Exception as e:
                print(f"[AUTH] Error creating/getting user: {str(e)}")
                import traceback
                traceback.print_exc()
                raise AuthenticationFailed(f'Failed to get or create user: {str(e)}')
            
        except jwt.ExpiredSignatureError:
            print("Token has expired")
            raise AuthenticationFailed('Token has expired. Please sign in again.')
        except jwt.InvalidTokenError as e:
            print(f"Invalid token error: {str(e)}")
            print(f"Token header: {header if 'header' in locals() else 'N/A'}")
            raise AuthenticationFailed(f'Invalid token: {str(e)}')
        except requests.RequestException as e:
            print(f"Network error fetching JWKS: {str(e)}")
            raise AuthenticationFailed('Failed to verify token. Please try again.')
        except Exception as e:
            print(f"Authentication error: {str(e)}")
            print(f"Error type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')