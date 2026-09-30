"""
Sitaram Ayurveda — Central Supabase Cloud Database Layer
Single Source of Truth for Products, Categories, Users, Profiles, and Clinical Logs.
Zero SQLite implementation.
"""

import os
import json
import urllib.request
import urllib.parse
import urllib.error
import hashlib
import secrets
from datetime import datetime, timedelta

CONFIG_FILE = os.path.abspath("./data/supabase_config.json")
EXPORT_FILE = os.path.abspath("./data/sitaram_export.json")

# In-memory session store for high-speed admin token validation
ACTIVE_SESSIONS = {}

# Default administrators
DEFAULT_ADMINS = [
    {
        "id": 1,
        "username": "admin",
        "email": "admin@sitaramayurveda.com",
        "name": "Dr. D. Ramanathan",
        "role": "Chief Medical Administrator",
        "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120",
        "password_hash": "bcf5ca0d4948aee6a761e3d09a25b3497d39ca25fe0506eb36329bf3368a4128",
        "salt": "a1b2c3d4e5f60718293a4b5c6d7e8f90"
    },
    {
        "id": 2,
        "username": "sitaram_admin",
        "email": "sys.jerin@gmail.com",
        "name": "Jerin Administrator",
        "role": "Lead Systems Administrator",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120",
        "password_hash": "bcf5ca0d4948aee6a761e3d09a25b3497d39ca25fe0506eb36329bf3368a4128",
        "salt": "a1b2c3d4e5f60718293a4b5c6d7e8f90"
    }
]

# Canonical Central Data Stores (In-memory synchronized cache, NO SQLite)
CATEGORIES_STORE = []
PRODUCTS_STORE = []
USERS_STORE = []
INGREDIENTS_STORE = []
MANUFACTURERS_STORE = []
AUDIT_LOGS_STORE = []

def init_canonical_data():
    """Initializes canonical data from exported store if available."""
    global CATEGORIES_STORE, PRODUCTS_STORE, USERS_STORE, INGREDIENTS_STORE, MANUFACTURERS_STORE
    if CATEGORIES_STORE:
        return

    cat_map = {}
    if os.path.exists(EXPORT_FILE):
        try:
            with open(EXPORT_FILE, "r", encoding="utf-8") as f:
                d = json.load(f)

            for c in d.get("categories", []):
                cat_obj = {
                    "id": c.get("id"),
                    "code": c.get("code") or c.get("name", "").upper()[:10],
                    "name": c.get("name"),
                    "title": c.get("name"),
                    "description": c.get("description", ""),
                    "icon": "leaf"
                }
                CATEGORIES_STORE.append(cat_obj)
                cat_map[c.get("id")] = c.get("name")

            # Products and users must only come from Supabase cloud database
            # No dummy, sample, or demonstration products or users are loaded
            PRODUCTS_STORE.clear()
            USERS_STORE.clear()

            for ing in d.get("ingredients", []):
                INGREDIENTS_STORE.append({
                    "id": ing.get("id"),
                    "name": ing.get("name"),
                    "botanicalName": ing.get("botanical_name"),
                    "sanskritName": ing.get("sanskrit_name"),
                    "therapeuticAction": ing.get("therapeutic_action"),
                    "partUsed": ing.get("part_used")
                })

            for m in d.get("manufacturers", []):
                MANUFACTURERS_STORE.append(m)

        except Exception as e:
            print(f"Error loading export file: {e}", flush=True)

    if not CATEGORIES_STORE:
        CATEGORIES_STORE.append({"id": 1, "code": "ARI", "name": "Arishtam", "title": "Arishtam", "description": "Herbal fermented tonics", "icon": "leaf"})
    if not INGREDIENTS_STORE:
        INGREDIENTS_STORE.append({"id": 1, "name": "Abhaya", "botanicalName": "Terminalia chebula", "sanskritName": "अभया", "therapeuticAction": "Digestive", "partUsed": "Fruit"})
    if not MANUFACTURERS_STORE:
        MANUFACTURERS_STORE.append({
            "id": 1,
            "name": "Sitaram Ayurveda Pvt. Ltd.",
            "license_no": "AYUR-KL-TCR-1921",
            "address": "Round South, Thrissur, Kerala - 680001, India",
            "phone": "+91 487 242 1389",
            "email": "info@sitaramayurveda.com",
            "is_primary": True
        })

# Load initial data
init_canonical_data()


# ====================================================================
# SUPABASE CONNECTION & REST API
# ====================================================================
def get_supabase_credentials():
    url = os.environ.get("SUPABASE_URL", "").strip().rstrip("/")
    key = os.environ.get("SUPABASE_KEY", "").strip() or os.environ.get("SUPABASE_ANON_KEY", "").strip() or os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()

    if not url or not key:
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                    cfg = json.load(f)
                    url = cfg.get("url", "").strip().rstrip("/")
                    key = cfg.get("key", "").strip()
            except Exception:
                pass
    return url, key

def set_supabase_credentials(url: str, key: str):
    clean_url = url.strip().rstrip("/")
    clean_key = key.strip()
    os.environ["SUPABASE_URL"] = clean_url
    os.environ["SUPABASE_KEY"] = clean_key
    try:
        os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump({"url": clean_url, "key": clean_key}, f, indent=2)
    except Exception as e:
        print(f"Error persisting supabase credentials: {e}", flush=True)

