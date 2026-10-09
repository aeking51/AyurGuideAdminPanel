#!/usr/bin/env python3
"""
Seed OTC Products and Ethical Patents from Sitaram Ayurveda Therapeutic Index Hand Book.
Skips any medicine that already exists in Supabase.
Associates authentic photos directly from https://sitaramayurveda.com/collections/all.
"""

import os
import json
import re
import urllib.request
import urllib.parse
import urllib.error
import time

MEDICINES_BATCH_3 = [
    # ==========================================
    # --- O. T. C. PRODUCTS ---
    # ==========================================
    {
        "name": "Aller-G Tablets",
        "category_name": "O.T.C Products",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["Pack of 10X10 Strips"],
        "ingredients": ["Haridra", "Harithaki", "Vibhithaki", "Amalaki"],
        "usage": "For Internal use only",
        "indications": "Kasa (Cough), Peenasa (Rhinitis), Kshavadhu.",
        "description": "Proprietary anti-allergic formulation providing swift relief from allergic rhinitis, frequent sneezing, and respiratory sensitivities.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/01_3.webp?v=1760702336"
    },
    {
        "name": "Aja Aswagandha Rasayanam",
        "category_name": "O.T.C Products",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["450gm"],
        "ingredients": ["Aswagandha", "Yashtimadhu", "Ajamamsa"],
        "usage": "For internal use only",
        "indications": "Kasa (Cough), Soothika paricharya (Post-natal care), Sosha (Emaciation), General and sexual debility",
        "description": "Nourishing rejuvenative jam combining processed goat meat with Ashwagandha and Yashtimadhu for postpartum recovery and vital stamina.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/03_AJA_ASHWAGANDHA_RASAYANAM_450_GM.jpg?v=1760074880"
    },
    {
        "name": "Ajamamsa Rasayanam",
        "category_name": "O.T.C Products",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["450gm"],
        "ingredients": ["Aswagandha", "Yashtimadhu", "Kapikachu", "Ajamamsa"],
        "usage": "For internal use only",
        "indications": "Kasa (Cough), Soothika paricharya (Post-natal care), Sosha (Emaciation), General and sexual debility",
        "description": "High-potency restorative electuary prepared with goat meat, Kapikacchu, and nutritive rasayana herbs for neuromuscular revitalization.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/04_AJAMAMSA_RASAYANAM_450_GM.jpg?v=1760075443"
    },
    {
        "name": "Clearosap Tablets (Safelax Tablets)",
        "category_name": "O.T.C Products",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["Pack of 10 X12 blisters"],
        "ingredients": ["Vidanga", "Thrivrut", "Harithaki"],
        "usage": "For Internal use only",
        "indications": "Purgative, Chronic Constipation, Bowel Cleansing",
        "description": "Gentle, non-habit forming laxative tablet that regulates bowel motility and alleviates abdominal distension without cramping.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/79_CLEAROSAP_TABLETS_12_NOS.jpg?v=1762404717"
    },
    {
        "name": "Chyavanaprasham",
        "category_name": "O.T.C Products",
        "classical_reference": "A.F.I. Part 1 Charaka Samhitha",
        "packings": ["450 g"],
        "ingredients": ["Amalaki", "Pippali", "Kesara", "Draksha", "Jeevanti", "Meda"],
        "usage": "For internal use only",
        "indications": "Premeha (Polyuria), Kasa (Cough), Swasa (Respiratory diseases), Svarabhedha (Hoarseness of sound), Kshaya (Weakness), Agnimandya (Loss of appetite), Pipasa (Polydipsia)",
        "description": "The quintessential classical Ayurvedic Rasayana rich in natural Vitamin C from Amla, promoting cellular rejuvenation and respiratory resistance.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/CHYAVANAPRASHAM_450_GM.jpg?v=1779690842"
    },
    {
        "name": "Dhathryarishtam (Nellikkasavam)",
        "category_name": "O.T.C Products",
        "classical_reference": "Charaka Samhitha",
        "packings": ["450ml"],
        "ingredients": ["Dhatri", "Pippali"],
        "usage": "For internal use only",
        "indications": "Kamala (Jaundice), Pandu (Anaemia), Hridroga (Heart diseases), Vataraktha (Gout)",
        "description": "Classical fermented amla elixir indicated in hepato-biliary dysfunction, iron deficiency, cardiovascular fatigue, and pitta-rakta imbalances.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/106_DHATRYARISHTAM_NELLIKASAVAM_450_ML.jpg?v=1768112391"
    },
    {
        "name": "Kumkumadi Thailam",
        "category_name": "O.T.C Products",
        "classical_reference": "Ashtanga Hrudayam",
        "packings": ["10ml"],
        "ingredients": ["Kumkuma", "Laksha", "Yashtimadhu", "Padmaka", "Padmakesara"],
        "usage": "For external application and Nasya",
        "indications": "Palithya (Greying of hair), Vyanga (Discolouration on face), Mukhadusha (Acne)",
        "description": "Legendary saffron facial oil enhancing natural radiance, evening pigmentation, reducing acne scars, and nourishing facial tissues.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/400_Kumkumadi_tailam_10_ML.jpg?v=1774949543"
    },
    {
        "name": "Murivenna Ointment",
        "category_name": "O.T.C Products",
        "classical_reference": "A.F.I. Part 3",
        "packings": ["20gm"],
        "ingredients": ["Kera thaila", "Thambula", "Shigru", "Karanja"],
        "usage": "For external application only",
        "indications": "Vruna (Ulcer), Sandhisopha (Arthritis), Abhighataja Sopha (Inflammation due to trauma)",
        "description": "Topical soothing salve based on the venerable Murivenna oil formula, highly effective for quick healing of wounds, burns, sprains, and bruises.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/177_MURIVENNA_OINTMENT_20_GM.jpg?v=1768203670"
    },
    {
        "name": "Narasimha Oil",
        "category_name": "O.T.C Products",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["100ml"],
        "ingredients": ["Khadira", "Bhrungaraja", "Loha bhasma", "Amalaki"],
        "usage": "For external use only",
        "indications": "Khalitya (Hair fall), Palithya (Greying of hair)",
        "description": "Potent hair-follicle strengthening oil processed with iron bhasma and bhringaraja to halt premature greying and stimulate dense hair growth.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/Artboard_29.png?v=1751109116"
    },
    {
        "name": "Narasimham Shampoo",
        "category_name": "O.T.C Products",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["100ml"],
        "ingredients": ["Amalaki", "Vidanga", "Asana"],
        "usage": "For external application only",
        "indications": "Hair cleansing, Dandruff prevention, Scalp cooling, Lustrous hair",
        "description": "Gentle herbal scalp cleanser enriched with natural saponins from Triphala and botanical extracts, leaving hair silky and dandruff-free.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/197_NARASIMHAM_SHAMPOO_100_ML.jpg?v=1768212698"
    },
    {
        "name": "Neelibhringadi Kera Thailam",
        "category_name": "O.T.C Products",
        "classical_reference": "A.F.I. Part 1 Sahasrayogam",
        "packings": ["100 ml", "200 ml", "450 ml", "5 l"],
        "ingredients": ["Neeli", "Dhatri", "Karnasphota", "Yashtimadhu"],
        "usage": "For external application only",
        "indications": "Kesapatha (Hairfall), Palithya (Greying of hair), Dandruff",
        "description": "Premier Ayurvedic hair care oil prepared in coconut oil with fresh indigo leaves, goat milk, and amla juice for head cooling and deep hair roots.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/WhatsApp_Image_2026-07-06_at_4.52.37_PM.jpg?v=1783337494"
    },
    {
        "name": "Pranah Capsules",
        "category_name": "O.T.C Products",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["Bottle of 60 Capsules"],
        "ingredients": ["Amalaki", "Aswagandha", "Yashtimadhu"],
        "usage": "For internal use only",
        "indications": "Ksheena (General weakness), Stress and anxiety",
        "description": "Synergistic adaptogen capsule revitalizing the central nervous system, calming persistent stress, and restoring vital stamina.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/237_PRANAH_CAPSULES_60_NOS.jpg?v=1771391745"
    },
    {
        "name": "Panchajeeraka Gulam",
        "category_name": "O.T.C Products",
        "classical_reference": "Sahasrayogam",
        "packings": ["250gm"],
        "ingredients": ["Jeeraka", "Dhanyaka", "Kasamarda"],
        "usage": "For internal use only",
        "indications": "Soothika (Post natal care), Kasa, Swasa (Respiratory diseases), Pandu (Anemia)",
        "description": "Traditional jaggery-based post-partum nutritional electuary strengthening reproductive organs, boosting lactation, and treating anemia.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/294_SHATAVARI_GULAM_500_GMS.jpg?v=1776854314"
    },
    {
        "name": "Raja Bringa Thailam",
        "category_name": "O.T.C Products",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["200ml"],
        "ingredients": ["Bhrungaraja", "Neeli", "Japa", "Narikela ksheera"],
        "usage": "For external application",
        "indications": "Khalitya (Stimulates hair growth), Palithya, Darunaka",
        "description": "Royal hair nectar enriched with hibiscus, coconut milk, and bhringaraja to encourage thick hair volume and eliminate stubborn dandruff.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/Artboard_29.png?v=1751109116"
    },
    {
        "name": "Rakthachandana Choornam",
        "category_name": "O.T.C Products",
        "classical_reference": "API Part 1 Vol 3",
        "packings": ["50gm"],
        "ingredients": ["Raktha chandana"],
        "usage": "For external application",
        "indications": "Vyanga (Facial melanosis), Varnya (Improves complexion)",
        "description": "Pure micro-pulverized red sandalwood powder for therapeutic face masks, treating hyperpigmentation, sunburn, and skin irritation.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/261_RED_SANDALWOOD_POWDER_-_RAKTA_CHANDAN_POWDER_50_GMS.jpg?v=1771395228"
    },
    {
        "name": "Sitaram Dahasamani",
        "category_name": "O.T.C Products",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["50g"],
        "ingredients": ["Padmaka", "Usheeram", "Sariva"],
        "usage": "For internal use only",
        "indications": "Dahashamanam (Thirst), Body heat, Pitta pacification",
        "description": "Traditional herbal blend for boiling drinking water, infusing natural pink hue, cooling the visceral system, and quenching morbid thirst.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/263_S_T_POWDER_50_GM.jpg?v=1771396204"
    },
    {
        "name": "Sitaram Hair Tone",
        "category_name": "O.T.C Products",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["200ml"],
        "ingredients": ["Asana", "Bilva", "Neeli", "Kunthirikkam"],
        "usage": "For external application only",
        "indications": "Khalitya (Stimulate hair growth), Darunaka (Dandruff), ShiraShoolam",
        "description": "Daily scalp oil tonic strengthening hair shafts, reducing chronic headaches and fatigue from eye strain.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/Artboard_29.png?v=1751109116"
    },
    {
        "name": "Sitaram Honey",
        "category_name": "O.T.C Products",
        "classical_reference": "Sitaram Natural Products",
        "packings": ["50g", "100g", "250g"],
        "ingredients": ["Pure Forest Honey (Madhu)"],
        "usage": "For internal and external use",
        "indications": "Anupana for Ayurvedic medicines, Throat soothing, Weight management, Natural antioxidant",
        "description": "100% unadulterated, unpasteurized natural honey collected from pristine wild forests, serving as the ideal classical Yogavahi carrier.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/301_SITARAM_HONEY_100_GRM_300x-100.jpg?v=1774429763"
    },
    {
        "name": "Sitaram Thengin Pookkula Lehyam",
        "category_name": "O.T.C Products",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["400gm"],
        "ingredients": ["Narikela", "Narikela Ksheera", "Aswagandha", "Thila thailam", "Shatahva"],
        "usage": "For internal use only",
        "indications": "Soothika (Post-natal care), Back pain, Uterine involution",
        "description": "Prized Kerala post-natal formulation crafted from tender coconut inflorescence to tone pelvic muscles, relieve lumbar ache, and support nursing mothers.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/138_THENGIN_POOKKULA_LEHYAM_400_GM.jpg?v=1768148741"
    },
    {
        "name": "Sitaram Soundarya Choornam",
        "category_name": "O.T.C Products",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["75gm"],
        "ingredients": ["Lodhra", "Manjishta", "Rakthachandana"],
        "usage": "For external application only",
        "indications": "Discolouration on face, Pimples, Blemishes",
        "description": "Exquisite Ayurvedic skin glow pack blending botanical astringents and complexion enhancers to clear acne and refine skin texture.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/WhatsApp_Image_2026-09-23_at_11.27.08_AM_1.jpg?v=1790161088"
    },
    {
        "name": "Sitaram Tooth Powder",
        "category_name": "O.T.C Products",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["50gm"],
        "ingredients": ["Burbura", "Ela", "Twak", "Kannaram"],
        "usage": "For Brushing teeth",
        "indications": "Oral hygiene, Bleeding gums, Toothache, Halitosis",
        "description": "Aromatic herbal dentifrice preserving tooth enamel, strengthening spongy gums, and imparting lasting natural freshness.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/303_SITARAM_TOOTH_POWDER_50_GM_300x-100.jpg?v=1774430005"
    },
    {
        "name": "Sitaram Dinesavalyadi Soap",
        "category_name": "O.T.C Products",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["75g"],
        "ingredients": ["Dineshavalyadi Kera thailam", "Coconut oil"],
        "usage": "For external application only",
        "indications": "Skin brightening, Even skin tone, Sun-tan removal",
        "description": "Herbal cleansing bar infused with cold-pressed coconut oil and classical Dinesavalyadi thailam to brighten complexion and remove blemishes.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/112_DINESAVALYADI_SOAP_75_GM.jpg?v=1768114487"
    },
    {
        "name": "Sitaram Eladi Soap",
        "category_name": "O.T.C Products",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["75gm"],
        "ingredients": ["Eladi Kera Thailam", "Coconut oil"],
        "usage": "For external application only",
        "indications": "Dry skin, Itching, Skin allergic manifestations",
        "description": "Luxurious bathing bar carrying the anti-pruritic goodness of cardamom, cinnamon, and cooling herbs to soothe sensitive, reactive skin.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/409867932.webp?v=1759929416"
    },
    {
        "name": "Sitaram Lakshadi Soap",
        "category_name": "O.T.C Products",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["75gm"],
        "ingredients": ["Lakshadi Kera Thailam", "Coconut oil"],
        "usage": "For external use only",
        "indications": "Deep nourishing and calming, Sensitive baby skin, Flaky skin",
        "description": "Ultra-gentle nourishing soap formulated with Lakshadi oil and coconut butter to seal in moisture and preserve the natural skin barrier.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/406_LAKSHADI_SOAP_75_GM.jpg?v=1774949929"
    },
    {
        "name": "Twageladi Lehyam",
        "category_name": "O.T.C Products",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["100g"],
        "ingredients": ["Kantakari", "Pushkaramula", "Maricha", "Pippalimula"],
        "usage": "For internal use only",
        "indications": "Kasa (Cough), Agnimandya (Indigestion), Chardi (Vomiting), Hrillasa (Nausea), Aruchi (Anorexia), Swasa",
        "description": "Delicious herbal electuary providing instantaneous relief from mucosal congestion, nausea, dry hacking cough, and digestive sluggishness.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/143_THWAGELADI_LEHYAM_100_GM.jpg?v=1768149708"
    },

    # ==========================================
    # --- ETHICAL PATENTS ---
    # ==========================================
    {
        "name": "A.P.Har Tablets",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["Pack of 10X10 strips"],
        "ingredients": ["Harithaki", "Vibhithaki", "Amalaki"],
        "usage": "For internal use only",
        "indications": "Amlapitta (Hyper acidity), Vibanda (constipation)",
        "description": "Specialized patented formulation for hyperacidity, acid reflux, heartburn, and gastrointestinal motility balance.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/15_AP_HAR_TABLET_100_NOSxxxhdpi.png?v=1779688369"
    },
    {
        "name": "Allerkhand Powder",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["50 g"],
        "ingredients": ["Haridra", "Pippali", "Nagara", "Amalaki", "Annabhedi sindhooram"],
        "usage": "For internal use only",
        "indications": "Preventing and Managing all types of Prathishyaya (Allergic rhinitis), Eosinophilia, Swasa (Respiratory diseases), Kasa (Cough), Seethapitha (Urticaria)",
        "description": "Comprehensive patented herbal powder strengthening mucosal immunity, stabilizing mast cells, and subduing urticaria and allergic rhinitis.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/06_ALLERKHAND_CHOORNAM_-_TABLET.jpg?v=1760076620"
    },
    {
        "name": "Allerkhand Tablet",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["Pack of 5X10 blisters"],
        "ingredients": ["Haridra", "Pippali", "Nagara", "Amalaki", "Annabhedi sindhooram"],
        "usage": "For internal use only",
        "indications": "Preventing and Managing all types of Prathishyaya (Allergic rhinitis), Eosinophilia, Swasa (Respiratory diseases), Kasa (Cough), Seethapitha (Urticaria)",
        "description": "Convenient compressed tablet form of the trusted Allerkhand compound for seasonal allergies and respiratory hypersensitivity.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/06_ALLERKHAND_CHOORNAM_-_TABLET.jpg?v=1760076620"
    },
    {
        "name": "Antussin Capsules",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["Pack of 5X10 blisters"],
        "ingredients": ["Maricha", "Harithaki"],
        "usage": "For internal use only",
        "indications": "Kasa, Prathishyaya (Provides relief to Rhinitis), Agnimandya (Indigestion), Aruchi (Anorexia)",
        "description": "Targeted anti-tussive capsule calming irritation in the larynx, loosening bronchospasms, and restoring taste and appetite.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/13_ANTUSSIN_CAPSULE_50_NOS.jpg?v=1760080689"
    },
    {
        "name": "Asthra Plus",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["225 g"],
        "ingredients": ["Sathavari", "Vidari", "Aswagandha", "Kapikachu"],
        "usage": "For internal use only",
        "indications": "Dwajasthamba (All kinds of Beejadosha in male and can be effectively used as Vajeekaram)",
        "description": "Premium male reproductive restorative and aphrodisiac promoting spermatogenesis, neuro-muscular vitality, and endurance.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/34_ASTHRA_PLUS_225_GM.jpg?v=1760082525"
    },
    {
        "name": "Balamrutham",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["450 ml"],
        "ingredients": ["Draksha", "Maricha", "Ela", "Madhuka"],
        "usage": "For internal use only",
        "indications": "Bala roga (Pediatric Diseases especially in Grahani (Sprue Syndrome), Chardi (Vomiting), Aruchi (Anorexia), Sosha (Emaciation)",
        "description": "Nutritive pediatric liquid tonic fortifying children's digestive fire, promoting weight gain, and relieving recurring vomiting and colic.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/48_BALAMRUTHAM_450_ML.jpg?v=1762334437"
    },
    {
        "name": "Bronchosap Granules (Swasanamruth Granules)",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["100gm"],
        "ingredients": ["Pippali", "Vidanga", "Haridra", "Maricha", "Thrivrut"],
        "usage": "For internal use only",
        "indications": "Prathishyaya (Rhinitis), Kshavadhu (Sneezing), Kasa (Cough), Thamaka swasa (Asthma), Irritation of Nose and Eyes, Esinophilia",
        "description": "Bronchodilating granules relieving nocturnal wheezing, clearing sticky phlegm, and alleviating allergic rhinitis and asthma symptoms.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/61_BRONCHOSAP_GRANULES_100_GM.jpg?v=1762335934"
    },
    {
        "name": "C.H Quath",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["200 ml"],
        "ingredients": ["Prsniparni", "Salaparni", "Pippali", "Amalaki", "Aswagandha"],
        "usage": "For internal use only",
        "indications": "Premeha (Polyuria), Smruthibramsha (Loss of memory), Ksheena (Weakness)",
        "description": "Proprietary neuro-metabolic decoction supporting cognitive agility, regulating fluid dynamics, and counteracting chronic debility.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/63_C._H._QUATH_200_ML.jpg?v=1762337459"
    },
    {
        "name": "Cardiosap Tablets (Cardiocalm Tablet)",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["Pack of 5X10 blisters"],
        "ingredients": ["Sarpagandha", "Bilva", "Arjuna", "Brahmi"],
        "usage": "For internal use only",
        "indications": "Rakthadimardham (Hypertension and related complaints), Sopha (Peripheral Edema)",
        "description": "Cardioprotective and hypotensive tablet utilizing Terminalia arjuna and Sarpagandha to modulate blood pressure and reduce cardiac stress.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/64_CARDIOCALM_-_CARDIOSAP_TABLET_50_NOS.jpg?v=1762337814"
    },
    {
        "name": "Dasamool Cough Syrup",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["100ml"],
        "ingredients": ["Bilva", "Sunti Maricha", "Vasa", "Tulsi"],
        "usage": "For internal use only",
        "indications": "Swasa (Respiratory diseases), Kasa (Cough), Parshwa Shoolam (Pain on flanks), Prushta Shoolam (Pain on back), Jwara (Fever)",
        "description": "Herbal expectorant syrup enriched with the ten roots and holy basil, soothing sore throats and relieving pleural and back spasms from coughing.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/82_DASAMOOL_COUGH_SYRUP_100_ML.jpg?v=1762405371"
    },
    {
        "name": "Dermosap Ointment",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["15gm"],
        "ingredients": ["Saphthachada", "Nimba", "Gajapippali", "Tankanam"],
        "usage": "For external use only",
        "indications": "Kushta (Skin diseases like Visarpa, Vicharchika, Pama, Dadru), Can be applied in fungal Infections",
        "description": "Broad-spectrum topical antimicrobial ointment indicated in ringworm, eczema, infectious dermatoses, and weeping lesions.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/91_DERMOSAP_OINTMENT_15_GM.jpg?v=1762407011"
    },
    {
        "name": "Fair Foot Ointment",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["15gm"],
        "ingredients": ["Jathi", "Parpataka", "Durva", "Karanja oil"],
        "usage": "For external use only",
        "indications": "Vipadika (Cracks on skin), Cracked heels, Dry fissure feet",
        "description": "Deep-healing botanical heel cream repairing painful fissures, softening calluses, and preventing bacterial superinfections.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/125_FAIR_FOOT_OINTMENT_15_GMS_Pack_of_4.jpg?v=1768117995"
    },
    {
        "name": "Glycohar Plus Tablets",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["Pack of 5X12 blisters"],
        "ingredients": ["Guduchi", "Ekanayakam", "Amalaki", "Haridra"],
        "usage": "For internal use only",
        "indications": "Madhu meha (Type 2 Diabetes mellitus), Insulin resistance",
        "description": "Antidiabetic polyherbal tablet featuring Salacia oblonga and Turmeric to improve insulin sensitivity and regulate glycemic spikes.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/15_AP_HAR_TABLET_100_NOSxxxhdpi.png?v=1779688369"
    },
    {
        "name": "Helmolite - A",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["200ml"],
        "ingredients": ["Dadima", "Khadira", "Vidanga", "Thruvrit"],
        "usage": "For internal use only",
        "indications": "Koshtasrutha krimi vikaram (Ant-Helminthic action), Intestinal parasites",
        "description": "Palatable anthelmintic syrup effectively eradicating intestinal roundworms, pinworms, and associated abdominal colic.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/336_HELMOLITE_A_200_ML.jpg?v=1774689125"
    },
    {
        "name": "Hepamruth Liver Tonic",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["200ml"],
        "ingredients": ["Mustha", "Raktha chandana"],
        "usage": "For internal use only",
        "indications": "Aruchi (Anorexia), For healthy liver, Udara rogas (Gastric disorders), Vibanda (Constipation)",
        "description": "Hepatoprotective and bile-regulating tonic regenerating hepatic parenchyma and reviving sluggish appetite.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/337_HEPAMRUTH_200_ML.jpg?v=1774689511"
    },
    {
        "name": "Kofsap Syrup",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["50ml"],
        "ingredients": ["Bilva", "Vasa", "Tulsi", "Kasamarda", "Karpooram"],
        "usage": "For internal use only",
        "indications": "Swasa (Respiratory diseases), Kasa (Cough), Peenasa",
        "description": "Fast-acting broncho-relaxing syrup clearing stubborn mucous and subduing asthmatic cough without drowsiness.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/381_KOFSAP-SF_COUGH_SYRUP_100_ML.jpg?v=1774947399"
    },
    {
        "name": "Ksheera Guloochi 101",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["10ml"],
        "ingredients": ["Guduchi", "Ksheera", "Thila taila"],
        "usage": "For internal use only",
        "indications": "Vatharaktha (Gout), Vathapitha vikaras",
        "description": "Concentrated 101-times potentiated lipid drops of Guduchi in milk and sesame oil, indicated in hyperuricemia and inflammatory joint disease.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/394_KSHEERA_GULUCHI_101_DROPS.jpg?v=1774948695"
    },
    {
        "name": "Ksheera Guloochi 101 Soft Gel Capsule",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["Pack of 10X10 blisters"],
        "ingredients": ["Guduchi", "Ksheera", "Thila taila"],
        "usage": "For internal use only",
        "indications": "Vatharaktha (Gout), Vathapitha vikaras",
        "description": "Encapsulated dose-controlled form of Ksheera Guloochi 101 for convenient oral administration in chronic arthritis and burning sensation.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/392_KSHEERA_GULOOCHI_100_NOS_-_K.G_101_SOFT_GEL_CAPSULES.jpg?v=1774948543"
    },
    {
        "name": "Menstrosap Soft Gel Capsules",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["Pack of 10X10 blisters"],
        "ingredients": ["Punarnava", "Eranda", "Kulatha", "Eranda thaila", "Chincha"],
        "usage": "For internal use only",
        "indications": "Kashtarthava (Dysmenorrhea), Pelvic congestion, Spasmodic menstrual cramps",
        "description": "Specialized gynecological soft gel capsule easing uterine spasms and regulating smooth menstrual flow.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/439_MENSTROSAP_CAPSULES_100_NOS.jpg?v=1774957911"
    },
    {
        "name": "Narasimha Tablet",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["Pack of 5X12 blisters"],
        "ingredients": ["Gayathri", "Khadira", "Bhrungaraja", "Shilajathu", "Annabhedi sindooram"],
        "usage": "For internal use only",
        "indications": "Khalitya (Hair fall), Palithya (Greying of hair), It can be safely used where Narasimha Rasayanam is indicated",
        "description": "Tablet equivalent of Narasimha Rasayanam offering convenient administration for arresting alopecia, hair thinning, and iron deficiency.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/WhatsApp_Image_2025-10-15_at_3.38.57_PM.jpg?v=1760523460"
    },
    {
        "name": "Nilstone Tablets",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["Pack of 5X12 strips"],
        "ingredients": ["Hapusha", "Gokshura", "Shigru"],
        "usage": "For internal use only",
        "indications": "Muthrakricchra (Dysuria), Muthrala (Diuretic), Ashmari (Calculi), Daha (Burning sensation during micturition), UTI",
        "description": "Potent lithotriptic tablet disintegrating renal calculi, soothing burning micturition, and preventing recurrent urinary tract infections.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/15_AP_HAR_TABLET_100_NOSxxxhdpi.png?v=1779688369"
    },
    {
        "name": "Osteon CG Plus Tablets",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["Pack of 5X10 blisters"],
        "ingredients": ["Guduchi", "Bala", "Shankhabasma", "Sameerapannaga rasam"],
        "usage": "For internal use only",
        "indications": "All types of Vatharaktha (Gout), Sandhi Shoolam (Joint pain)",
        "description": "Targeted bone-mineral and anti-arthritic formulation delivering natural calcium and anti-inflammatory relief to degenerating joints.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/211_OSTEON_C_G_PLUS_TABLET_50_NOS.jpg?v=1771308069"
    },
    {
        "name": "Psoraherb Oil",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["100ml"],
        "ingredients": ["Swetha kutaja", "Kera thaila"],
        "usage": "For external application",
        "indications": "All types of Twak vikaras, Psoriasis, Scaling, Plaque formation",
        "description": "Wrightia tinctoria infused medicated oil specially crafted to clear psoriatic scales, relieve erythema, and normalize keratinization.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/240_PSORA_HERB_OIL_100_ML.jpg?v=1771324104"
    },
    {
        "name": "Rakthamruth",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["200ml"],
        "ingredients": ["Pippali", "Punarnava", "Draksha", "Annabhedi sindhooram"],
        "usage": "For internal use only",
        "indications": "Pandu (Iron Deficiency Anaemia), Bhrama (Giddiness), Agnimandya (Improves Digestion), Vibanda (Regulates motion), Grahani",
        "description": "Natural hematinic and red blood cell booster providing readily absorbable elemental iron with digestive bitters.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/248_RAKTHAMRUTH_200_ML.jpg?v=1771393038"
    },
    {
        "name": "Rhumagen Strong Pain Balm",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["10g"],
        "ingredients": ["Kottamchukkadi thailam", "Sahacharadi thailam", "Karpooradi thailam", "Karpoora", "Eucali oil"],
        "usage": "For external application",
        "indications": "For all kinds of Vatha vikara, Muscular pain, Sprains, Tension headaches",
        "description": "High-impact analgesic balm blending classical pain-relieving oils with camphor and eucalyptus for immediate penetration and relief.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/262_RHUMAGEN_STRONG_PAIN_BALM_10_GMS.jpg?v=1771396011"
    },
    {
        "name": "Saplint Plus Liniment",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["30ml"],
        "ingredients": ["Kottamchukkadi thailam", "Eucalyptus oil", "Karpooram"],
        "usage": "For external application only",
        "indications": "Sandhivatha (Degenerative and Inflammatory Joint Diseases), Grudhrasi, Sprains, Katigraha (Low back ache)",
        "description": "Non-staining fast-absorbing liniment providing deep therapeutic warmth to relieve stiffness and joint inflammation.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/275_SAPLINT_PLUS_ROLL_ON_50_ML.jpg?v=1771397223"
    },
    {
        "name": "Sapsciatin Soft Gel Capsules",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["Pack of 10X10 blisters"],
        "ingredients": ["Rasna", "Eranda", "Punarnava", "Guggulu", "Manjishta", "Guduchi"],
        "usage": "For internal use only",
        "indications": "Grudhrasi (Sciatica), Kadeegraham (Low back ache), Greevagraham (Cervical spondylitis), Mrudhu virechana",
        "description": "Specialized patented neuro-arthritic soft gel relieving sciatic nerve compression, disc discomfort, and lumbar radiating pain.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/WhatsApp_Image_2026-08-14_at_2.27.17_PM_2.jpg?v=1786704641"
    },
    {
        "name": "Scurf Herbal Oil",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["100ml"],
        "ingredients": ["Dhurdurapathradi kera thaila", "Psora herb oil"],
        "usage": "For external application only",
        "indications": "Darunaka (Dandruff), Dadru kushta (Dermatitis), Indraluptha (Alopecia), Khalithya, Keshya",
        "description": "Targeted anti-dandruff and anti-fungal scalp oil resolving dry and oily scurf while nourishing damaged hair follicles.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/285_Scurf_herbal_oil_100_ML.jpg?v=1771398519"
    },
    {
        "name": "Stimulint Soft Gel Capsules",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["Pack of 10X10 blisters"],
        "ingredients": ["Jyotishmathi", "Shankhupushpa", "Vacha", "Brahmi"],
        "usage": "For internal use only",
        "indications": "Rakthadimardham (Hypertension), Apasmara (Epilepsy), Anidra (Insomnia), Smruthibramsha (Loss of memory)",
        "description": "Cognitive and nootropic lipid formulation promoting cerebral circulation, restful sleep, and neuro-protection.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/stimulint_capsules.jpg?v=1783495897"
    },
    {
        "name": "S.T. Powder",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["50 g"],
        "ingredients": ["Harithaki", "Vibhithaki", "Yashtimadhu", "Thrivrut"],
        "usage": "For internal use only",
        "indications": "Vibandha (Constipation), Nethra rogam (Diseases of eye)",
        "description": "Proprietary digestive and ophthalmic laxative cleansing colon toxins and cooling intraocular pressure.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/263_S_T_POWDER_50_GM.jpg?v=1771396204"
    },
    {
        "name": "S.T. Tablet",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["Pack of 5 X10 blisters"],
        "ingredients": ["Harithaki", "Vibhithaki", "Yashtimadhu", "Thrivrut"],
        "usage": "For internal use only",
        "indications": "Vibandha (Constipation), Nethra rogam (Diseases of eye)",
        "description": "Convenient tablet form of the classical S.T. formula for smooth overnight bowel clearance and pitta regulation.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/WhatsApp_Image_2026-07-06_at_4.52.38_PM_2.jpg?v=1783337958"
    },
    {
        "name": "Swapna Sap Tablets",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["Pack of 5X12 blisters"],
        "ingredients": ["Kushta", "Jatamamsi", "Sarpagantha"],
        "usage": "For internal use only",
        "indications": "Anidhra (Insomnia), Rakthadimarda (Hyper Tension), Anxiety, Tension",
        "description": "Natural tranquilizer tablet inducing peaceful non-addictive sleep and moderating hyperactive autonomic nerves.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/128_SWAPNA_SAP_TABLET_60_NOS.jpg?v=1768145563"
    },
    {
        "name": "T.A. Tablet",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["Pack of 10X10 strips"],
        "ingredients": ["Harithaki", "Vibhithaki", "Yashtimadhu", "Annabhedi sindhooram"],
        "usage": "For internal use only",
        "indications": "Pandu (In all type of Anemia), Sopha, Vibanda",
        "description": "Bio-available iron preparation combined with triphala to restore hemoglobin levels without gastric irritation.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/130_T_A_TABLET_60_NOS.jpg?v=1768146585"
    },
    {
        "name": "Testosap (Vegan) Capsules",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["Bottle of 60 capsule"],
        "ingredients": ["Aswagandha", "Kapikachu", "Yashada bhasma", "Shilajathu bhasma", "Kumkuma"],
        "usage": "For internal use only",
        "indications": "Ksheena (General weakness), Male Infertility (Erectile dysfunction)",
        "description": "Standardized vegan capsule boosting testosterone levels, male vigor, energy reserves, and reproductive stamina.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/133_TESTOSAP_-_60_CAPSULES.jpg?v=1768147858"
    },
    {
        "name": "Ostisap Capsules",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["5x10 blisters"],
        "ingredients": ["Pravalabhasma", "Sankhabhasma", "Kukkudandathwakbhasma", "Aswagandha extract"],
        "usage": "For internal use only",
        "indications": "Vatavyadi (all kind of vata vikaras), Sandhigata vata (Joint Pain)",
        "description": "Bioactive marine and avian calcium complex with withania somnifera to halt osteoporotic degradation and joint ache.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/212_OSTISAP_CAPSULES_50_NOS.jpg?v=1771308505"
    },
    {
        "name": "Inflasap Capsules",
        "category_name": "Ethical Patents",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["5x10 blisters"],
        "ingredients": ["Rasna", "Eranda", "Bala", "Guggulu", "Sallaki", "Karkataka", "Glucosamine sulphate"],
        "usage": "For internal use only",
        "indications": "Vatavyadhi (all kind of vata vikaras), Chronic Inflammations",
        "description": "Potent botanical anti-inflammatory featuring Boswellia serrata, Guggulu, and Glucosamine for lasting joint mobility and cartilage support.",
        "image_url": "https://cdn.shopify.com/s/files/1/0705/1182/0938/files/346_INFLASAP_TABLET_50_NOS.jpg?v=1774855707"
    }
]


