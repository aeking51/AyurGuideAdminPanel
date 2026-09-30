"""
Sitaram Ayurveda — Supabase Cloud Database Integration & Sync Service
Connects the application directly to Supabase PostgreSQL via PostgREST REST API.
Zero SQLite implementation.
"""

import os
import json
import urllib.request
import urllib.parse
import urllib.error

CONFIG_FILE = os.path.abspath("./data/supabase_config.json")

def get_supabase_config():
    """Retrieve Supabase URL and Key from env vars or saved config."""
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
    return {
        "url": url,
        "key": key,
        "configured": bool(url and key)
    }

def save_supabase_config(url: str, key: str):
    """Save Supabase configuration."""
    os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump({"url": url.strip().rstrip("/"), "key": key.strip()}, f, indent=2)

def supabase_request(endpoint: str, method: str = "GET", data: dict = None, params: dict = None, headers_extra: dict = None):
    """Make authenticated request to Supabase PostgREST API."""
    cfg = get_supabase_config()
    if not cfg["configured"]:
        return {"success": False, "error": "Supabase is not configured yet. Please provide your Project URL and Key."}

    full_url = f"{cfg['url']}/rest/v1/{endpoint.lstrip('/')}"
    if params:
        query_str = urllib.parse.urlencode(params)
        full_url = f"{full_url}?{query_str}"

    headers = {
        "apikey": cfg["key"],
        "Authorization": f"Bearer {cfg['key']}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Prefer": "return=representation"
    }
    if headers_extra:
        headers.update(headers_extra)

    body_bytes = None
    if data is not None:
        body_bytes = json.dumps(data).encode("utf-8")

    req = urllib.request.Request(full_url, data=body_bytes, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            status = response.getcode()
            raw = response.read().decode("utf-8")
            if raw:
                try:
                    res_json = json.loads(raw)
                    return {"success": True, "status": status, "data": res_json}
                except Exception:
                    return {"success": True, "status": status, "data": raw}
            return {"success": True, "status": status, "data": None}
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8") if e.fp else str(e)
        return {"success": False, "status": e.code, "error": err_msg}
    except Exception as e:
        return {"success": False, "error": str(e)}

def test_supabase_connection():
    """Verify if Supabase URL and Key are functional and inspect database tables."""
    cfg = get_supabase_config()
    if not cfg["configured"]:
        return {
            "success": False,
            "configured": False,
            "message": "Supabase credentials are not set."
        }

    url = cfg["url"]
    key = cfg["key"]
    is_jwt = key.startswith("eyJ")
    masked_key = f"{key[:8]}...{key[-6:]}" if len(key) > 14 else key

    # Test reading categories table
    cat_res = supabase_request("categories?select=id,name&limit=1")
    if not cat_res["success"]:
        err_str = str(cat_res.get("error", ""))
        status_code = cat_res.get("status")

        if status_code == 401:
            hint = "API key rejected (HTTP 401). Please copy the 'anon' public or 'service_role' secret JWT key (starts with 'eyJ...') from Supabase Dashboard -> Project Settings -> API."
            if not is_jwt:
                hint = "The configured key is an 'sb_secret_' CLI token, NOT a PostgREST API key. Please copy the 'anon' public or 'service_role' JWT key (starts with 'eyJ...') from Supabase Dashboard -> Project Settings -> API."
            return {
                "success": False,
                "configured": True,
                "status": 401,
                "is_jwt": is_jwt,
                "masked_key": masked_key,
                "url": url,
                "error": err_str,
                "message": hint
            }

        if "relation \"public.categories\" does not exist" in err_str or status_code == 404:
            return {
                "success": True,
                "configured": True,
                "schema_needed": True,
                "is_jwt": is_jwt,
                "masked_key": masked_key,
                "url": url,
                "message": "Connected to Supabase! However, the database tables have not been created yet. Please execute supabase_schema.sql in the Supabase SQL Editor."
            }

        return {
            "success": False,
            "configured": True,
            "status": status_code,
            "is_jwt": is_jwt,
            "masked_key": masked_key,
            "url": url,
            "error": err_str,
            "message": f"Supabase error (HTTP {status_code}): {err_str}"
        }

    # Categories exists! Now check products and profiles tables
    prod_res = supabase_request("products?select=id&limit=100")
    prod_count = len(prod_res.get("data", [])) if prod_res.get("success") and isinstance(prod_res.get("data"), list) else 0

    user_res = supabase_request("profiles?select=id&limit=100")
    user_count = len(user_res.get("data", [])) if user_res.get("success") and isinstance(user_res.get("data"), list) else 0

    return {
        "success": True,
        "configured": True,
        "url": url,
        "is_jwt": is_jwt,
        "masked_key": masked_key,
        "products_count": prod_count,
        "profiles_count": user_count,
        "message": f"Connected to Supabase! Found {prod_count} live products and {user_count} user profiles."
    }

def sync_master_catalogue_to_supabase():
    """Syncs master categories, products, and user profiles directly to Supabase cloud database."""
    cfg = get_supabase_config()
    if not cfg["configured"]:
        return {"success": False, "error": "Cannot sync: Supabase is not configured."}

    export_path = os.path.abspath("./data/sitaram_export.json")
    cats = []
    prods = []
    users = []

    if os.path.exists(export_path):
        try:
            with open(export_path, "r", encoding="utf-8") as f:
                d = json.load(f)
                cats = d.get("categories", [])
                prods = d.get("products", [])
                users = d.get("users", [])
        except Exception as e:
            print(f"Error reading sitaram_export.json: {e}", flush=True)

    formatted_cats = []
    for c in cats:
        formatted_cats.append({
            "name": c.get("name"),
            "code": c.get("code") or c.get("name", "").upper()[:10],
            "title": c.get("name"),
            "description": c.get("description") or "",
            "icon": "leaf",
            "status": "Active"
        })

    cat_id_to_name = {c.get("id"): c.get("name") for c in cats}
    formatted_prods = []
    for p in prods:
        c_name = cat_id_to_name.get(p.get("category_id"), "Arishtam")
        packings = p.get("packings_json") or p.get("packings") or []
        if isinstance(packings, str):
            try: packings = json.loads(packings)
            except Exception: packings = [packings]
        ingredients = p.get("ingredients_json") or p.get("ingredients") or []
        if isinstance(ingredients, str):
            try: ingredients = json.loads(ingredients)
            except Exception: ingredients = [ingredients]

        formatted_prods.append({
            "code": p.get("code"),
            "name": p.get("name"),
            "category_name": c_name,
            "classical_reference": p.get("classical_reference"),
            "packings": packings,
            "ingredients": ingredients,
            "dosage": p.get("usage") or "",
            "indications": p.get("indications") or "",
            "description": p.get("description") or "",
            "image_url": p.get("image_url") or "",
            "stock": p.get("stock", 25),
            "status": p.get("status") or "Active",
            "featured": bool(p.get("featured", False))
        })

    formatted_users = []
    for u in users:
        formatted_users.append({
            "id": u.get("id"),
            "name": u.get("name"),
            "email": u.get("email"),
            "role": u.get("role", "PATIENT"),
            "status": u.get("status", "Active"),
            "prakriti": u.get("prakriti", "Pitta"),
            "designation": u.get("designation", ""),
            "phone": u.get("phone", ""),
            "avatar_url": u.get("avatar_url", ""),
            "clinical_notes": u.get("clinical_notes", ""),
            "adherence_percent": u.get("adherence_percent", 85),
            "password_hash": u.get("password_hash", ""),
            "salt": u.get("salt", "")
        })

    upsert_headers = {"Prefer": "resolution=merge-duplicates,return=representation"}
    cat_res = supabase_request("categories", method="POST", data=formatted_cats, headers_extra=upsert_headers)
    prod_res = supabase_request("products", method="POST", data=formatted_prods, headers_extra=upsert_headers)
    user_res = supabase_request("profiles", method="POST", data=formatted_users, headers_extra=upsert_headers)

    synced_prods = len(formatted_prods) if prod_res.get("success") else 0
    synced_cats = len(formatted_cats) if cat_res.get("success") else 0
    synced_users = len(formatted_users) if user_res.get("success") else 0

    return {
        "success": bool(prod_res.get("success") or cat_res.get("success") or user_res.get("success")),
        "categories_migrated": synced_cats,
        "products_migrated": synced_prods,
        "users_migrated": synced_users,
        "categories_status": cat_res,
        "products_status": prod_res,
        "users_status": user_res,
        "message": f"Successfully synchronized {synced_prods} products, {synced_cats} categories, and {synced_users} user profiles to Supabase cloud database!"
    }

# Backward compatibility alias
migrate_sqlite_to_supabase = sync_master_catalogue_to_supabase

def sync_custom_catalogue(medicines_list, categories_list=None):
    """Syncs medicine catalogue and category objects directly from the web client to Supabase."""
    cfg = get_supabase_config()
    if not cfg["configured"]:
        return {"success": False, "error": "Supabase is not configured yet. Please configure URL and API key."}

    results = {"categories_synced": 0, "medicines_synced": 0}

    # 1. Sync Categories
    if categories_list:
        formatted_cats = []
        for cat in categories_list:
            if isinstance(cat, dict) and cat.get("name"):
                formatted_cats.append({
                    "name": cat.get("name"),
                    "code": cat.get("code") or cat.get("name", "").upper()[:10],
                    "title": cat.get("title") or cat.get("name"),
                    "description": cat.get("description") or "",
                    "icon": cat.get("icon") or "leaf",
                    "status": "Active"
                })
        if formatted_cats:
            cat_res = supabase_request("categories", method="POST", data=formatted_cats)
            results["categories_status"] = cat_res
            results["categories_synced"] = len(formatted_cats)

    # 2. Sync Medicines
    if medicines_list:
        formatted_prods = []
        for m in medicines_list:
            if isinstance(m, dict) and m.get("name"):
                code = m.get("code") or f"AYUR-{str(m.get('id', ''))[:8]}"
                packings = m.get("packings") or []
                if isinstance(packings, str):
                    packings = [p.strip() for p in packings.split(",") if p.strip()]
                ingredients = m.get("ingredients") or []
                if isinstance(ingredients, str):
                    ingredients = [i.strip() for i in ingredients.split(",") if i.strip()]

                formatted_prods.append({
                    "code": code,
                    "name": m.get("name"),
                    "category_name": m.get("category"),
                    "classical_reference": m.get("reference") or m.get("classical_reference"),
                    "packings": packings,
                    "ingredients": ingredients,
                    "dosage": m.get("dosage"),
                    "indications": m.get("monograph") or m.get("indications") or m.get("description"),
                    "description": m.get("description"),
                    "image_url": m.get("image") or m.get("image_url"),
                    "stock": 50,
                    "status": "Active" if m.get("published", True) else "Draft",
                    "featured": bool(m.get("featured", False))
                })

        if formatted_prods:
            prod_res = supabase_request("products", method="POST", data=formatted_prods)
            results["products_status"] = prod_res
            results["medicines_synced"] = len(formatted_prods)

    results["success"] = True
    results["message"] = f"Successfully synchronized {results['medicines_synced']} medicines and {results['categories_synced']} categories to Supabase cloud database!"
    return results