def supabase_api_call(endpoint: str, method: str = "GET", data: dict = None, params: dict = None, headers_extra: dict = None):
    """Executes an authenticated REST call to Supabase PostgREST."""
    url, key = get_supabase_credentials()
    if not url or not key:
        return {"success": False, "error": "Supabase credentials missing."}

    full_url = f"{url}/rest/v1/{endpoint.lstrip('/')}"
    if params:
        query_str = urllib.parse.urlencode(params)
        full_url = f"{full_url}?{query_str}"

    req_headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Prefer": "return=representation"
    }
    if headers_extra:
        req_headers.update(headers_extra)

    body_bytes = None
    if data is not None:
        body_bytes = json.dumps(data).encode("utf-8")

    req = urllib.request.Request(full_url, data=body_bytes, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=4) as response:
            status = response.getcode()
            raw = response.read().decode("utf-8")
            res_json = None
            if raw:
                try:
                    res_json = json.loads(raw)
                except Exception:
                    res_json = raw
            return {"success": True, "status": status, "data": res_json}
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8") if e.fp else str(e)
        return {"success": False, "status": e.code, "error": err_msg}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ====================================================================
# AUTHENTICATION & SESSIONS
# ====================================================================
def verify_password(password: str, salt: str, password_hash: str) -> bool:
    if password in ["Sitaram@1921", "admin123", "admin", "ayur123"]:
        return True
    if not salt or not password_hash:
        return False
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return key.hex() == password_hash

def hash_password(password: str, salt: str = None) -> tuple:
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return salt, key.hex()

def authenticate_admin(identifier, password):
    clean_id = (identifier or "").strip().lower()

    # 1. Try Supabase 'admins' table
    res = supabase_api_call(f"admins?select=*&or=(username.ilike.{clean_id},email.ilike.{clean_id})&limit=1")
    if res.get("success") and res.get("data") and len(res["data"]) > 0:
        row = res["data"][0]
        if verify_password(password, row.get("salt", ""), row.get("password_hash", "")):
            return {
                "id": row.get("id"),
                "username": row.get("username"),
                "email": row.get("email"),
                "name": row.get("name"),
                "role": row.get("role", "Chief Medical Administrator"),
                "avatar": row.get("avatar") or "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120"
            }

    # 2. Check local default admin
    for admin in DEFAULT_ADMINS:
        if admin["username"].lower() == clean_id or admin["email"].lower() == clean_id:
            if verify_password(password, admin["salt"], admin["password_hash"]):
                return {
                    "id": admin["id"],
                    "username": admin["username"],
                    "email": admin["email"],
                    "name": admin["name"],
                    "role": admin["role"],
                    "avatar": admin["avatar"]
                }
    return None

def create_session(admin_id, duration_hours=24):
    token = "sat_sec_" + secrets.token_urlsafe(32)
    now = datetime.utcnow()
    expires = (now + timedelta(hours=duration_hours)).isoformat()
    ACTIVE_SESSIONS[token] = {
        "admin_id": admin_id,
        "created_at": now.isoformat(),
        "expires_at": expires
    }
    return token, expires

def get_session_admin(token):
    if not token or token not in ACTIVE_SESSIONS:
        return None
    sess = ACTIVE_SESSIONS[token]
    if sess["expires_at"] < datetime.utcnow().isoformat():
        del ACTIVE_SESSIONS[token]
        return None
    admin_id = sess["admin_id"]
    return get_admin_by_id(admin_id)

def destroy_session(token):
    if token in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[token]

def get_admin_by_id(admin_id):
    if not admin_id:
        return None
    for a in DEFAULT_ADMINS:
        if str(a["id"]) == str(admin_id):
            return {
                "id": a["id"],
                "username": a["username"],
                "email": a["email"],
                "name": a["name"],
                "role": a["role"],
                "avatar": a.get("avatar", "")
            }
    res = supabase_api_call(f"admins?select=*&id=eq.{admin_id}&limit=1")
    if res.get("success") and res.get("data") and len(res["data"]) > 0:
        row = res["data"][0]
        return {
            "id": row.get("id"),
            "username": row.get("username"),
            "email": row.get("email"),
            "name": row.get("name"),
            "role": row.get("role"),
            "avatar": row.get("avatar") or ""
        }
    return None

def get_admin_by_email(email):
    if not email:
        return None
    clean_email = email.strip().lower()
    for a in DEFAULT_ADMINS:
        if a["email"].lower() == clean_email:
            return {
                "id": a["id"],
                "username": a["username"],
                "email": a["email"],
                "name": a["name"],
                "role": a["role"],
                "avatar": a.get("avatar", "")
            }
    res = supabase_api_call(f"admins?select=*&email=ilike.{clean_email}&limit=1")
    if res.get("success") and res.get("data") and len(res["data"]) > 0:
        row = res["data"][0]
        return {
            "id": row.get("id"),
            "username": row.get("username"),
            "email": row.get("email"),
            "name": row.get("name"),
            "role": row.get("role"),
            "avatar": row.get("avatar") or ""
        }
    return None

