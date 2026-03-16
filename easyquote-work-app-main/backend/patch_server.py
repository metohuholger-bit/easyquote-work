import sys
from pathlib import Path

def patch_server():
    server_path = Path("server.py")
    with open(server_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Imports
    content = content.replace(
        "from fastapi import FastAPI, APIRouter, HTTPException",
        "from fastapi import FastAPI, APIRouter, HTTPException, Depends, status\n"
        "from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials\n"
        "import jwt\n"
        "from google.oauth2 import id_token\n"
        "from google.auth.transport import requests as google_requests"
    )

    # Auth logic
    auth_logic = """
db = client[os.environ['DB_NAME']]

# Auth config
JWT_SECRET = os.environ.get('JWT_SECRET', 'supersecretjwtkey')
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
ALGORITHM = "HS256"
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
"""
    content = content.replace("db = client[os.environ['DB_NAME']]", auth_logic)

    # Models
    models_insert = """
class User(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GoogleLoginRequest(BaseModel):
    credential: str

"""
    content = content.replace("class Customer(BaseModel):", models_insert + "class Customer(BaseModel):")

    # Add user_id to main models
    for model in ["Customer", "JobType", "Quote", "WorkReport", "CompanySettings"]:
        content = content.replace(
            f"class {model}(BaseModel):\n    model_config = ConfigDict(extra=\"ignore\")\n",
            f"class {model}(BaseModel):\n    model_config = ConfigDict(extra=\"ignore\")\n    user_id: str\n"
        )
        # Handle the one edge case where CompanySettings uses default="company_settings"
        
    auth_route = """
# ============= AUTHENTICATION ROUTES =============

@api_router.post("/auth/google")
async def google_auth(request: GoogleLoginRequest):
    try:
        idinfo = id_token.verify_oauth2_token(request.credential, google_requests.Request(), GOOGLE_CLIENT_ID)
        userid = idinfo['sub']
        email = idinfo.get('email')
        name = idinfo.get('name', 'User')
        picture = idinfo.get('picture')
        
        user = await db.users.find_one({"id": userid})
        if not user:
            user = {
                "id": userid,
                "email": email,
                "name": name,
                "picture": picture,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user)
            
        token_data = {"sub": userid, "email": email}
        access_token = jwt.encode(token_data, JWT_SECRET, algorithm=ALGORITHM)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": userid,
                "name": name,
                "email": email,
                "picture": picture
            }
        }
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token")

"""
    content = content.replace("# ============= CUSTOMER ROUTES =============", auth_route + "# ============= CUSTOMER ROUTES =============")

    # Now let's use regex to add `current_user: str = Depends(get_current_user)` to ALL endpoints except `/auth/google`
    import re

    # Find all api_router decorators and their defs
    def replacer(match):
        decorator = match.group(1)
        func_def = match.group(2)
        func_name = match.group(3)
        args = match.group(4)
        
        if func_name == "google_auth":
            return match.group(0)
            
        if not args.strip():
            new_args = "current_user: str = Depends(get_current_user)"
        else:
            new_args = f"{args}, current_user: str = Depends(get_current_user)"
            
        # Add user_id to DB operations:
        body = match.group(5)
        # customer_create -> inject user_id
        body = re.sub(r'doc = (.*?)_obj\.model_dump\(\)', r'doc = \1_obj.model_dump()\n    doc["user_id"] = current_user', body)
        # insert
        # body = re.sub(r'await db\.(.*?)\.insert_one\(doc\)', r'doc["user_id"] = current_user\n    await db.\1.insert_one(doc)', body)
        
        # update / delete / find query
        body = re.sub(r'\{"id": (.*?)\}', r'{"id": \1, "user_id": current_user}', body)
        body = re.sub(r'\{"_id": 0\}', r'{"_id": 0, "user_id": 0}', body)  # Don't return user_id
        
        # specific empty find queries
        body = re.sub(r'db.(.*?)\.find\(\{?\}?,', r'db.\1.find({"user_id": current_user},', body)
        
        # search query dict
        body = re.sub(r'query = \{\}', r'query = {"user_id": current_user}', body)
        # special case for work reports monthly summary
        body = re.sub(r'query = \{\s+"work_date"', r'query = {\n        "user_id": current_user,\n        "work_date"', body)

        return f"{decorator}\n{func_def} {func_name}({new_args}):{body}"

    # Complex regex to match standard endpoints
    # Actually, simpler to just write the new file safely
    
    with open("server_patched.py", "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    patch_server()