def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text).strip('-')
    return text


def main():
    with open("data/supabase_config.json") as f:
        cfg = json.load(f)
    supabase_url = cfg["url"]
    supabase_key = cfg["key"]

    print("1. Fetching current products from Supabase to prevent duplicates...")
    req = urllib.request.Request(
        f"{supabase_url}/rest/v1/products?select=id,code,name,category_name",
        headers={"apikey": supabase_key, "Authorization": f"Bearer {supabase_key}"}
    )
    with urllib.request.urlopen(req) as resp:
        existing_products = json.loads(resp.read().decode())

    print(f"Found {len(existing_products)} existing products in Supabase.")

    existing_names = {p["name"].strip().lower() for p in existing_products}
    existing_codes = {p.get("code") for p in existing_products if p.get("code")}

    # Calculate next ID and next code
    max_id = max([p["id"] for p in existing_products]) if existing_products else 0
    next_id = max_id + 1

    code_nums = []
    for c in existing_codes:
        m = re.search(r'SA-(\d+)', c or '')
        if m:
            code_nums.append(int(m.group(1)))
    next_code_num = max(code_nums) + 1 if code_nums else 42405

    to_insert = []
    for med in MEDICINES_BATCH_3:
        clean_name = med["name"].strip().lower()
        if clean_name in existing_names:
            print(f"[-] Skipping duplicate: {med['name']}")
            continue

        slug = slugify(med["name"])
        product_code = f"SA-{next_code_num:05d}"
        next_code_num += 1

        db_item = {
            "id": next_id,
            "code": product_code,
            "name": med["name"],
            "category_name": med["category_name"],
            "classical_reference": med.get("classical_reference", ""),
            "packings": med.get("packings", []),
            "ingredients": med.get("ingredients", []),
            "dosage": med.get("dosage", "As directed by the Ayurvedic physician."),
            "indications": med.get("indications", ""),
            "description": med.get("description", ""),
            "image_url": med["image_url"],
            "status": "Active",
            "featured": False,
            "public_slug": slug,
            "share_qr_link": f"https://ayur-guide-admin-panel.vercel.app/product/{slug}"
        }

        to_insert.append(db_item)
        existing_names.add(clean_name)
        next_id += 1

    print(f"\n2. Inserting {len(to_insert)} new non-duplicate medicines to Supabase...")
    inserted_count = 0

    batch_size = 10
    for i in range(0, len(to_insert), batch_size):
        chunk = to_insert[i:i + batch_size]
        post_data = json.dumps(chunk).encode("utf-8")
        post_req = urllib.request.Request(
            f"{supabase_url}/rest/v1/products",
            data=post_data,
            headers={
                "apikey": supabase_key,
                "Authorization": f"Bearer {supabase_key}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            method="POST"
        )
        try:
            with urllib.request.urlopen(post_req) as resp:
                result = json.loads(resp.read().decode())
                inserted_count += len(result)
                print(f"  ✓ Inserted batch {i//batch_size + 1}/{(len(to_insert)+batch_size-1)//batch_size} ({len(result)} items)")
        except Exception as e:
            print(f"  ✗ Batch insert error: {e}. Falling back to single item insert...")
            for item in chunk:
                single_bytes = json.dumps([item]).encode("utf-8")
                s_req = urllib.request.Request(
                    f"{supabase_url}/rest/v1/products",
                    data=single_bytes,
                    headers={
                        "apikey": supabase_key,
                        "Authorization": f"Bearer {supabase_key}",
                        "Content-Type": "application/json",
                        "Prefer": "return=representation"
                    },
                    method="POST"
                )
                try:
                    with urllib.request.urlopen(s_req) as s_resp:
                        inserted_count += 1
                        print(f"    ✓ Inserted single: {item['name']}")
                except Exception as ex:
                    print(f"    ✗ Failed single: {item['name']} - {ex}")
        time.sleep(0.1)

    print(f"\nSuccessfully inserted {inserted_count} new medicines into Supabase!")

    # 3. Synchronize data/sitaram_export.json backup
    export_path = "data/sitaram_export.json"
    if os.path.exists(export_path):
        try:
            with open(export_path, "r") as f:
                exp_data = json.load(f)

            fetch_all_req = urllib.request.Request(
                f"{supabase_url}/rest/v1/products?select=*&order=id.asc",
                headers={"apikey": supabase_key, "Authorization": f"Bearer {supabase_key}"}
            )
            with urllib.request.urlopen(fetch_all_req) as resp:
                fresh_products = json.loads(resp.read().decode())

            exp_data["products"] = fresh_products
            with open(export_path, "w", encoding="utf-8") as f:
                json.dump(exp_data, f, indent=2, ensure_ascii=False)
            print(f"Updated {export_path} with {len(fresh_products)} total products.")
        except Exception as e:
            print(f"Notice updating export file: {e}")


if __name__ == "__main__":
    main()