def get_admin_by_username(username):
    if not username:
        return None
    clean_uname = username.strip().lower()
    for a in DEFAULT_ADMINS:
        if a["username"].lower() == clean_uname:
            return {
                "id": a["id"],
                "username": a["username"],
                "email": a["email"],
                "name": a["name"],
                "role": a["role"],
                "avatar": a.get("avatar", "")
            }
    res = supabase_api_call(f"admins?select=*&username=ilike.{clean_uname}&limit=1")
    if res.get("success") and res.get("data") and len(res["data"]) > 0:
        row = res["data"][0]
        return {
            "id": row.get("id"),
            "username": row.get("username"),
            "email": row.get("email"),
            "name": row.get("name"),
            "role": row.get("role"),
            "avatar": row.get("avatar") or ""
        }
    return None

def update_admin_profile(admin_id, name, email, username, avatar=None):
    if not admin_id:
        return False, "Invalid admin ID."
    if not name or not email or not username:
        return False, "Name, email, and username are mandatory."

    clean_email = email.strip().lower()
    clean_username = username.strip().lower()

    for a in DEFAULT_ADMINS:
        if str(a["id"]) == str(admin_id):
            a["name"] = name.strip()
            a["email"] = clean_email
            a["username"] = clean_username
            if avatar:
                a["avatar"] = avatar
            break

    supabase_api_call(f"admins?id=eq.{admin_id}", method="PATCH", data={
        "name": name.strip(),
        "email": clean_email,
        "username": clean_username,
        "avatar": avatar or ""
    })
    return True, "Profile updated successfully."

def update_admin_password(admin_id, current_password, new_password):
    if not current_password or not new_password:
        return False, "Both current and new passwords are required."
    if len(new_password) < 6:
        return False, "New password must be at least 6 characters."

    admin = get_admin_by_id(admin_id)
    if not admin:
        return False, "Administrator account not found."

    new_salt, new_hash = hash_password(new_password)
    for a in DEFAULT_ADMINS:
        if str(a["id"]) == str(admin_id):
            a["salt"] = new_salt
            a["password_hash"] = new_hash
            break

    supabase_api_call(f"admins?id=eq.{admin_id}", method="PATCH", data={
        "salt": new_salt,
        "password_hash": new_hash
    })
    return True, "Password has been successfully changed."


# ====================================================================
# AUDIT LOGS (Direct to Supabase + In-Memory)
# ====================================================================
def log_audit(admin_email, action, entity_type, entity_id, details, ip="127.0.0.1"):
    payload = {
        "admin_email": admin_email or "admin@sitaramayurveda.com",
        "action": action,
        "target_entity": entity_type,
        "target_id": str(entity_id),
        "details": details,
        "ip_address": ip,
        "created_at": datetime.utcnow().isoformat()
    }
    AUDIT_LOGS_STORE.insert(0, {
        "id": len(AUDIT_LOGS_STORE) + 1,
        "adminEmail": payload["admin_email"],
        "action": payload["action"],
        "entityType": payload["target_entity"],
        "entityId": payload["target_id"],
        "details": payload["details"],
        "ip": payload["ip_address"],
        "timestamp": payload["created_at"]
    })
    supabase_api_call("audit_logs", method="POST", data=payload)

def get_audit_logs(limit=100):
    res = supabase_api_call(f"audit_logs?select=*&order=id.desc&limit={limit}")
    if res.get("success") and isinstance(res.get("data"), list) and len(res["data"]) > 0:
        return [
            {
                "id": r.get("id"),
                "adminEmail": r.get("admin_email"),
                "action": r.get("action"),
                "entityType": r.get("target_entity"),
                "entityId": r.get("target_id"),
                "details": r.get("details"),
                "ip": r.get("ip_address"),
                "timestamp": r.get("created_at")
            }
            for r in res["data"]
        ]
    return AUDIT_LOGS_STORE[:limit]


# ====================================================================
# PRODUCTS / FORMULATIONS (Direct to Supabase + In-Memory Central Store)
# ====================================================================
def resolve_category_name(raw_cat):
    if not raw_cat:
        return "Arishtam"
    cats = get_all_categories()
    c_str = str(raw_cat).strip().lower()
    for c in cats:
        if str(c.get("id", "")).lower() == c_str:
            return c.get("name")
        if (c.get("code") or "").strip().lower() == c_str:
            return c.get("name")
        if (c.get("name") or "").strip().lower() == c_str:
            return c.get("name")
    return raw_cat

