#!/usr/bin/env python3
"""
Sync authentic medicine photos from sitaramayurveda.com/collections/all
to all products in the Supabase products table.
"""

import json
import re
import urllib.request
import urllib.parse
import urllib.error
import time

def main():
    with open('data/supabase_config.json') as f:
        cfg = json.load(f)
    supabase_url = cfg['url']
    supabase_key = cfg['key']

    # 1. Fetch current products from Supabase
    fetch_req = urllib.request.Request(
        f"{supabase_url}/rest/v1/products?select=id,code,name,category_name,image_url&order=id.asc",
        headers={
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}"
        }
    )
    with urllib.request.urlopen(fetch_req) as resp:
        products = json.loads(resp.read().decode('utf-8'))
    print(f"Loaded {len(products)} products from Supabase.")

    # 2. Load scraped Sitaram Shopify products
    with open('data/all_sitaram_shopify_products.json') as f:
        sitaram_products = json.load(f)
    print(f"Loaded {len(sitaram_products)} Sitaram Shopify products.")

    # Build handle to image map
    handle_to_img = {}
    handle_to_title = {}
    for p in sitaram_products:
        handle = p.get('handle', '')
        title = p.get('title', '')
        imgs = [img['src'] for img in p.get('images', []) if 'src' in img]
        if imgs:
            handle_to_img[handle] = imgs[0]
            handle_to_title[handle] = title

    # Category authentic packaging fallbacks from Sitaram Ayurveda
    cat_fallbacks = {
        'Arishtam': ('https://cdn.shopify.com/s/files/1/0705/1182/0938/files/01_ABHAYARISHTAM_450_ML.jpg?v=1760073644', 'Abhayarishtam 450 Ml'),
        'Asavam': ('https://cdn.shopify.com/s/files/1/0705/1182/0938/files/19_ARAVINDASAVAM_450_ML.jpg?v=1760081151', 'Aravindasavam 450 Ml'),
        'Choornams': ('https://cdn.shopify.com/s/files/1/0705/1182/0938/files/29_ASHTACHOORNAM_50_GM.jpg?v=1760082086', 'Ashtachoornam 50 Gm'),
        'Gulika, Gulika Tablets, Capsules': ('https://cdn.shopify.com/s/files/1/0705/1182/0938/files/68_CHANDRAPRABHA_GULIKA_TABLET_50_NOS.jpg?v=1762338652', 'Chandraprabha Gulika Tablet 50 Nos'),
        'Thailams': ('https://cdn.shopify.com/s/files/1/0705/1182/0938/files/ASANAVILWADI_THAILAM_200_ML.jpg?v=1779689794', 'Asanavilwadi Thailam 200 Ml'),
        'Kashayams': ('https://cdn.shopify.com/s/files/1/0705/1182/0938/files/10_AMRUTHOTHARAM_KASHAYAM_200_ML.jpg?v=1760080387', 'Amruthotharam Kashayam 200 Ml'),
        'Bhasmas / Ksharams': ('https://cdn.shopify.com/s/files/1/0705/1182/0938/files/358_KALYANAKSHARAM_50_GM.jpg?v=1774866429', 'Kalyanaksharam 50 Gm'),
        'Arkam': ('https://cdn.shopify.com/s/files/1/0705/1182/0938/files/429_MAHISHA_DRAVAKAM_450_ML_300x-100.jpg?v=1774955489', 'Mahisha Dravakam 450 Ml')
    }

    # Explicit accurate handle mappings
    EXPLICIT_MAP = {
        'Abhayarishtam': 'abhayarishtam',
        'Amritarishtam': 'amrutharishtam',
        'Amrutharishtam': 'amrutharishtam',
        'Ashokarishtam': 'asokarishtam-450-ml',
        'Balarishtam': 'balarishtam',
        'Draksharishtam': 'draksharishtam',
        'Dashamoolarishtam': 'dasamoolarishtam',
        'Punarnavarishtam': 'punarnavarishtam',
        'Saraswatarishtam': 'saraswatharishtam-450-ml',
        'Anu Thailam': 'anutailam',
        'Dhanwantharam Tailam': 'dhanwantharam-thailam-200-ml',
        'Maharasnadi Kashayam': 'maharasnadi-kashaya',
        'Ayaskriti': 'ayaskruthi',
        'Dasamoolajeerakam': 'dasamoolajeerakarishtam',
        'Khadirarishtam': 'khadirarishtam',
        'Kutajarishtam': 'kutajarishtam',
        'Mustharishtam': 'mustharishtam',
        'Parpatakarishtam': 'parpatakarishtam',
        'Sudarsanarishtam': 'sudarshanarishtam',
        'Vasarishtam': 'vasarishtam',
        'Aragwadharishtam': 'aragwadarishtam',
        'Jeerakarishtam': 'jeerakarishtam',
        'Lakshmanarishtam': 'lakshmanarishtam',
        'Aravindasavam': 'aravindasavam',
        'Bhrngarajasavam': 'bhrungarajasavam',
        'Chandanasavam': 'chandanasavam',
        'Devadarvyasavam': 'devadarvyasavam',
        'Drakshasavam': 'drakshasavam',
        'Jirakasavam': 'jeerakasavam',
        'Kanakasavam': 'kanakasavam',
        'Kumaryasavam': 'kumaryasavam',
        'Lodhrasavam': 'lodhrasavam',
        'Lohasavam': 'lohasavam-2',
        'Nalikerasavam': 'nalikerasavam',
        'Pippalyasavam': 'pippalyasavam',
        'Poothikasavam': 'pothikasavam',
        'Punarnavasavam': 'punarnavasavam',
        'Saribadyasavam': 'saribadyasavam',
        'Usheerasavam': 'useerasavam-450-ml',
        'Mahisha Dravakam': 'mahisha-dravakam-450-ml',
        'Kalyana Ksharam': 'kalyanaksharam-50-gm',
        'Aswagandha Choornam': 'aswagandha-choornam-50-gm',
        'Aswagandhadi Choornam': 'aswagandhadi-choornam-50-gm',
        'Ashtachoornam': 'ashtachoornam',
        'Avipathi Choornam': 'avipatthi-choornam',
        'Dadimashtaka Choornam': 'dadimashtaka-choornam-50-gm',
        'Dasanakanthi Choornam': 'dasanakanthi-choornam-50-gm',
        'Eladi Choornam': 'eladi-choornam-50-gm',
        'Gokshura Choornam': 'gokshura-powder-choornam-50-gm',
        'Gruhadhoomadi Choornam': 'gruhadhoomadi-choornam-50-gm',
        'Guggulu Panchapala Choornam': 'guggulu-panchapala-choornam',
        'Hinguvachadi Choornam': 'hinguvachadi-choornam-50-gm',
        'Hinguvachadi gulika tablet': 'hinguvachadi-tablet',
        'Jatamayadi Choornam': 'jatamayadi-choornam-50-gm',
        'Kapikachu Choornam': 'kapikacchu',
        'Karpooradi Choornam': 'karpooradi-choornam',
        'Kolakulathadi Choornam': 'kolakulathadi-choornam-100-gm',
        'Kottamchukkadi Choornam': 'kottamchukkadi-choornam-100-gm',
        'Lodhradi Choornam': 'lodhradi-choornam-50-gm',
        'Nagaradi lepa Choornam': 'nagaradi-lepa-choornam-50-gm',
        'Nimbadi Choornam': 'nimbadi-churna-50-gm',
        'Panchakola Choornam': 'panchakola-choornam-50-gm',
        'Pushyanuga Choornam': 'pushyanuga-churna-50-gm',
        'Rajanyadi choornam': 'rajanyadi-choornam-50-gm',
        'Rasnadi Choornam': 'rasnadi-choornam',
        'Shaddharana Choornam': 'shaddharana-churna-50-gm',
        'Sigrupunarnavadi Choornam': 'sigrupunarnavadi-choornam-50-gm',
        'Sudarsana Choornam': 'sudarshan-churna-50-gm',
        'Thaleesapatradi Choornam': 'thaleesapathradi-choornam',
        'Thriphala Choornam': 'triphala-choornam',
        'Vaiswanara choornam': 'vaiswanara-choornam-50-gm',
        'Vidangathandulathi Choornam': 'vidangathanduladi-choornam',
        'Chandraprabha gulika': 'chandraprabha-gulika-tablet-50-nos',
        'Chandraprabha gulika tablet': 'chandraprabha-gulika-tablet-50-nos',
        'Chandraprabha gulika tablets': 'chandraprabha-gulika-tablet-50-nos',
        'Dhanwantharam gulika': 'dhanwantharam-gulika',
        'Dhanwantharam gulika tablets': 'dhanwantharam-gulika',
        'Dooshivishari gulika': 'dooshivishari-gulika-100-nos',
        'Dooshivishari gulika tablets': 'dooshivishari-gulika-100-nos',
        'Gorochanadi gulika': 'gorochanadi-gulika',
        'Gorochanadi gulika tablets': 'gorochanadi-gulika',
        'Kaisora guggulu gulika tablet': 'kaishora-guggulu-gulika-tablet-50-nos',
        'Kaisora gulgulu gulika': 'kaishora-guggulu-gulika-tablet-50-nos',
        'Kanchanara guggulu gulika': 'kanchanara-guggulu-tablets-60-nos',
        'Kanchanara gulgulu gulika tablet': 'kanchanara-guggulu-tablets-60-nos',
        'Karutha vattu': 'karutha-vattu-gulika-10-nos',
        'Kasthooryadi gulika': 'kasthooryadi-gulika-100-nos',
        'Kombanchadi gulika': 'kombanchadi-gulika-100-nos',
        'Krimighna gulika': 'krimighna-vati-100-nos',
        'Manasamithram gulika': 'manasamitra-vatakam',
        'Manasamithram gulika tablets': 'manasamitra-vatakam',
        'Rajapravartini vati tablet': 'rajahpravartini-vati-tablet-60-nos',
        'Shaddharanam capsules': 'shaddaranam-capsules-50-nos',
        'Siva Gulika': 'sivagulika',
        'Vilwadi Gulika': 'vilwadi-gulika',
        'Vilwadi gulika tablets': 'vilwadi-gulika',
    }

    # Clean function for fallback matching
    def clean_key(s):
        s = s.lower()
        s = re.sub(r'\b\d+\s*(ml|gm|g|nos|tabs?|caps?)\b', '', s)
        for term in ['choornam', 'churna', 'churnam', 'arishtam', 'arishta', 'asavam', 'asava', 
                     'gulika', 'vati', 'vatti', 'thailam', 'tailam', 'taila', 'kashayam', 'kashaya', 
                     'tablets', 'tablet', 'capsules', 'capsule', 'dravakam', 'dravaka']:
            s = s.replace(term, '')
        s = s.replace('ee', 'i').replace('oo', 'u').replace('th', 't').replace('dh', 'd').replace('bh', 'b').replace('kh', 'k').replace('gh', 'g').replace('sh', 's').replace('w', 'v')
        return re.sub(r'[^a-z0-9]', '', s)

    # Index all sitaram products
    clean_sitaram = {}
    for p in sitaram_products:
        imgs = [i['src'] for i in p.get('images', []) if 'src' in i]
        if not imgs:
            continue
        ck_title = clean_key(p.get('title', ''))
        ck_handle = clean_key(p.get('handle', ''))
        if ck_title and ck_title not in clean_sitaram:
            clean_sitaram[ck_title] = (imgs[0], p['title'])
        if ck_handle and ck_handle not in clean_sitaram:
            clean_sitaram[ck_handle] = (imgs[0], p['title'])

    updated_count = 0
    errors = 0

    print("\nStarting photo sync to Supabase...")
    for prod in products:
        pid = prod['id']
        name = prod['name']
        cat = prod.get('category_name', '')
        
        target_img = None
        source_desc = ""

        # 1. Explicit map
        if name in EXPLICIT_MAP:
            h = EXPLICIT_MAP[name]
            if h in handle_to_img:
                target_img = handle_to_img[h]
                source_desc = f"Exact Match ({handle_to_title[h]})"

        # 2. Clean key match
        if not target_img:
            ck = clean_key(name)
            if ck in clean_sitaram:
                target_img, title = clean_sitaram[ck]
                source_desc = f"Fuzzy Match ({title})"

        # 3. Substring match
        if not target_img:
            ck = clean_key(name)
            if len(ck) >= 4:
                for sck, (img_url, title) in clean_sitaram.items():
                    if ck in sck or sck in ck:
                        target_img = img_url
                        source_desc = f"Partial Match ({title})"
                        break

        # 4. Authentic category packaging from Sitaram
        if not target_img:
            fb_img, fb_title = cat_fallbacks.get(cat, cat_fallbacks['Arishtam'])
            target_img = fb_img
            source_desc = f"Authentic Sitaram Packaging ({fb_title})"

        # Only update if image_url is different
        if prod.get('image_url') != target_img:
            patch_data = json.dumps({'image_url': target_img}).encode('utf-8')
            patch_req = urllib.request.Request(
                f"{supabase_url}/rest/v1/products?id=eq.{pid}",
                data=patch_data,
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": "application/json"
                },
                method='PATCH'
            )
            try:
                with urllib.request.urlopen(patch_req) as resp:
                    updated_count += 1
                    print(f"[{updated_count}/{len(products)}] ✓ ID {pid:3d} | {name:30s} -> {source_desc}")
            except Exception as e:
                errors += 1
                print(f"✗ Failed ID {pid} ({name}): {e}")
            time.sleep(0.05)
        else:
            print(f"  • ID {pid:3d} | {name:30s} (already up to date)")

    print(f"\nPhoto Sync Complete! Updated: {updated_count}, Errors: {errors}")

    # 4. Synchronize data/sitaram_export.json backup
    try:
        fresh_req = urllib.request.Request(
            f"{supabase_url}/rest/v1/products?select=*&order=id.asc",
            headers={
                "apikey": supabase_key,
                "Authorization": f"Bearer {supabase_key}"
            }
        )
        with urllib.request.urlopen(fresh_req) as resp:
            fresh_products = json.loads(resp.read().decode('utf-8'))
        
        export_file = 'data/sitaram_export.json'
        with open(export_file, 'r') as f:
            exp_data = json.load(f)
        exp_data['products'] = fresh_products
        with open(export_file, 'w') as f:
            json.dump(exp_data, f, indent=2)
        print(f"Synced {len(fresh_products)} updated products into {export_file}")
    except Exception as e:
        print(f"Notice on export sync: {e}")

if __name__ == '__main__':
    main()