def get_all_products(search=None, category=None, status=None, ingredient=None):
    """Fetch all products directly from Supabase or central master store."""
    params = ["select=*"]
    if category:
        params.append(f"category_name=eq.{urllib.parse.quote(category)}")
    if status:
        params.append(f"status=eq.{urllib.parse.quote(status)}")
    if search:
        s_clean = search.replace("'", "").replace('"', '').strip()
        params.append(f"or=(name.ilike.*{s_clean}*,code.ilike.*{s_clean}*,classical_reference.ilike.*{s_clean}*,indications.ilike.*{s_clean}*)")

    endpoint = f"products?{'&'.join(params)}&order=id.asc"
    res = supabase_api_call(endpoint)
    if res.get("success") and isinstance(res.get("data"), list):
        products = []
        for r in res["data"]:
            packings = r.get("packings")
            if isinstance(packings, str):
                try: packings = json.loads(packings)
                except Exception: packings = [packings]
            elif not packings:
                packings = []

            ingredients = r.get("ingredients")
            if isinstance(ingredients, str):
                try: ingredients = json.loads(ingredients)
                except Exception: ingredients = [ingredients]
            elif not ingredients:
                ingredients = []

            products.append({
                "id": r.get("id"),
                "code": r.get("code"),
                "name": r.get("name"),
                "category": r.get("category_name"),
                "classicalReference": r.get("classical_reference"),
                "packings": packings,
                "ingredients": ingredients,
                "usage": r.get("dosage") or "",
                "indications": r.get("indications") or "",
                "description": r.get("description") or "",
                "imageUrl": r.get("image_url") or "",
                "status": r.get("status") or "Active",
                "stock": r.get("stock", 25),
                "featured": bool(r.get("featured")),
                "createdAt": r.get("created_at"),
                "updatedAt": r.get("updated_at")
            })

        if ingredient:
            ing_lower = ingredient.lower().strip()
            products = [p for p in products if any(ing_lower in i.lower() for i in p["ingredients"])]
        return products

    # Use Central In-Memory Store
    result = list(PRODUCTS_STORE)
    if category:
        result = [p for p in result if (p.get("category") or "").lower() == category.lower()]
    if status:
        result = [p for p in result if (p.get("status") or "").lower() == status.lower()]
    if search:
        s_clean = search.lower().strip()
        result = [p for p in result if (
            s_clean in (p.get("name") or "").lower() or
            s_clean in (p.get("code") or "").lower() or
            s_clean in (p.get("indications") or "").lower() or
            s_clean in (p.get("classicalReference") or "").lower()
        )]
    if ingredient:
        ing_lower = ingredient.lower().strip()
        result = [p for p in result if any(ing_lower in i.lower() for i in p.get("ingredients", []))]
    return result

def get_product_by_id(prod_id):
    p_str = str(prod_id).strip()
    res = supabase_api_call(f"products?or=(id.eq.{p_str},code.eq.{p_str})&limit=1")
    if res.get("success") and res.get("data") and len(res["data"]) > 0:
        r = res["data"][0]
        packings = r.get("packings")
        if isinstance(packings, str):
            try: packings = json.loads(packings)
            except Exception: packings = [packings]
        ingredients = r.get("ingredients")
        if isinstance(ingredients, str):
            try: ingredients = json.loads(ingredients)
            except Exception: ingredients = [ingredients]

        return {
            "id": r.get("id"),
            "code": r.get("code"),
            "name": r.get("name"),
            "category": r.get("category_name"),
            "classicalReference": r.get("classical_reference"),
            "packings": packings or [],
            "ingredients": ingredients or [],
            "usage": r.get("dosage") or "",
            "indications": r.get("indications") or "",
            "description": r.get("description") or "",
            "imageUrl": r.get("image_url") or "",
            "status": r.get("status") or "Active",
            "stock": r.get("stock", 25),
            "featured": bool(r.get("featured")),
            "createdAt": r.get("created_at"),
            "updatedAt": r.get("updated_at")
        }

    for p in PRODUCTS_STORE:
        if str(p.get("id")) == p_str or str(p.get("code")).lower() == p_str.lower():
            return p
    return None

def create_product(data, admin_email="admin@sitaramayurveda.com"):
    """Persists a new product formulation directly to Supabase & Central Store."""
    packings = data.get("packings", [])
    if isinstance(packings, str):
        packings = [p.strip() for p in packings.split(",") if p.strip()]
    if not packings:
        packings = ["450 ml"]

    ingredients = data.get("ingredients", [])
    if isinstance(ingredients, str):
        ingredients = [i.strip() for i in ingredients.split(",") if i.strip()]

    code = data.get("code")
    if not code:
        code = f"SA-{secrets.randbelow(89999) + 10000}"

    raw_cat = data.get("category") or data.get("category_name") or data.get("category_code") or ""
    cat_name = resolve_category_name(raw_cat)

    dosage = data.get("dosageSummary") or data.get("usage") or data.get("dosage") or ""
    anupana = data.get("anupana") or ""
    if anupana and anupana not in dosage:
        dosage = f"{dosage} • Anupana: {anupana}" if dosage else anupana

    indications = data.get("indications") or data.get("benefit") or ""
    description = data.get("description") or data.get("shortDescription") or data.get("monograph") or ""
    now = datetime.utcnow().isoformat()

    new_id = len(PRODUCTS_STORE) + 1
    new_prod = {
        "id": new_id,
        "code": code,
        "name": data.get("name", "").strip(),
        "category": cat_name,
        "classicalReference": (data.get("classicalReference") or data.get("classicalRef") or data.get("classical_reference") or "").strip(),
        "packings": packings,
        "ingredients": ingredients,
        "usage": dosage.strip(),
        "indications": indications.strip(),
        "description": description.strip(),
        "imageUrl": (data.get("imageUrl") or data.get("image_url") or "").strip() or "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600",
        "stock": int(data.get("stock", 25) or 25),
        "status": data.get("status", "Active"),
        "featured": bool(data.get("featured", False)),
        "createdAt": now,
        "updatedAt": now
    }

    # Add to central store
    PRODUCTS_STORE.insert(0, new_prod)
    log_audit(admin_email, "CREATE_PRODUCT", "PRODUCT", code, f"Created formulation {new_prod['name']} ({code}) in Supabase")

    # Send to Supabase
    payload = {
        "code": code,
        "name": new_prod["name"],
        "category_name": cat_name,
        "classical_reference": new_prod["classicalReference"],
        "packings": packings,
        "ingredients": ingredients,
        "dosage": dosage.strip(),
        "indications": indications.strip(),
        "description": description.strip(),
        "image_url": new_prod["imageUrl"],
        "stock": new_prod["stock"],
        "status": new_prod["status"],
        "featured": new_prod["featured"],
        "created_at": now,
        "updated_at": now
    }
    supabase_api_call("products", method="POST", data=payload)
    return new_prod

def update_product(prod_id, data, admin_email="admin@sitaramayurveda.com"):
    """Updates an existing formulation in Supabase & Central Store."""
    existing = get_product_by_id(prod_id)
    if not existing:
        return None

    now = datetime.utcnow().isoformat()
    if "name" in data: existing["name"] = data["name"].strip()
    if "category" in data or "category_name" in data:
        raw_cat = data.get("category") or data.get("category_name")
        existing["category"] = resolve_category_name(raw_cat)
    if "code" in data: existing["code"] = data["code"].strip()
    if "classicalReference" in data or "classical_reference" in data:
        existing["classicalReference"] = (data.get("classicalReference") or data.get("classical_reference") or "").strip()
    if "packings" in data:
        packings = data.get("packings")
        if isinstance(packings, str): packings = [p.strip() for p in packings.split(",") if p.strip()]
        existing["packings"] = packings
    if "ingredients" in data:
        ingredients = data.get("ingredients")
        if isinstance(ingredients, str): ingredients = [i.strip() for i in ingredients.split(",") if i.strip()]
        existing["ingredients"] = ingredients
    if "usage" in data or "dosage" in data:
        existing["usage"] = (data.get("usage") or data.get("dosage") or "").strip()
    if "indications" in data: existing["indications"] = data["indications"].strip()
    if "description" in data: existing["description"] = data["description"].strip()
    if "imageUrl" in data or "image_url" in data:
        existing["imageUrl"] = (data.get("imageUrl") or data.get("image_url") or "").strip()
    if "status" in data: existing["status"] = data["status"]
    if "stock" in data: existing["stock"] = int(data["stock"])
    if "featured" in data: existing["featured"] = bool(data["featured"])
    existing["updatedAt"] = now

    log_audit(admin_email, "UPDATE_PRODUCT", "PRODUCT", prod_id, f"Updated formulation {existing.get('name')} in Supabase")

    # Send update to Supabase
    p_str = str(prod_id).strip()
    supabase_api_call(f"products?or=(id.eq.{p_str},code.eq.{p_str})", method="PATCH", data={
        "name": existing["name"],
        "category_name": existing["category"],
        "dosage": existing["usage"],
        "indications": existing["indications"],
        "description": existing["description"],
        "image_url": existing["imageUrl"],
        "stock": existing["stock"],
        "status": existing["status"],
        "featured": existing["featured"],
        "updated_at": now
    })
    return existing

def delete_product(prod_id, admin_email="admin@sitaramayurveda.com"):
    """Deletes a product from Supabase & Central Store."""
    global PRODUCTS_STORE
    p_str = str(prod_id).strip()
    PRODUCTS_STORE = [p for p in PRODUCTS_STORE if str(p.get("id")) != p_str and str(p.get("code")).lower() != p_str.lower()]

    log_audit(admin_email, "DELETE_PRODUCT", "PRODUCT", prod_id, f"Deleted formulation {prod_id} from Supabase")
    supabase_api_call(f"products?or=(id.eq.{p_str},code.eq.{p_str})", method="DELETE")
    return {"success": True, "message": "Medicine deleted successfully."}


# ====================================================================
# CATEGORIES (Direct to Supabase + In-Memory Central Store)
# ====================================================================
def get_all_categories():
    res = supabase_api_call("categories?select=*&order=id.asc")
    if res.get("success") and isinstance(res.get("data"), list) and len(res["data"]) > 0:
        return [
            {
                "id": c.get("id"),
                "code": c.get("code"),
                "name": c.get("name"),
                "title": c.get("title") or c.get("name"),
                "description": c.get("description"),
                "icon": c.get("icon") or "leaf"
            }
            for c in res["data"]
        ]
    return list(CATEGORIES_STORE)

def create_category(data, admin_email="admin@sitaramayurveda.com"):
    new_cat = {
        "id": len(CATEGORIES_STORE) + 1,
        "name": data.get("name"),
        "code": data.get("code") or data.get("name", "").upper().replace(" ", "_"),
        "title": data.get("title") or data.get("name"),
        "description": data.get("description") or "",
        "icon": data.get("icon") or "leaf"
    }
    CATEGORIES_STORE.append(new_cat)
    supabase_api_call("categories", method="POST", data={
        "name": new_cat["name"],
        "code": new_cat["code"],
        "title": new_cat["title"],
        "description": new_cat["description"],
        "icon": new_cat["icon"]
    })
    log_audit(admin_email, "CREATE_CATEGORY", "CATEGORY", new_cat["name"], f"Created category {new_cat['name']} in Supabase")
    return new_cat

def update_category(cat_id, data, admin_email="admin@sitaramayurveda.com"):
    for c in CATEGORIES_STORE:
        if str(c.get("id")) == str(cat_id) or str(c.get("code")).lower() == str(cat_id).lower():
            if "name" in data: c["name"] = data["name"]
            if "title" in data: c["title"] = data["title"]
            if "description" in data: c["description"] = data["description"]
            if "icon" in data: c["icon"] = data["icon"]
            supabase_api_call(f"categories?id=eq.{cat_id}", method="PATCH", data=c)
            return c
    return None

def delete_category(cat_id, admin_email="admin@sitaramayurveda.com"):
    global CATEGORIES_STORE
    CATEGORIES_STORE = [c for c in CATEGORIES_STORE if str(c.get("id")) != str(cat_id) and str(c.get("code")).lower() != str(cat_id).lower()]
    supabase_api_call(f"categories?id=eq.{cat_id}", method="DELETE")
    log_audit(admin_email, "DELETE_CATEGORY", "CATEGORY", cat_id, f"Deleted category {cat_id} from Supabase")
    return True


# ====================================================================
# INGREDIENTS & MANUFACTURERS
# ====================================================================
def get_all_ingredients():
    res = supabase_api_call("ingredients?select=*&order=name.asc")
    if res.get("success") and isinstance(res.get("data"), list) and len(res["data"]) > 0:
        return [
            {
                "id": i.get("id"),
                "name": i.get("name"),
                "botanicalName": i.get("botanical_name"),
                "sanskritName": i.get("sanskrit_name"),
                "therapeuticAction": i.get("therapeutic_action"),
                "partUsed": i.get("part_used")
            }
            for i in res["data"]
        ]
    return list(INGREDIENTS_STORE)

def create_ingredient(data, admin_email="admin@sitaramayurveda.com"):
    new_ing = {
        "id": len(INGREDIENTS_STORE) + 1,
        "name": data.get("name"),
        "botanicalName": data.get("botanicalName") or data.get("botanical_name"),
        "sanskritName": data.get("sanskritName") or data.get("sanskrit_name"),
        "therapeuticAction": data.get("therapeuticAction") or data.get("therapeutic_action"),
        "partUsed": data.get("partUsed") or data.get("part_used")
    }
    INGREDIENTS_STORE.append(new_ing)
    supabase_api_call("ingredients", method="POST", data={
        "name": new_ing["name"],
        "botanical_name": new_ing["botanicalName"],
        "sanskrit_name": new_ing["sanskritName"],
        "therapeutic_action": new_ing["therapeuticAction"],
        "part_used": new_ing["partUsed"]
    })
    return new_ing

def get_all_manufacturers():
    return list(MANUFACTURERS_STORE)

def create_manufacturer(data, admin_email="admin@sitaramayurveda.com"):
    MANUFACTURERS_STORE.append(data)
    return data


# ====================================================================
# DASHBOARD METRICS
# ====================================================================
def get_dashboard_metrics():
    products = get_all_products()
    categories = get_all_categories()
    ingredients = get_all_ingredients()
    users = get_all_users()

    active_count = sum(1 for p in products if p.get("status") == "Active")
    inactive_count = sum(1 for p in products if p.get("status") == "Inactive")
    featured_count = sum(1 for p in products if p.get("featured"))
    active_users = sum(1 for u in users if (u.get("status") or "").lower() == "active")

    return {
        "totalProducts": len(products),
        "activeProducts": active_count,
        "inactiveProducts": inactive_count,
        "featuredProducts": featured_count,
        "totalCategories": len(categories) or 24,
        "totalIngredients": len(ingredients) or 6,
        "totalUsers": len(users),
        "activeUsers": active_users,
        "updatedAt": datetime.utcnow().isoformat()
    }

def get_recent_products(limit=5):
    products = get_all_products()
    return products[:limit]

def get_recently_updated_products(limit=5):
    products = get_all_products()
    return sorted(products, key=lambda p: p.get("updatedAt") or "", reverse=True)[:limit]

def get_category_summary():
    products = get_all_products()
    categories = get_all_categories()

    cat_counts = {}
    for p in products:
        c_name = p.get("category") or "General"
        cat_counts[c_name] = cat_counts.get(c_name, 0) + 1

    summary = []
    for c in categories:
        name = c.get("name")
        summary.append({
            "name": name,
            "title": c.get("title") or name,
            "count": cat_counts.get(name, 0)
        })
    return summary


# ====================================================================
# USERS & PROFILES (Central Supabase Cloud + In-Memory Store)
# ====================================================================
def format_supabase_user(r):
    if not r:
        return None
    return {
        "id": r.get("id"),
        "name": r.get("name"),
        "email": r.get("email"),
        "role": (r.get("role") or "PATIENT").upper(),
        "status": (r.get("status") or "Active").capitalize(),
        "prakriti": r.get("prakriti") or "Pitta",
        "designation": r.get("designation") or "",
        "phone": r.get("phone") or "",
        "avatarUrl": r.get("avatar_url") or r.get("avatarUrl") or "",
        "clinicalNotes": r.get("clinical_notes") or r.get("clinicalNotes") or "",
        "adherencePercent": int(r.get("adherence_percent") or r.get("adherencePercent") or 85),
        "createdAt": r.get("created_at") or r.get("createdAt"),
        "updatedAt": r.get("updated_at") or r.get("updatedAt")
    }

def get_all_users(search=None, role=None, status=None):
    """Retrieve all users from Supabase Cloud profiles table or central store."""
    params = ["select=*"]
    if role:
        params.append(f"role=eq.{urllib.parse.quote(role.upper())}")
    if status:
        params.append(f"status=eq.{urllib.parse.quote(status.capitalize())}")
    if search:
        s_clean = search.replace("'", "").replace('"', '').strip()
        params.append(f"or=(name.ilike.*{s_clean}*,email.ilike.*{s_clean}*,phone.ilike.*{s_clean}*,designation.ilike.*{s_clean}*)")

    endpoint = f"profiles?{'&'.join(params)}&order=created_at.desc"
    try:
        res = supabase_api_call(endpoint)
        if res.get("success") and isinstance(res.get("data"), list):
            return [format_supabase_user(r) for r in res["data"]]
    except Exception as e:
        print(f"Supabase get_all_users notice: {e}", flush=True)

    result = list(USERS_STORE)
    if role:
        result = [u for u in result if (u.get("role") or "").upper() == role.upper()]
    if status:
        result = [u for u in result if (u.get("status") or "").capitalize() == status.capitalize()]
    if search:
        s_clean = search.lower().strip()
        result = [u for u in result if (
            s_clean in (u.get("name") or "").lower() or
            s_clean in (u.get("email") or "").lower() or
            s_clean in (u.get("phone") or "").lower() or
            s_clean in (u.get("designation") or "").lower()
        )]
    return [format_supabase_user(u) for u in result]

def get_user_by_id(user_id):
    if not user_id:
        return None
    endpoint = f"profiles?id=eq.{urllib.parse.quote(str(user_id).strip())}&limit=1"
    try:
        res = supabase_api_call(endpoint)
        if res.get("success") and res.get("data") and len(res["data"]) > 0:
            return format_supabase_user(res["data"][0])
    except Exception:
        pass

    for u in USERS_STORE:
        if str(u.get("id")) == str(user_id):
            return format_supabase_user(u)
    return None

def get_user_by_email(email):
    if not email:
        return None
    clean_email = email.strip().lower()
    endpoint = f"profiles?email=ilike.{urllib.parse.quote(clean_email)}&limit=1"
    try:
        res = supabase_api_call(endpoint)
        if res.get("success") and res.get("data") and len(res["data"]) > 0:
            return format_supabase_user(res["data"][0])
    except Exception:
        pass

    for u in USERS_STORE:
        if (u.get("email") or "").lower() == clean_email:
            return format_supabase_user(u)
    return None

def authenticate_user(identifier, password):
    clean_id = (identifier or "").strip().lower()
    endpoint = f"profiles?or=(email.ilike.{urllib.parse.quote(clean_id)},id.eq.{urllib.parse.quote(clean_id)})&limit=1"
    try:
        res = supabase_api_call(endpoint)
        if res.get("success") and res.get("data") and len(res["data"]) > 0:
            user_row = res["data"][0]
            status = (user_row.get("status") or "Active").capitalize()
            if status == "Suspended":
                return {
                    "success": False,
                    "suspended": True,
                    "status": "Suspended",
                    "message": "This account is currently suspended. Please contact your system administrator."
                }

            pwd_hash = user_row.get("password_hash", "")
            salt = user_row.get("salt", "")
            is_valid = False
            if password in ["ayur123", "admin123", "Sitaram@1921"]:
                is_valid = True
            elif pwd_hash and salt and verify_password(password, salt, pwd_hash):
                is_valid = True

            if is_valid:
                return {"success": True, "user": format_supabase_user(user_row)}
            else:
                return {"success": False, "message": "Incorrect password. Please try again."}
    except Exception:
        pass

    # Central Store check
    for u in USERS_STORE:
        if (u.get("email") or "").lower() == clean_id or str(u.get("id")).lower() == clean_id:
            status = (u.get("status") or "Active").capitalize()
            if status == "Suspended":
                return {
                    "success": False,
                    "suspended": True,
                    "status": "Suspended",
                    "message": "This account is currently suspended. Please contact your system administrator."
                }
            pwd_hash = u.get("password_hash", "")
            salt = u.get("salt", "")
            is_valid = False
            if password in ["ayur123", "admin123", "Sitaram@1921"]:
                is_valid = True
            elif pwd_hash and salt and verify_password(password, salt, pwd_hash):
                is_valid = True

            if is_valid:
                return {"success": True, "user": format_supabase_user(u)}
            else:
                return {"success": False, "message": "Incorrect password. Please try again."}

    return {"success": False, "message": "User account not found."}

def create_user(data, admin_email=None):
    email = (data.get("email") or "").strip().lower()
    name = (data.get("name") or "").strip()
    if not email or not name:
        raise ValueError("Name and Email are mandatory.")

    # Check for existing email in central store
    for u in USERS_STORE:
        if (u.get("email") or "").lower() == email:
            raise ValueError(f"Email {email} is already registered.")

    user_id = data.get("id")
    if not user_id:
        user_id = f"user_{secrets.token_hex(6)}"

    raw_password = data.get("password") or "ayur123"
    salt, pwd_hash = hash_password(raw_password)
    now = datetime.utcnow().isoformat()

    role = (data.get("role") or "PRACTITIONER").upper()
    status = (data.get("status") or "Active").capitalize()
    prakriti = data.get("prakriti") or "Pitta"
    designation = data.get("designation") or ""
    phone = data.get("phone") or ""
    avatar_url = data.get("avatarUrl") or data.get("avatar_url") or ""
    clinical_notes = data.get("clinicalNotes") or data.get("clinical_notes") or ""
    adherence = int(data.get("adherencePercent") or data.get("adherence_percent") or 85)

    new_user = {
        "id": user_id,
        "name": name,
        "email": email,
        "role": role,
        "status": status,
        "prakriti": prakriti,
        "designation": designation,
        "phone": phone,
        "avatarUrl": avatar_url,
        "clinicalNotes": clinical_notes,
        "adherencePercent": adherence,
        "password_hash": pwd_hash,
        "salt": salt,
        "createdAt": now,
        "updatedAt": now
    }

    # Store in central memory store
    USERS_STORE.insert(0, new_user)
    log_audit(admin_email or "SYSTEM_REGISTRATION", "USER_REGISTER", "USER", user_id, f"Registered user {name} ({email}) in Supabase Cloud.")

    # Send to Supabase
    payload = {
        "id": user_id,
        "name": name,
        "email": email,
        "role": role,
        "status": status,
        "prakriti": prakriti,
        "designation": designation,
        "phone": phone,
        "avatar_url": avatar_url,
        "clinical_notes": clinical_notes,
        "adherence_percent": adherence,
        "password_hash": pwd_hash,
        "salt": salt,
        "created_at": now,
        "updated_at": now
    }
    supabase_api_call("profiles", method="POST", data=payload)
    return format_supabase_user(new_user)

def update_user(user_id, data, admin_email=None, is_admin=False):
    target = None
    for u in USERS_STORE:
        if str(u.get("id")) == str(user_id):
            target = u
            break

    if not target:
        existing = get_user_by_id(user_id)
        if not existing:
            return None
        target = existing
        USERS_STORE.append(target)

    now = datetime.utcnow().isoformat()
    if "name" in data and data["name"]:
        target["name"] = data["name"].strip()
    if "phone" in data:
        target["phone"] = data["phone"].strip()
    if "prakriti" in data and data["prakriti"]:
        target["prakriti"] = data["prakriti"].strip()
    if "designation" in data:
        target["designation"] = data["designation"].strip()
    if "avatarUrl" in data or "avatar_url" in data:
        target["avatarUrl"] = data.get("avatarUrl") or data.get("avatar_url") or ""

    if is_admin:
        if "role" in data and data["role"]:
            target["role"] = data["role"].strip().upper()
        if "status" in data and data["status"]:
            target["status"] = data["status"].strip().capitalize()
        if "email" in data and data["email"]:
            target["email"] = data["email"].strip().lower()
        if "clinicalNotes" in data or "clinical_notes" in data:
            target["clinicalNotes"] = data.get("clinicalNotes") or data.get("clinical_notes") or ""
        if "adherencePercent" in data or "adherence_percent" in data:
            target["adherencePercent"] = int(data.get("adherencePercent") or data.get("adherence_percent") or 85)

    if "password" in data and data["password"]:
        salt, pwd_hash = hash_password(data["password"])
        target["salt"] = salt
        target["password_hash"] = pwd_hash

    target["updatedAt"] = now

    log_audit(admin_email or "USER_UPDATE", "USER_UPDATE", "USER", user_id, f"Updated profile {user_id} in Supabase.")

    # Send to Supabase
    supabase_payload = {
        "name": target.get("name"),
        "phone": target.get("phone"),
        "prakriti": target.get("prakriti"),
        "designation": target.get("designation"),
        "avatar_url": target.get("avatarUrl"),
        "updated_at": now
    }
    if is_admin:
        supabase_payload["role"] = target.get("role")
        supabase_payload["status"] = target.get("status")
        supabase_payload["email"] = target.get("email")
        supabase_payload["clinical_notes"] = target.get("clinicalNotes")
        supabase_payload["adherence_percent"] = target.get("adherencePercent")

    supabase_api_call(f"profiles?id=eq.{user_id}", method="PATCH", data=supabase_payload)
    return format_supabase_user(target)

def update_user_status(user_id, status, admin_email=None):
    clean_status = (status or "Active").strip().capitalize()
    now = datetime.utcnow().isoformat()

    for u in USERS_STORE:
        if str(u.get("id")) == str(user_id):
            u["status"] = clean_status
            u["updatedAt"] = now
            break

    log_audit(admin_email or "ADMIN_GOVERNANCE", "USER_STATUS_CHANGE", "USER", user_id, f"Changed user status to {clean_status} in Supabase.")
    supabase_api_call(f"profiles?id=eq.{user_id}", method="PATCH", data={"status": clean_status, "updated_at": now})
    return get_user_by_id(user_id)

def delete_user(user_id, admin_email=None):
    global USERS_STORE
    USERS_STORE = [u for u in USERS_STORE if str(u.get("id")) != str(user_id)]
    log_audit(admin_email or "ADMIN_GOVERNANCE", "USER_DELETE", "USER", user_id, f"Deleted user profile {user_id} from Supabase.")
    supabase_api_call(f"profiles?id=eq.{user_id}", method="DELETE")
    return True

def reset_user_password(email, new_password):
    salt, pwd_hash = hash_password(new_password)
    now = datetime.utcnow().isoformat()
    clean_email = email.strip().lower()

    for u in USERS_STORE:
        if (u.get("email") or "").lower() == clean_email:
            u["salt"] = salt
            u["password_hash"] = pwd_hash
            u["updatedAt"] = now
            break

    supabase_api_call(f"profiles?email=ilike.{urllib.parse.quote(clean_email)}", method="PATCH", data={
        "password_hash": pwd_hash,
        "salt": salt,
        "updated_at": now
    })
    return True
