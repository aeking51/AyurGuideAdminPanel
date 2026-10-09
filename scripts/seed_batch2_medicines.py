#!/usr/bin/env python3
"""
Seed medicines from Sitaram Ayurveda Therapeutic Index Hand Book (Pages 1-15, Batch 2)
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

MEDICINES_BATCH_2 = [
    # ==========================================
    # --- PAGE 1: GULIKA (29-40) ---
    # ==========================================
    {
        "name": "Siva gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Triphala", "Dasamoola", "Kantakari", "Haridra"],
        "usage": "Internal",
        "indications": "Polyuria and complication, For healthy mind and body, energy, alertness, masculine power, vitality",
        "description": "Prestigious Rasayana formulation supporting mental and physical vigor, metabolic resilience, and vitality."
    },
    {
        "name": "Sudarsanam Choornam tablets",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Triphala", "Haridra", "Mustha", "Kantakari"],
        "usage": "Internal",
        "indications": "Fever, Respiratory diseases, Cough, Anemia",
        "description": "Potent classical antipyretic formulation compressed into convenient tablets for acute and chronic fevers."
    },
    {
        "name": "Suryaprabha gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Sahasrayogam",
        "packings": ["100 Nos."],
        "ingredients": ["Rasa", "Gandhaka", "Hingu", "Triphala"],
        "usage": "Internal",
        "indications": "Cough, Respiratory diseases, Fever",
        "description": "Classical mineral-herb formulation addressing respiratory congestion, fever, and bronchial distress."
    },
    {
        "name": "Swasanandam gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Arogyakalpadrumam",
        "packings": ["100 Nos."],
        "ingredients": ["Hingula", "Vatsanabha", "Karpoora", "Triphala"],
        "usage": "Internal",
        "indications": "Cough, Weakness, Hiccups, Respiratory diseases",
        "description": "Potent bronchodilatory formulation for dyspnea, acute cough, and persistent hiccups."
    },
    {
        "name": "Swasanandam gulika tablets",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Arogyakalpadrumam",
        "packings": ["100 Nos."],
        "ingredients": ["Hingula", "Vatsanabha", "Karpoora", "Triphala"],
        "usage": "Internal",
        "indications": "Cough, Weakness, Hiccups, Respiratory diseases",
        "description": "Modern compressed tablet form of Swasanandam gulika for effortless pediatric and adult administration."
    },
    {
        "name": "Vayu gulika tablets",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Sahasrayogam",
        "packings": ["100 Nos."],
        "ingredients": ["Trijathaka", "Trikatu", "Triphala"],
        "usage": "Internal",
        "indications": "Deranged Vatha dosha, Hiccups, Abdominal distention",
        "description": "Rapid-acting carminative tablet relieving flatulence, abdominal bloating, hiccups, and gastric spasms."
    },
    {
        "name": "Vettumaran gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Sahasrayogam",
        "packings": ["100 Nos."],
        "ingredients": ["Tankana", "Maricha", "Vatsanabha", "Hingula", "Ajamoda"],
        "usage": "Internal",
        "indications": "Diarrhoea, Fever, Fever with eruptions",
        "description": "Emergency fever remedy pacifying Pitta-Kapha disorders, infectious fevers with rashes, and acute diarrhea."
    },
    {
        "name": "Vettumaran gulika tablets",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Sahasrayogam",
        "packings": ["100 Nos."],
        "ingredients": ["Tankana", "Maricha", "Vatsanabha", "Hingula", "Ajamoda"],
        "usage": "Internal",
        "indications": "Diarrhoea, Fever, Fever with eruptions",
        "description": "Precision tablet delivery of the classical Vettumaran formulation."
    },
    {
        "name": "Vilwadi gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Ashtangasamgraham",
        "packings": ["100 Nos."],
        "ingredients": ["Bilva", "Tulasi", "Natha", "Karanja"],
        "usage": "Internal",
        "indications": "Abdominal colic, Indigestion, Fever, Insect bites, Diarrhoea",
        "description": "Paramount anti-toxic (Vishaghna) and antimicrobial formulation for insect stings, food poisoning, and gut colic."
    },
    {
        "name": "Vilwadi gulika tablets",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Ashtangasamgraham",
        "packings": ["60 Nos."],
        "ingredients": ["Bilva", "Tulasi", "Natha", "Karanja"],
        "usage": "Internal",
        "indications": "Abdominal colic, Indigestion, Fever, Insect bites, Diarrhoea",
        "description": "Standardized modern tablet variation of classical Vilwadi gulika."
    },
    {
        "name": "Yogaraja guggulu gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Bhaisajya Ratnavali",
        "packings": ["100 Nos."],
        "ingredients": ["Chitraka", "Pippalimoola", "Yavani", "Karavi", "Vidanga"],
        "usage": "Internal",
        "indications": "Rheumatoid arthritis, Worm infestation, Ulcers, Splenic disorders, Chronic obstructive diseases, Ascites, Haemorrhoids",
        "description": "Celebrated anti-inflammatory guggulu formulation for deep musculoskeletal aches, Amavata, and joint stiffness."
    },
    {
        "name": "Yogaraja guggulu gulika tablets",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Bhaisajya Ratnavali",
        "packings": ["50 Nos."],
        "ingredients": ["Chitraka", "Pippalimoola", "Yavani", "Karavi", "Vidanga"],
        "usage": "Internal",
        "indications": "Rheumatoid arthritis, Worm infestation, Ulcers, Splenic disorders, Chronic obstructive diseases, Ascites, Haemorrhoids",
        "description": "Modern tablet dosage of Yogaraja Guggulu for ease of chronic arthritis therapy."
    },

    # ==========================================
    # --- PAGE 2: SINGLE HERB CAPSULES ---
    # ==========================================
    {
        "name": "Amla Capsules",
        "category_name": "Single Herb Vegan Capsules",
        "classical_reference": "Ayurveda proprietary medicine",
        "packings": ["60 nos."],
        "ingredients": ["Amalaki"],
        "usage": "1-2 Capsules twice daily",
        "indications": "Improves immunity, Enhances Iron absorption in the Gut.",
        "description": "Standardized Emblica officinalis fruit extract rich in natural Vitamin C and antioxidant polyphenols."
    },
    {
        "name": "Aswagandha Capsules",
        "category_name": "Single Herb Vegan Capsules",
        "classical_reference": "Ayurveda proprietary medicine",
        "packings": ["60 nos."],
        "ingredients": ["Aswagandha"],
        "usage": "1-2 Capsules twice daily",
        "indications": "Stress, Anxiety, Infertility, vigour",
        "description": "Pure Withania somnifera standardized adaptogenic extract enhancing neuroendocrine balance and endurance."
    },
    {
        "name": "Brahmi Capsules",
        "category_name": "Single Herb Vegan Capsules",
        "classical_reference": "Ayurveda proprietary medicine",
        "packings": ["60 nos."],
        "ingredients": ["Brahmi"],
        "usage": "1-2 Capsules twice daily",
        "indications": "Improves intellect, memory, cognition",
        "description": "Standardized Bacopa monnieri medhya extract for cognitive acuity, memory retention, and mental calmness."
    },
    {
        "name": "Gokshura Capsules",
        "category_name": "Single Herb Vegan Capsules",
        "classical_reference": "Ayurveda proprietary medicine",
        "packings": ["60 nos."],
        "ingredients": ["Gokshura"],
        "usage": "1-2 Capsules twice daily",
        "indications": "Diuretic, Improve Renal Function",
        "description": "Tribulus terrestris extract supporting urinary tract health, renal filtration, and vitality."
    },
    {
        "name": "Gulgulu Capsules",
        "category_name": "Single Herb Vegan Capsules",
        "classical_reference": "Ayurveda proprietary medicine",
        "packings": ["60 nos."],
        "ingredients": ["Gulgulu"],
        "usage": "1-2 Capsules twice daily",
        "indications": "Relieves pain, Inflammation, Has anti cholesterol action",
        "description": "Purified Commiphora mukul oleoresin promoting joint comfort and healthy lipid metabolism."
    },
    {
        "name": "Kapikachu Capsules",
        "category_name": "Single Herb Vegan Capsules",
        "classical_reference": "Ayurveda proprietary medicine",
        "packings": ["60 nos."],
        "ingredients": ["Kapikachu"],
        "usage": "1-2 Capsules twice daily",
        "indications": "Boost sperm count & motility, Improves ovarian health & stimulates ovulation.",
        "description": "Mucuna pruriens L-DOPA rich extract bolstering reproductive health, dopamine synthesis, and motor coordination."
    },
    {
        "name": "Shallaki Capsules",
        "category_name": "Single Herb Vegan Capsules",
        "classical_reference": "Ayurveda proprietary medicine",
        "packings": ["60 nos."],
        "ingredients": ["Shallaki"],
        "usage": "1-2 Capsules twice daily",
        "indications": "Relieves pain & inflammatory swelling, Heals & strengthens Degenerative joints",
        "description": "Boswellia serrata gum resin containing boswellic acids for osteoarthritis and chronic joint flexibility."
    },
    {
        "name": "Shatavari Capsules",
        "category_name": "Single Herb Vegan Capsules",
        "classical_reference": "Ayurveda proprietary medicine",
        "packings": ["60 nos."],
        "ingredients": ["Shatavari"],
        "usage": "1-2 Capsules twice daily",
        "indications": "Excellent remedy for increasing breast milk, Disorders of digestive tract, Gulma Sprue syndrome, Bleeding disorders, Diseases with raktha dathu vitiation",
        "description": "Asparagus racemosus root extract nourishing female hormonal health, lactation, and mucosal gut lining."
    },
    {
        "name": "Tagara Capsules",
        "category_name": "Single Herb Vegan Capsules",
        "classical_reference": "Ayurveda proprietary medicine",
        "packings": ["60 nos."],
        "ingredients": ["Tagara"],
        "usage": "1-2 Capsules twice daily",
        "indications": "Relieves Insomnia, Employed in Stress & anxiety",
        "description": "Valeriana wallichii natural sedative extract facilitating deep restorative sleep without morning grogginess."
    },
    {
        "name": "Triphala Capsules",
        "category_name": "Single Herb Vegan Capsules",
        "classical_reference": "Ayurveda proprietary medicine",
        "packings": ["60 nos."],
        "ingredients": ["Harithaki", "Vibhithaki", "Amalaki"],
        "usage": "1-2 Capsules twice daily",
        "indications": "Enhances vitality, Good for eyes, Relieves constipation",
        "description": "Gentle daily digestive detoxifier and ocular health enhancer in convenient vegetarian capsules."
    },

    # ==========================================
    # --- PAGES 3-9: KASHAYAM (LIQUIDS) ---
    # ==========================================
    {
        "name": "Amruthotharam kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Nagara", "Amrutha", "Harithaki"],
        "usage": "Internal (10-15 ml diluted with 40-60 ml boiled warm water)",
        "indications": "Fever, Uvulitis, Tonsilitis, Rhinitis, Sinusitis",
        "description": "Celebrated classical tri-herb antipyretic decoction addressing viral fevers, tonsillitis, and early inflammatory stages."
    },
    {
        "name": "Aragwadhadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["200ml"],
        "ingredients": ["Aragwadha", "Kutajabija", "Patala", "Kakatikta"],
        "usage": "Internal",
        "indications": "Vomiting, Skin disease, Fever, Kapha predominant diseases, Itching, Ulcer, Diabetic carbuncles",
        "description": "Potent dermatological and metabolic decoction for pruritus, skin eruptions, diabetic sores, and chronic wounds."
    },
    {
        "name": "Ardhavilwam kashayam (chukkuchundadi kashayam)",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Shunti", "Bruhati", "Apamarga", "Dhanvayasa", "Punarnava"],
        "usage": "Internal",
        "indications": "Oedema, Diuretic, Constipation",
        "description": "Effective herbal diuretic stimulating renal drainage, relieving generalized water retention and constipation."
    },
    {
        "name": "Ashtavargam kashayam (balasahacharadi kashayam)",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Bala", "Sahachara", "Eranda", "Sunti", "Rasna"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Dyslipidemia",
        "description": "Revered formulation for neuro-muscular conditions, sciatica, facial palsy, and hyperlipidemia."
    },
    {
        "name": "Bhadradarvadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["200ml"],
        "ingredients": ["Bhadradaru", "Natha", "Kushta", "Dasamoola", "Atibala"],
        "usage": "Internal",
        "indications": "Pacifies Vatha dosha, Respiratory diseases, Cough, Hiccups",
        "description": "Warm Vata-pacifying decoction effective in chronic cough, hiccups, and lower back disorders."
    },
    {
        "name": "Balagooloochyadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Bala", "Guduchi", "Devadaru"],
        "usage": "Internal",
        "indications": "Burning sensation, Oedema and pain in Gout",
        "description": "Prime formulation for Vatarakta (Gouty arthritis), burning extremities, and hyperuricemia."
    },
    {
        "name": "Balajeerakadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Bala", "Jeeraka", "Mustha", "Bilva", "Vasa"],
        "usage": "Internal",
        "indications": "Respiratory diseases, Cough",
        "description": "Nourishing respiratory tonic particularly suited for pediatric and geriatric bronchial asthma and cough."
    },
    {
        "name": "Balapunarnavadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Bala", "Punarnava", "Eranda", "Bruhati", "Kantakari"],
        "usage": "Internal",
        "indications": "Pain in Vatha predominant diseases, Oedema, Gout.",
        "description": "Anti-inflammatory diuretic decoction addressing painful swelling, inflammatory arthritis, and edema."
    },
    {
        "name": "Bruhathyadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["200ml"],
        "ingredients": ["Bruhati", "Kantakari", "Prisniparni", "Salaparni", "Gokshura"],
        "usage": "Internal",
        "indications": "Urinary tract disorders, Urinary tract infections.",
        "description": "Classical urinary antiseptic and lithotriptic decoction soothing burning micturition and dysuria."
    },
    {
        "name": "Bruhathkatphaladi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Bhaisajya Ratnavali",
        "packings": ["200ml"],
        "ingredients": ["Katphala", "Musta", "Vacha", "Patha", "Pushkaramoola"],
        "usage": "Internal",
        "indications": "Diseases of throat, Hoarseness of voice, Oedema in ear infection, Diseases of Nose, Throat, Salivary glands, Mouth, Kapha and Vatha predominant fever and, Diseases of head",
        "description": "Comprehensive ENT formulation addressing laryngitis, pharyngitis, mumps, and upper airway edema."
    },
    {
        "name": "Cheriya rasnadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Rasna", "Eranda", "Bala", "Sahachara"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Pain in Calf region, thighs, Sacral region, Lumbar region, Flanks, Oedema in Gout",
        "description": "Targeted musculoskeletal decoction relieving calf cramps, lumbar ache, and sciatica."
    },
    {
        "name": "Chiruvilwadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Chiruvilwa", "Punarnava", "Chitraka", "Harithaki"],
        "usage": "Internal",
        "indications": "Haemorrhoids, Fistula in ano, Chronic obstructive diseases, Loss of appetite, Constipation.",
        "description": "Pre-eminent anorectal and digestive medicine enhancing venous tone in piles and fistula-in-ano."
    },
    {
        "name": "Chitrakagranthikadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Chitraka", "Granthika", "Eranda", "Sunti"],
        "usage": "Internal",
        "indications": "Abdominal colic, Distension, Constipation",
        "description": "Potent Deepana-Pachana decoction clearing severe abdominal colic and chronic constipation."
    },
    {
        "name": "Chuvannaratha kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Rasna", "Eranda", "Bala", "Sahachara", "Dusparsha"],
        "usage": "Internal",
        "indications": "Pain in Vatha predominant diseases, Pain in Calf region Thigh, Sacral region, Lumbar region, Flanks, Oedema in Gout",
        "description": "Classical formulation targeting neural and connective tissue inflammation in lower limbs."
    },
    {
        "name": "Chyavanaprasam kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["200ml"],
        "ingredients": ["Dasamoola", "Meda", "Dwikakoli", "Thamalaki", "Ela"],
        "usage": "Internal",
        "indications": "Polyuria, Dementia, Weakness.",
        "description": "Aqueous decoction version of the classical Chyavanaprasha herbs supporting cognitive stamina and vitality."
    },
    {
        "name": "Dasamoolakatuthrayam kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Dasamoola", "Trikatu", "Vasa"],
        "usage": "Internal",
        "indications": "Respiratory diseases, Cough, Pain on flanks, Pain on sacral region, Pain on lumbar region, Pain on head, Fever",
        "description": "Renowned respiratory decongestant relieving pleuritic flank pain, chest tightness, and chronic productive cough."
    },
    {
        "name": "Dasamoolam kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Dasamoola"],
        "usage": "Internal",
        "indications": "Pain on flanks, Fever, Respiratory diseases, Kapha predominant cough, Vatha predominant diseases, Myalgia",
        "description": "The ten sacred roots decoction stabilizing systemic Vata, body ache, fever, and postpartum weakness."
    },
    {
        "name": "Dhanadanayanadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Dhanadanayana", "Sunti", "Shigru", "Rasna", "Vacha"],
        "usage": "Internal",
        "indications": "Facial palsy, Vatha predominant diseases, Tremors",
        "description": "Specialized neuro-rehabilitative decoction indicated for Bell's palsy, involuntary tremors, and hemiplegia."
    },
    {
        "name": "Dhanwantharam kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Bala", "Dasamoola", "Yava", "Kola", "Kulatha"],
        "usage": "Internal",
        "indications": "Gout, Fever, Chronic obstructive diseases, Anuria, Facial palsy, Opisthotonos, Post-natal care, Traumatic injuries",
        "description": "Master neuro-protective and postnatal tonic repairing tissue injuries, nerve damage, and musculoskeletal trauma."
    },
    {
        "name": "Dhanyamlam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["450ml", "2L", "5L"],
        "ingredients": ["Unakkalari", "Aval", "Muthira"],
        "usage": "External (Dhara / Parisheka)",
        "indications": "Rheumatoid arthritis, Inflammatory joint disorders, Sprains, Neurological conditions",
        "description": "Fermented medicated cereal wash extensively utilized in external stream pouring (Dhanyamla Dhara) for acute inflammatory arthritis."
    },
    {
        "name": "Drakshadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Draksha", "Madhuka", "Yashtimadhu", "Lodhra"],
        "usage": "Internal",
        "indications": "Fever, Alcohol intoxication, Vomiting, Dizziness, Burning sensation, Weakness, Bleeding disorders, Polydipsia, Jaundice",
        "description": "Cooling Pitta-pacifying hepatoprotective decoction for hangovers, liver dysfunction, vertigo, and burning sensations."
    },
    {
        "name": "Dusparsakadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Dusparsaka", "Yavani", "Bilwa", "Nagara", "Patha"],
        "usage": "Internal",
        "indications": "Haemorrhoids, Constipation, Diseases with vitiated apana vatha",
        "description": "Relieves painful hemorrhoids and anal fissures by regulating Apana Vata and softening bowels."
    },
    {
        "name": "Elakanadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Ela", "Kana", "Madhuka", "Nagara", "Mustha"],
        "usage": "Internal",
        "indications": "Tuberculosis, Respiratory diseases",
        "description": "Deeply restorative pulmonary decoction for chronic debility, wasting diseases, and chronic bronchitis."
    },
    {
        "name": "Gandharvahasthadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Gandharvahastha", "Chiruvilwa", "Chitraka", "Sunti"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, loss of appetite, Anorexia, Constipation",
        "description": "Gentle daily bowel regulator and digestive stimulant containing castor root and ginger."
    },
    {
        "name": "Guloochyadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Guduchi", "Nimba", "Danyaka", "Padmaka", "Raktachandhana"],
        "usage": "Internal",
        "indications": "Fever, Nausea, Anorexia, Vomiting, Polydipsia, Burning sensation",
        "description": "Pure Pitta-pacifying febrifuge alleviating unquenchable thirst, heartburn, nausea, and bilious fevers."
    },
    {
        "name": "Gulguluthikthakam kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Nimba", "Amrutha", "Vasa", "Patola", "Nidigdhika"],
        "usage": "Internal",
        "indications": "Skin diseases, Sinus ulcers, Tumour, Fistula in ano, Diseases of throat, Chronic obstructive diseases, Polyuria, Anorexia, Respiratory diseases",
        "description": "Profound systemic blood cleanser and bone-joint healer for psoriasis, fistulae, and chronic deep-seated ulcers."
    },
    {
        "name": "Indukantham kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Poothika", "Devadaru", "Dasamoola", "Panchakola"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Fatigue, Polyuria, Ascites, Chronic obstructive diseases, Abdominal colic, Recurrent fever, Emaciation",
        "description": "Classical gastro-protective and immunity-enhancing decoction restoring digestive fire and physical vitality."
    },
    {
        "name": "Kaidaryadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Sunti", "Kaidarya", "Patola", "Pathya"],
        "usage": "Internal",
        "indications": "Indigestion, Malabsorbtion syndrome, Constipation",
        "description": "Digestive astringent decoction indicated for sprue, IBS, food malabsorption, and erratic bowels."
    },
    {
        "name": "Kalyanakam kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["200ml"],
        "ingredients": ["Triphala", "Vishala", "Badra Ela", "Devadaru"],
        "usage": "Internal",
        "indications": "Exogeneous psychosis, Epilepsy, Cough, Aneamia, Itching, Manifestation of poison, Oedema etc.",
        "description": "Neuro-psychiatric therapeutic decoction indicated in mental fog, anxiety disorders, and detox."
    },
    {
        "name": "Kanasathahwadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Kana", "Shatahva", "Karanja", "Poothi Karanja"],
        "usage": "Internal",
        "indications": "Chronic obstructive diseases, Uterine fibroids, Ovarian cyst, Amenorrhea",
        "description": "Specialized gynecological formulation stimulating ovarian function, clearing uterine cysts and secondary amenorrhea."
    },
    {
        "name": "Karimpirumbadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Sunti", "Maricha", "Pippali", "Ajamoda", "Punarnava"],
        "usage": "Internal",
        "indications": "Aneamia",
        "description": "Hematinic botanical decoction optimizing iron assimilation and liver function in Pandu (anemia)."
    },
    {
        "name": "Kathakakhadiradi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Kathaka", "Khadira", "Dhatri", "Sapthachakra", "Darvi"],
        "usage": "Internal",
        "indications": "Polyuria, Prameha (Diabetes mellitus)",
        "description": "Premier anti-diabetic formulation mitigating glycemic fluctuations, polyuria, and peripheral neuropathy."
    },
    {
        "name": "Kokilaksham kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Kokilaksha", "Guduchi"],
        "usage": "Internal",
        "indications": "Gout, Hyperuricemia",
        "description": "Targeted Asteracantha longifolia formulation actively reducing serum uric acid levels and joint inflammation."
    },
    {
        "name": "Maha manjishtadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Manjishta", "Mustha", "Kutajabija", "Guduchi", "Kushta"],
        "usage": "Internal",
        "indications": "All 18 types of skin diseases, Gout, Facial palsy, Hemiplegia, Filariasis, Soft chancre, Diseases due to vitiation of Medo Dathu, Ophthalmic diseases",
        "description": "Comprehensive 50-herb blood purifier addressing severe dermatological conditions, eczema, and psoriasis."
    },
    {
        "name": "Mahathikthakam kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Sapthachada", "Parpataka", "Shyamaka", "Katuka"],
        "usage": "Internal",
        "indications": "Skin diseases, Eczema, Anaemia, Bleeding disorders, Haemorrhoids, Gout, Blisters, Carbuncles, Burning sensation, Excessive thirst etc.",
        "description": "High-potency bitter formulation clearing deep hepatic toxins, inflammatory dermatoses, and bleeding disorders."
    },
    {
        "name": "Manjishtadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Manjishta", "Triphala", "Tiktha", "Vacha", "Devadaru"],
        "usage": "Internal",
        "indications": "Gout, Eczema, Skin diseases, Erythematous lesions, Urticaria.",
        "description": "Standardized Manjishta decoction purifying blood and relieving urticarial rashes."
    },
    {
        "name": "Musaleekhadiradi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Musali", "Khadira", "Amalaki", "Gokshura", "Jambu", "Sathavari"],
        "usage": "Internal",
        "indications": "Excessive vaginal discharge, Leucorrhoea, Menorrhagia",
        "description": "Specific astringent and rejuvenating formula for chronic leucorrhea and uterine weakness."
    },
    {
        "name": "Nadi kashayam (marma nadi kashayam)",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Dasamoola", "Triphala", "Bala", "Yavasa", "Maricha"],
        "usage": "Internal",
        "indications": "Diseases due to nadi vaikalya, Respiratory diseases, Cough, Post-natal care, Joint diseases",
        "description": "Trauma-recovery and nervous-vitality decoction relieving sports injuries, fractures, and post-partum pain."
    },
    {
        "name": "Nayopayam kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Bala", "Jeeraka", "Sunti"],
        "usage": "Internal",
        "indications": "Respiratory diseases, Hiccups, Cough",
        "description": "Classic three-ingredient spasmolytic decoction for intractable hiccups and bronchial asthma."
    },
    {
        "name": "Neelithulasyadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Ayurveda proprietary medicine",
        "packings": ["200ml"],
        "ingredients": ["Neeli", "Thulasi", "Nirgundi", "Lashuna", "Sunti"],
        "usage": "Internal",
        "indications": "Insect bites, Chronic skin diseases, Allergic Skin diseases.",
        "description": "Anti-allergic and insect bite antidote decoction resolving chronic contact dermatitis and skin allergies."
    },
    {
        "name": "Nimbadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Nimba", "Amrutha", "Rajani", "Sunti", "Vasa"],
        "usage": "Internal",
        "indications": "Abscess, Skin diseases, Ulcers",
        "description": "Neem-based antibacterial and wound-cleansing decoction indicated for boils, furuncles, and carbuncles."
    },
    {
        "name": "Nisakathakadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Nisa", "Kathaka", "Nellika", "Thechi", "Lodhra"],
        "usage": "Internal",
        "indications": "Polyuria, Diabetes mellitus, Glycosuria",
        "description": "Renowned metabolic decoction for stabilizing sugar levels and preventing secondary diabetic microvascular complications."
    },
    {
        "name": "Nisothamadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["200ml"],
        "ingredients": ["Nisa", "Triphala", "Nimba", "Patola", "Katuki"],
        "usage": "Internal",
        "indications": "Kapha and pitha predominant Skin diseases",
        "description": "Effective herbal formula for weeping eczema, fungal skin conditions, and psoriasis."
    },
    {
        "name": "Pathyakshadhadhryadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sarangadhara Samhitha",
        "packings": ["200ml"],
        "ingredients": ["Triphala", "Kiratatiktha", "Haridra", "Nimba", "Guduchi"],
        "usage": "Internal",
        "indications": "All types of Head ache, Pain over forehead, temporal region, Migraine, Tooth ache, Night blindness",
        "description": "Sovereign remedy for vascular migraine, cluster headaches, sinusitis, and temporal pain."
    },
    {
        "name": "Patoladi kashayam (patolakaturohinyadi kashayam)",
        "category_name": "Kashayams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["200ml"],
        "ingredients": ["Patola", "Katukarohini", "Chandana", "Madhusrava", "Guduchi", "Patha"],
        "usage": "Internal",
        "indications": "Kapha and Pitha predominant skin diseases, Fever, Poisoning, Anorexia, Jaundice, Skin diseases like eczema, psoriasis, allergic skin diseases, dermatitis, acne, & Vomiting",
        "description": "Deep hepatic regulator clearing cystic acne, facial dermatitis, jaundice, and toxic blood heat."
    },
    {
        "name": "Patolamooladi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["200ml"],
        "ingredients": ["Patola", "Triphala", "Vishala", "Trayamana"],
        "usage": "Internal",
        "indications": "Skin diseases, Sprue syndrome, Haemorrhoids, Jaundice, Fever",
        "description": "Digestive-cleansing febrifuge and laxative for malabsorption, hemorrhoids, and skin lesions."
    },
    {
        "name": "Prasaranyadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Prasarani", "Masha", "Bala", "Rasona"],
        "usage": "Internal",
        "indications": "Diseases of vatha, Pain on shoulder joint, Stiffness (Frozen Shoulder)",
        "description": "Specific formulation for adhesive capsulitis (Frozen Shoulder), neck stiffness, and brachial neuralgia."
    },
    {
        "name": "Punarnavadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Punarnava", "Nimba", "Patola", "Sunti", "Tiktha"],
        "usage": "Internal",
        "indications": "General oedema, Fever, Cough, Respiratory diseases, Anemia",
        "description": "Standard diuretic and cardiorenal tonic removing systemic edema, ascites, and puffy face."
    },
    {
        "name": "Rasnadasamoolam kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Chakradatta",
        "packings": ["200ml"],
        "ingredients": ["Dasamoola", "Eranda", "Guduchi", "Rasna"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Joint disorders",
        "description": "Potent joint mobility decoction for osteoarthritis, chronic lumbo-sacral strain, and stiffness."
    },
    {
        "name": "Rasnadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Rasna", "Eranda", "Bala", "Sahachara", "Sathavari"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Pain on calf region, Knee joint pain, Pain on lumbar region, Oedema in gout",
        "description": "Classical anti-arthritic decoction relieving joint effusion, knee pain, and calf muscle stiffness."
    },
    {
        "name": "Rasnapanchakam kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Rasna", "Guduchi", "Eranda", "Devadaru", "Sunti"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases associated with joints",
        "description": "Essential five-herb decoction resolving acute rheumatic inflammatory episodes and joint stiffness."
    },
    {
        "name": "Rasnasapthakam kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Rasna", "Amrutha", "Aragwadha", "Devadaru", "Gokshura"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Pain on calf region, Knee joint pain, Pain on lumbar region, Pain on sacral region, Pain on flanks",
        "description": "Comprehensive seven-herb analgesic decoction addressing ankylosing spondylitis and lumbago."
    },
    {
        "name": "Rasnsuntyadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Rasna", "Sunti", "Guluchi", "Sahachara", "Mustha"],
        "usage": "Internal",
        "indications": "Neck stiffness, Hernia, Fever, Carbuncles",
        "description": "Relieves cervical spondylosis, neck spasm, feverish joint pain, and inguinal discomfort."
    },
    {
        "name": "Rasnathamalakyadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Rasna", "Thamalaki", "Vasa", "Agaru", "Shati"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Pain and oedema in Musculo Skeletal Diseases",
        "description": "Anti-inflammatory botanical synergy mitigating joint effusion and soft-tissue swellings."
    },
    {
        "name": "Rasnairandadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Rasna", "Eranda", "Bala", "Sahachara", "Sathavari"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Pain in Calf region, Thigh, Sacral region, Lumbar region, Flanks, Oedema in gout",
        "description": "Premier medicine for low back ache, sciatica, degenerative disk disorders, and gout."
    },
    {
        "name": "Rasonadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Rasona", "Pippali", "Krishna Jeeraka", "Prsniparni"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Hyper cholesterolemia, Dislipidemia",
        "description": "Garlic-centered cardiovascular tonic reducing high cholesterol, arterial stiffness, and digestive Vata."
    },
    {
        "name": "Sahacharabaladi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Sahachara", "Nagara", "Devadaru", "Bala"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Pain on lumbar region",
        "description": "Restorative neuro-muscular tonic for disc prolapse, numbness, and lumbar spine stiffness."
    },
    {
        "name": "Sahacharadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Sahachara", "Nagara", "Devadaru"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Varicosity, Pain on lumbar region",
        "description": "Sovereign remedy for varicose veins, peripheral neuropathies, and lumbar spondylosis."
    },
    {
        "name": "Sapthasaram kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Punarnava", "Bilva", "Kulatha", "Eranda", "Sahachara"],
        "usage": "Internal",
        "indications": "Constipation, Loss of appetite, Splenic disorders, Chronic obstructive Diseases, Dysmenorrhea, Abdominal pain",
        "description": "High-impact formulation for dysmenorrhea, pelvic pain, ovarian congestion, and constipation."
    },
    {
        "name": "Shaddharanam kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["200ml"],
        "ingredients": ["Pata", "Darvi", "Chitraka", "Ativisha", "Katuka"],
        "usage": "Internal",
        "indications": "Skin diseases, Heamorrhoids, Polyuria, Oedema, Anaemia, Indigestion, Worm Infestation, Rheumatic disorders",
        "description": "Powerful metabolic detoxifier burning deep Ama, improving assimilation, and resolving skin and piles issues."
    },
    {
        "name": "Sitaram musthadi marma kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Ayurveda proprietary medicine",
        "packings": ["200ml"],
        "ingredients": ["Mustha", "Bala", "Vilwa", "Rasna", "Lonika"],
        "usage": "Internal",
        "indications": "Injury, Traumatic pain, Soft tissue swelling, Bone fractures",
        "description": "Proprietary tissue healer expediting bone reunion, hematoma reabsorption, and trauma recovery."
    },
    {
        "name": "Sukumaram kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Punarnava", "Dasamoola", "Vidari", "Aswagandha"],
        "usage": "Internal",
        "indications": "Hernia, Abscess, Chronic obstructive diseases, Haemorrhoids, Oedema, Ascitis, Splenic disorders, Constipation, Gynecological disorders",
        "description": "Gentle gynecological and digestive rejuvenator for uterine fibroids, PCOS, hernia, and constipation."
    },
    {
        "name": "Thikthakam kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Patola", "Nimba", "Katuka", "Darvi", "Patha", "Duralabha"],
        "usage": "Internal",
        "indications": "Inflammatory skin diseases, Polydipsia, Anxiety, Anemia, Pilonidal Sinus, Skin eruptions, Abscess, Chronic obstructive diseases",
        "description": "Bitter blood-cleansing decoction indicated in pilonidal sinus, eczema, psycho-somatic Pitta states."
    },
    {
        "name": "Thrayanthyadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["200ml"],
        "ingredients": ["Thrayanthi", "Triphala", "Nimba", "Katuka", "Yashtimadhu"],
        "usage": "Internal",
        "indications": "Abscess, Chronic obstructive diseases, Burning sensation, Delusions, Fever, Polydipsia, Vomiting, Heart diseases, Skin diseases",
        "description": "Purifying Pitta-clearing formulation indicated in internal abscesses, hepatobiliary inflammation, and delirium."
    },
    {
        "name": "Ullivettadukadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Lashuna", "Kuberaksha", "Karnasphota", "Eranda", "Sunti"],
        "usage": "Internal",
        "indications": "Conditions like hernia, Abdominal disorders, Diuretic",
        "description": "Traditional garlic decoction used in inguinal hernia, intestinal gas, and lower abdominal pain."
    },
    {
        "name": "Varadi kashayam (varasanadi kashayam)",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Triphala", "Chitraka", "Haridra", "Asana", "Lohapathra"],
        "usage": "Internal",
        "indications": "Obesity, Dyslipidemia, Lipoma",
        "description": "Celebrated anti-obesity and lipid-lowering decoction melting excess adipose tissue and clearing fatty liver."
    },
    {
        "name": "Varanadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["200ml"],
        "ingredients": ["Varana", "Saireyaka", "Sathavari", "Chitraka"],
        "usage": "Internal",
        "indications": "Kapha predominant diseases, Dyslipidemia, Obesity, Loss of appetite, Headache",
        "description": "Standard formulation for Kapha-Medas disorders, central obesity, benign tumors, and internal abscesses."
    },
    {
        "name": "Vasaguloochyadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Vasa", "Guduchi", "Triphala", "Nimba"],
        "usage": "Internal",
        "indications": "Anemia, Bleeding disorders, Jaundice",
        "description": "Liver tonic and hemostatic decoction for infective hepatitis, bleeding tendencies, and jaundice."
    },
    {
        "name": "Vasthyamayanthakam kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Darvi", "Matsyakshi", "Madhuka", "Padma", "Pashanabheda"],
        "usage": "Internal",
        "indications": "Dysuria, Renal calculi, Polyuria, Diseases of urinary bladder, Neurogenic bladder, Benign Prostatic Hyperplasia",
        "description": "Specific urinary tract and prostate formulation for BPH, neurogenic bladder, and kidney gravel."
    },
    {
        "name": "Veeratharadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["200ml"],
        "ingredients": ["Ushira", "Aranika", "Buka", "Vasa", "Ashmabhedha"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Renal calculi, Dysuria",
        "description": "Prime lithotriptic formula disintegrating renal and bladder stones while soothing painful micturition."
    },
    {
        "name": "Vidyaryadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["200ml"],
        "ingredients": ["Vidari", "Eranda", "Vrischikali", "Devadaru"],
        "usage": "Internal",
        "indications": "Emaciation, Chronic obstructive diseases, Myalgia, Respiratory diseases, Cough",
        "description": "Nourishing, strength-promoting Vata-pacifying decoction for post-illness emaciation and muscle wasting."
    },
    {
        "name": "Vyoshadi kashayam",
        "category_name": "Kashayams",
        "classical_reference": "Sahasrayogam",
        "packings": ["200ml"],
        "ingredients": ["Trikatu", "Ajamoda", "Punarnava", "Ikshu", "Loha"],
        "usage": "Internal",
        "indications": "Anemia, Chronic indigestion",
        "description": "Iron-enhancing stimulant formulation boosting hemoglobin levels and clearing liver stagnation."
    },

    # ==========================================
    # --- PAGES 9-13: KASHAYAM TABLETS ---
    # ==========================================
    {
        "name": "Amruthotharam kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Nagara", "Amrutha", "Harithaki"],
        "usage": "Internal (1-2 tablets twice daily with warm water)",
        "indications": "Fever, Uvulitis, Tonsilitis, Rhinitis, Sinusitis",
        "description": "Convenient tablet form of Amruthotharam decoction for acute respiratory infections and fevers."
    },
    {
        "name": "Ashtavargam kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Bala", "Sahachara", "Eranda", "Sunti", "Rasna"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Dyslipidemia",
        "description": "Modern compressed tablet form of Ashtavargam kashayam for rheumatoid and neurological ailments."
    },
    {
        "name": "Balagooloochyadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Bala", "Guduchi", "Devadaru"],
        "usage": "Internal",
        "indications": "Burning sensation, Oedema and pain in Gout",
        "description": "Concentrated tablet for hyperuricemia, gouty joint pain, and burning sensation."
    },
    {
        "name": "Bruhathyadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 Nos."],
        "ingredients": ["Bruhati", "Kantakari", "Prisniparni", "Salaparni", "Gokshura"],
        "usage": "Internal",
        "indications": "Urinary tract disorders, Urinary tract infections",
        "description": "Tablet dosage for recurrent UTI, burning micturition, and kidney gravel."
    },
    {
        "name": "Chiruvilwadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Chiruvilwa", "Punarnava", "Chitraka", "Harithaki"],
        "usage": "Internal",
        "indications": "Haemorrhoids, Fistula in ano, Chronic obstructive diseases, Loss of appetite, Constipation",
        "description": "Standardized extract tablet targeting piles, fistulae, and sluggish bowels."
    },
    {
        "name": "Chyavanaprasam kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["60 Nos."],
        "ingredients": ["Dasamoola", "Meda", "Dwikakoli", "Thamalaki", "Ela"],
        "usage": "Internal",
        "indications": "Polyuria, Dementia, Weakness",
        "description": "Rejuvenating poly-herbal tablet supporting cognitive clarity, stamina, and respiratory health."
    },
    {
        "name": "Dasamoolakatuthrayam kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Dasamoola", "Trikatu", "Vasa"],
        "usage": "Internal",
        "indications": "Respiratory diseases, Cough, Pain on flanks, Pain on sacral region, Pain on lumbar region, Pain on head, Fever",
        "description": "Effective bronchodilatory tablet addressing productive cough, pleurisy, and headaches."
    },
    {
        "name": "Dasamoolam kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Dasamoola"],
        "usage": "Internal",
        "indications": "Pain on flanks, Fever, Respiratory diseases, Kapha predominant cough, Vatha predominant diseases, Myalgia",
        "description": "Classical ten roots extract tablet pacifying severe Vata disorders and muscle aches."
    },
    {
        "name": "Dhanwantharam kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Bala", "Dasamoola", "Yava", "Kola", "Kulatha"],
        "usage": "Internal",
        "indications": "Gout, Fever, Chronic obstructive diseases, Anuria, Facial palsy, Opisthotonos, Post-natal care, Traumatic injuries",
        "description": "Convenient tablet form of the premier neuro-muscular tonic Dhanwantharam."
    },
    {
        "name": "Drakshadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Draksha", "Madhuka", "Yashtimadhu", "Lodhra"],
        "usage": "Internal",
        "indications": "Fever, Alcohol intoxication, Vomiting, Dizziness, Burning sensation, Weakness, Bleeding disorders, Polydipsia, Jaundice",
        "description": "Pitta-cooling tablet relieving acidity, liver fatigue, hangovers, and heat sensations."
    },
    {
        "name": "Gandharvahasthadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Gandharvahastha", "Chiruvilwa", "Chitraka", "Sunti"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, loss of appetite, Anorexia, Constipation",
        "description": "Gentle daily laxative tablet improving digestion and relieving abdominal flatulence."
    },
    {
        "name": "Guloochyadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Guduchi", "Nimba", "Danyaka", "Padmaka", "Raktachandhana"],
        "usage": "Internal",
        "indications": "Fever, Nausea, Anorexia, Vomiting, Polydipsia, Burning sensation",
        "description": "Herbal antipyretic tablet soothing acute bilious fevers and nausea."
    },
    {
        "name": "Gulguluthikthakam kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Nimba", "Amrutha", "Vasa", "Patola", "Nidigdhika"],
        "usage": "Internal",
        "indications": "Skin diseases, Sinus ulcers, Tumour, Fistula in ano, Diseases of throat, Chronic obstructive diseases, Polyuria, Anorexia, Respiratory diseases",
        "description": "Deep metabolic and skin-purifying tablet for chronic dermatitis and arthritis."
    },
    {
        "name": "Indukantham kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Poothika", "Devadaru", "Dasamoola", "Panchakola"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Fatigue, Polyuria, Ascites, Chronic obstructive diseases, Abdominal colic, Recurrent fever, Emaciation",
        "description": "Immunity and gut-restoring tablet relieving chronic recurrent fevers and abdominal spasms."
    },
    {
        "name": "Kathakakhadiradi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Kathaka", "Khadira", "Dhatri", "Sapthachakra", "Darvi"],
        "usage": "Internal",
        "indications": "Polyuria, Prameha",
        "description": "Anti-diabetic tablet for sustained blood sugar regulation and preventing metabolic complications."
    },
    {
        "name": "Kokilaksham kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Kokilaksha", "Guduchi"],
        "usage": "Internal",
        "indications": "Gout, Hyperuricemia",
        "description": "Standardized uric acid clearing tablet for gouty arthritis."
    },
    {
        "name": "Maha manjishtadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Manjishta", "Mustha", "Kutajabija", "Guduchi", "Kushta"],
        "usage": "Internal",
        "indications": "All 18 types of skin diseases, Gout, Facial palsy, Hemiplegia, Filariasis, Soft chancre, Diseases due to vitiation of Medo Dathu, Ophthalmic diseases",
        "description": "Potent blood-purifier tablet indicated in stubborn eczema, boils, and chronic dermatitis."
    },
    {
        "name": "Maharasnadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Rasna", "Dhanvaysava", "Bala", "Eranda", "Devadaru"],
        "usage": "Internal",
        "indications": "Tremors, Hemiplegia, Frozen shoulder, Sciatica, Internal abscess, Abdominal distension, Facial palsy, Diseases of male genital organs",
        "description": "Master neuro-muscular formulation tablet for sciatica, stroke rehab, and lumbar spinal pain."
    },
    {
        "name": "Mahathikthakam kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Sapthachada", "Parpataka", "Shyamaka", "Katuka"],
        "usage": "Internal",
        "indications": "Skin diseases, Eczema, Anaemia, Bleeding disorders, Haemorrhoids, Gout, Blisters, Carbuncles, Burning sensation, Excessive thirst etc.",
        "description": "Bitter blood-cleansing tablet for inflammatory skin diseases and hepatic congestion."
    },
    {
        "name": "Manjishtadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Manjishta", "Triphala", "Tiktha", "Vacha", "Devadaru"],
        "usage": "Internal",
        "indications": "Gout, Eczema, Skin diseases, Erythematous lesions, Urticaria",
        "description": "Standardized Manjishta tablet for acute hives, rashes, and cutaneous redness."
    },
    {
        "name": "Nimbadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Nimba", "Amrutha", "Rajani", "Sunti", "Vasa"],
        "usage": "Internal",
        "indications": "Abscess, Skin diseases, Ulcers",
        "description": "Neem-enriched antibacterial tablet for boils, abscesses, and wound infections."
    },
    {
        "name": "Nisakathakadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Nisa", "Kathaka", "Nellika", "Thechi", "Lodhra"],
        "usage": "Internal",
        "indications": "Polyuria, Prameha",
        "description": "Convenient tablet form of Nisakathakadi for glycemic management."
    },
    {
        "name": "Pathyakshadhadhryadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sarngadhara Samhitha",
        "packings": ["50 Nos."],
        "ingredients": ["Triphala", "Kiratatiktha", "Haridra", "Nimba", "Guduchi"],
        "usage": "Internal",
        "indications": "All types of Head ache, Pain over forehead, temporal region, Migraine, Tooth ache, Night blindness",
        "description": "Targeted headache and migraine relief tablet."
    },
    {
        "name": "Patoladi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 Nos."],
        "ingredients": ["Patola", "Katukarohini", "Chandana", "Madhusrava", "Guduchi", "Patha"],
        "usage": "Internal",
        "indications": "Kapha and Pitha predominant skin diseases, Fever, Poisoning, Anorexia, Jaundice, Skin diseases like eczema, psoriasis, allergic skin diseases, dermatitis, acne, & Vomiting",
        "description": "Dermatological tablet for chronic acne, dermatitis, and biliary disorders."
    },
    {
        "name": "Prasaranyadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Prasarani", "Masha", "Bala", "Rasona"],
        "usage": "Internal",
        "indications": "Diseases of vatha, Pain on shoulder joint, Stiffness (Frozen shoulder)",
        "description": "Formulation tablet for adhesive capsulitis, cervical pain, and shoulder mobility."
    },
    {
        "name": "Punarnavadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Punarnava", "Nimba", "Patola", "Sunti", "Tiktha"],
        "usage": "Internal",
        "indications": "General oedema, Fever, Cough, Respiratory diseases, Anemia",
        "description": "Diuretic tablet resolving fluid retention, puffiness, and inflammatory edema."
    },
    {
        "name": "Rasnasapthakam kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Rasna", "Amrutha", "Aragwadha", "Devadaru", "Gokshura"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Pain on calf region, Knee joint pain, Pain on lumbar region, Pain on sacral region, Pain on flanks",
        "description": "Anti-inflammatory analgesic tablet for spine and joint pain."
    },
    {
        "name": "Rasnairandadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Rasna", "Eranda", "Bala", "Sahachara", "Sathavari"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Pain in Calf region, Thigh, Sacral region, Lumbar region, Flanks, Oedema in gout",
        "description": "Targeted tablet for lumbar disk prolapse, sciatica, and chronic lumbago."
    },
    {
        "name": "Rasonadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Rasona", "Pippali", "Krishna Jeeraka", "Prsniparni"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Hyper cholesterolemia, Dislipidemia",
        "description": "Garlic tablet regulating lipid profiles and digestive Vata."
    },
    {
        "name": "Sahacharadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Sahachara", "Nagara", "Devadaru"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Varicosity, Pain on lumbar region",
        "description": "Tablet therapy for varicose veins, leg heaviness, and sciatica."
    },
    {
        "name": "Sapthasaram kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Punarnava", "Bilva", "Kulatha", "Eranda", "Sahachara"],
        "usage": "Internal",
        "indications": "Constipation, Loss of appetite, Splenic disorders, Chronic obstructive diseases, Dysmenorrhea, Abdominal pain",
        "description": "Gynecological tablet for menstrual cramps, pelvic congestion, and constipation."
    },
    {
        "name": "Sukumaram kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Punarnava", "Dasamoola", "Vidari", "Aswagandha"],
        "usage": "Internal",
        "indications": "Hernia, Abscess, Chronic obstructive diseases, Haemorrhoids, Oedema, Ascitis, Splenic disorders, Constipation, Gynecological disorders",
        "description": "Restorative gynecological and gut tablet for uterine fibroids and hernia."
    },
    {
        "name": "Thikthakam kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Patola", "Nimba", "Katuka", "Darvi", "Patha", "Duralabha"],
        "usage": "Internal",
        "indications": "Inflammatory skin diseases, Polydipsia, Anxiety, Anemia, Pilonidal Sinus, Skin eruptions, Abscess, Chronic obstructive diseases",
        "description": "Bitter blood purifier tablet for pilonidal sinus and dermatitis."
    },
    {
        "name": "Varadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 Nos."],
        "ingredients": ["Triphala", "Chitraka", "Haridra", "Asana", "Lohapathra"],
        "usage": "Internal",
        "indications": "Obesity, Dyslipidemia",
        "description": "Anti-obesity tablet aiding metabolic clearance and weight management."
    },
    {
        "name": "Varanadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 Nos."],
        "ingredients": ["Varana", "Saireyaka", "Sathavari", "Chitraka"],
        "usage": "Internal",
        "indications": "Kapha predominant diseases, Dyslipidemia, Obesity, Loss of appetite, Headache",
        "description": "Metabolic and lipoma-clearing tablet reducing visceral adiposity."
    },
    {
        "name": "Vidyaryadi kashayam tablet",
        "category_name": "Kashayam Tablets",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 Nos."],
        "ingredients": ["Vidari", "Eranda", "Vrischikali", "Devadaru"],
        "usage": "Internal",
        "indications": "Emaciation, Chronic obstructive diseases, Myalgia, Respiratory diseases, Cough",
        "description": "Nourishing, anabolic tablet for chronic fatigue and body wasting."
    },

    # ==========================================
    # --- PAGE 13: PRESERVATIVE FREE KASHAYAM SACHETS ---
    # ==========================================
    {
        "name": "Amruthotharam kashayam sachet",
        "category_name": "Preservative Free Kashayam Sachet",
        "classical_reference": "Sahasrayogam",
        "packings": ["336g"],
        "ingredients": ["Amrutha", "Nagara", "Harithaki"],
        "usage": "Internal (Boil sachet in specified water as per instructions)",
        "indications": "Fever, Uvulitis, Tonsilitis, Rhinitis, Sinusitis",
        "description": "Pure preservative-free single-brew decoction sachet delivering traditional freshly brewed potency."
    },
    {
        "name": "Chiruvilwadi kashayam sachet",
        "category_name": "Preservative Free Kashayam Sachet",
        "classical_reference": "Sahasrayogam",
        "packings": ["336g"],
        "ingredients": ["Chiruvilwa", "Punarnava", "Chitraka", "Harithaki"],
        "usage": "Internal",
        "indications": "Haemorrhoids, Fistula in ano, Chronic obstructive diseases, Loss of appetite, Constipation",
        "description": "Zero-preservative authentic sachet brew for anorectal health and bowel regulation."
    },
    {
        "name": "Gandharvahastadi kashayam sachet",
        "category_name": "Preservative Free Kashayam Sachet",
        "classical_reference": "Sahasrayogam",
        "packings": ["336g"],
        "ingredients": ["Gandharvahastha", "Chiruvilwa", "Chitraka", "Shunti etc."],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Loss of appetite, Anorexia, Constipation",
        "description": "Pure unadulterated botanical sachet for digestion and gentle bowel movement."
    },
    {
        "name": "Guloochyadi kashayam sachet",
        "category_name": "Preservative Free Kashayam Sachet",
        "classical_reference": "Sahasrayogam",
        "packings": ["336g"],
        "ingredients": ["Guduchi", "Nimba", "Dhanyaka", "Padmaka", "Raktachandana"],
        "usage": "Internal",
        "indications": "Fever, Nausea, Anorexia, Vomiting, Polydipsia, Burning sensation, Pitha predominant carbuncles",
        "description": "Pure decoction sachet cooling feverish heat and burning sensations."
    },
    {
        "name": "Sahacharadi kashayam sachet",
        "category_name": "Preservative Free Kashayam Sachet",
        "classical_reference": "Sahasrayogam",
        "packings": ["336g"],
        "ingredients": ["Sahachara", "Nagara", "Devadaru"],
        "usage": "Internal",
        "indications": "Vatha predominant diseases, Varicosity, Pain on lumbar region",
        "description": "Preservative-free fresh-brew sachet for lower limb circulation, varicose veins, and spine stiffness."
    },

    # ==========================================
    # --- PAGES 14-15: LEHYAM ---
    # ==========================================
    {
        "name": "Agasthya rasayanam",
        "category_name": "Lehyams",
        "classical_reference": "A.F.I. Part 1 Ashtamgahrudayam",
        "packings": ["100g", "250g", "500g"],
        "ingredients": ["Dasamoola", "Athmaguptha", "Shankhupushpi", "Shati", "Bala", "Pippalimula"],
        "usage": "Internal (10-15g twice daily with milk or warm water)",
        "indications": "Respiratory Diseases, Weakness, Hiccups, Intermittent Fever",
        "description": "Revered respiratory Rasayana strengthening lung parenchyma and defending against recurrent infections."
    },
    {
        "name": "Bahusala gulam",
        "category_name": "Lehyams",
        "classical_reference": "Chakradatha",
        "packings": ["250g"],
        "ingredients": ["Thrivrut", "Jyotishmathi", "Nagadanti", "Gokshura", "Chitraka"],
        "usage": "Internal",
        "indications": "Chronic obstructive diseases, Polyuria, Anemia, Haemorrhoids, Ascites, Sprue syndrome",
        "description": "Nutritive herbal electuary cleansing metabolic waste, treating piles, and enhancing gut assimilation."
    },
    {
        "name": "Brahma rasayanam",
        "category_name": "Lehyams",
        "classical_reference": "A.F.I. Part 1 Ashtamgahrudayam",
        "packings": ["500g"],
        "ingredients": ["Pathya", "Dhatri", "Dasamoola", "Shatavari", "Eranda"],
        "usage": "Internal",
        "indications": "Promotes intellect and memory, Emaciation, Immune deficiency disorders, Rejuvenation",
        "description": "Pinnacle rejuvenating jam for longevity, neuro-cognitive vitality, memory retention, and cellular defense."
    },
    {
        "name": "Bruhath madhusnuhi rasayanam",
        "category_name": "Lehyams",
        "classical_reference": "Sahasrayogam",
        "packings": ["250g"],
        "ingredients": ["Trikatu", "Triphala", "Trijathaka", "Chitraka"],
        "usage": "Internal",
        "indications": "Skin diseases, Carbuncles, Polyuria, Fistula in ano, Haemorrhoids, Tumour, Diseases of throat, Itching, Arthritis, Ulcers, Sprue syndrome, Chronic skin disease etc.",
        "description": "Powerful poly-herbal jam for chronic dermatological conditions, psoriasis, fistulae, and stubborn ulcers."
    },
    {
        "name": "Dasamoolahareethaki",
        "category_name": "Lehyams",
        "classical_reference": "A.F.I. Part 1 Ashtamgahrudayam",
        "packings": ["250g"],
        "ingredients": ["Dasamoola", "Haritaki", "Trijathaka", "Trikatu"],
        "usage": "Internal",
        "indications": "Oedema, Anorexia, Diseases of abdomen, Chronic obstructive diseases, Discolouration, Dysuria, Respiratory diseases",
        "description": "Haritaki and Dashamoola jam regulating bowels, relieving systemic edema, and soothing bronchitis."
    },
    {
        "name": "Dasamoola rasayanam",
        "category_name": "Lehyams",
        "classical_reference": "Sarangadhara Samhitha",
        "packings": ["100g"],
        "ingredients": ["Dasamoola", "Triphala", "Eranda", "Bala", "Bharangi"],
        "usage": "Internal",
        "indications": "Cough, Respiratory diseases, Rhinitis, Anorexia, Diseases of throat, Weakness, Chronic obstructive diseases",
        "description": "Nutritive bronchodilator jam for chronic asthma, allergic rhinitis, and pulmonary fatigue."
    },
    {
        "name": "Haridrakhandam",
        "category_name": "Lehyams",
        "classical_reference": "A.F.I. Part 1 Bhaisajya Ratnavali",
        "packings": ["50g"],
        "ingredients": ["Haridra", "Trikatu", "Trijathaka", "Vidanga", "Thrivrut"],
        "usage": "Internal",
        "indications": "Urticaria, Itching, Skin eruptions, Allergic skin diseases, Rhinitis",
        "description": "Paramount anti-allergic turmeric confection for hives, contact dermatitis, and allergic rhinitis."
    },
    {
        "name": "Hrudyavirechanam (thrivruth lehyam)",
        "category_name": "Lehyams",
        "classical_reference": "A.F.I. Part 1 Ashtamgahrudayam",
        "packings": ["100g"],
        "ingredients": ["Thrivrut", "Trijathaka", "Sitha"],
        "usage": "Internal",
        "indications": "Constipation, Fever, Stiffness of thigh, Polydipsia, Burning sensation",
        "description": "Palatable gentle purgative jam facilitating smooth Virechana and clearing Pitta constipation."
    },
    {
        "name": "Kalyana gulam",
        "category_name": "Lehyams",
        "classical_reference": "A.F.I. Part 1 Ashtamgahrudayam",
        "packings": ["100g"],
        "ingredients": ["Vidanga", "Triphala", "Dhanyaka", "Pippalimoola"],
        "usage": "Internal",
        "indications": "Ascites, Chronic obstructive diseases, Fistula in ano, Haemorrhoids, Sprue syndrome, Polyuria, Anemia, Constipation",
        "description": "Traditional jaggery electuary for abdominal enlargements, sprue, and anorectal health."
    },
    {
        "name": "Kooshmanda rasayanam",
        "category_name": "Lehyams",
        "classical_reference": "A.F.I. Part 1 Bhaisajya Ratnavali",
        "packings": ["250g"],
        "ingredients": ["Kooshmanda", "Shunti", "Pippali", "Jeeraka"],
        "usage": "Internal",
        "indications": "Cough, Respiratory diseases, Weakness, Chronic fever, Bleeding Disorders, Vomiting, Polydipsia, Fever, Oligospermia",
        "description": "Cooling Benincasa hispida jam rejuvenating lungs, promoting weight gain, and stopping internal bleeding."
    },
    {
        "name": "Koutaja thriphala lehyam",
        "category_name": "Lehyams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["100g"],
        "ingredients": ["Kutaja", "Triphala", "Nimba", "Patola"],
        "usage": "Internal",
        "indications": "Anemia, Skin diseases, Splenic disorders, Asthma, Haemorrhoids, Fistula in ano, Polyuria, Emaciation",
        "description": "Astringent bowel-stabilizing electuary for chronic dysentery, ulcerative colitis, and piles."
    },
    {
        "name": "Manibhadra gulam",
        "category_name": "Lehyams",
        "classical_reference": "A.F.I. Part 1 Sahasrayogam",
        "packings": ["100g"],
        "ingredients": ["Vidanga", "Amalaki", "Haritaki", "Thrivrut"],
        "usage": "Internal",
        "indications": "Skin diseases, Ascites, Splenic disorders, Worm infestation, Haemorrhoids, Cyst, Respiratory diseases, Cough, Polyuria",
        "description": "Comprehensive detoxifying jam clearing intestinal parasites, splenic disorders, and stubborn skin lesions."
    },
    {
        "name": "Narasimha rasayanam",
        "category_name": "Lehyams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["250g"],
        "ingredients": ["Gayathri", "Sikhi", "Simsipa", "Asana", "Shiva"],
        "usage": "Internal",
        "indications": "Hair fall, Greying of hair, Loss of libido, Emaciation.",
        "description": "Renowned Rasayana jam strengthening hair follicles, preventing premature greying, and restoring vitality."
    },
    {
        "name": "Sathavari gulam",
        "category_name": "Lehyams",
        "classical_reference": "A.F.I. Part 1 Sahasrayogam",
        "packings": ["250g", "500g"],
        "ingredients": ["Sathavari", "Viswa", "Ela", "Musali", "Patha"],
        "usage": "Internal",
        "indications": "Dysuria, Bleeding disorders, Weakness, Burning sensation on foot, Diseases of female genital tract, Menorrhagia",
        "description": "Superb nourishing electuary for female reproductive rejuvenation, menorrhagia, and urinary burning."
    },
    {
        "name": "Sukumara rasayanam",
        "category_name": "Lehyams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["250g"],
        "ingredients": ["Punarnava", "Dasamoola", "Vidari", "Aswagandha"],
        "usage": "Internal",
        "indications": "Vruddhi (Hernia), Vidradhi (Abscess), Chronic obstructive diseases, Heamorrhoids, Sopha (Oedema), Dysmenorrhoea, Amenorrhoea, Leucorrhoea",
        "description": "Famous Rasayana jam relieving gynecological cysts, painful periods, and abdominal distension."
    },
    {
        "name": "Thaleesapathradi lehyam",
        "category_name": "Lehyams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["100g"],
        "ingredients": ["Thaleesa pathra", "Chavika", "Maricha", "Pippali"],
        "usage": "Internal",
        "indications": "Vomiting, Sprue syndrome, Pain on flanks, Diseases of heart, Fever, Oedema",
        "description": "Palatable digestive and bronchodilator electuary for productive cough and nausea."
    },
    {
        "name": "Thaleesapathradi vatakam",
        "category_name": "Lehyams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50g"],
        "ingredients": ["Thaleesa pathra", "Chavika", "Maricha", "Pippali"],
        "usage": "Internal",
        "indications": "Vomiting, Sprue syndrome, Pain on flanks, Diseases of heart, Fever, Oedema",
        "description": "Granulated chewable form of Thaleesapatradi for respiratory relief and appetizing action."
    },
    {
        "name": "Thamboola rasayanam",
        "category_name": "Lehyams",
        "classical_reference": "Sahasrayogam",
        "packings": ["100g"],
        "ingredients": ["Thamboola", "Jeeraka", "Pippali", "Sitha"],
        "usage": "Internal",
        "indications": "Respiratory diseases, Cough, Asthma, Bronchitis, Rhinitis",
        "description": "Betel leaf and spice jam relieving whooping cough, chronic bronchitis, and nocturnal wheezing."
    },
    {
        "name": "Vidyaryadi lehyam",
        "category_name": "Lehyams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["500g"],
        "ingredients": ["Vidari", "Panchangula", "Vrishchikali", "Vrishchiva"],
        "usage": "Internal",
        "indications": "Emaciation, Chronic obstructive diseases, Myalgia, Respiratory diseases, Cough",
        "description": "Premier body-building and weight-gain electuary for physical debility and convalescence."
    },
    {
        "name": "Vilwadi lehyam",
        "category_name": "Lehyams",
        "classical_reference": "Sahasrayogam",
        "packings": ["100g"],
        "ingredients": ["Bilva", "Mustha", "Dhanyaka", "Jeeraka", "Ela"],
        "usage": "Internal",
        "indications": "Anorexia, Loss of appetite, Excess salivation, Vomiting, Gastro-intestinal disorders",
        "description": "Classical Bael fruit electuary resolving nausea, morning sickness, anorexia, and hyperacidity."
    }
]

def normalize_name(s):
    if not s:
        return ""
    s = s.lower()
    s = re.sub(r'\s*\([^)]*\)', '', s)  # Remove parenthetical aliases
    s = re.sub(r'[^a-z0-9]', '', s)
    return s

def clean_key(s):
    s = s.lower()
    s = re.sub(r'\b\d+\s*(ml|gm|g|nos|tabs?|caps?)\b', '', s)
    for term in ['kashayam', 'kashaya', 'tablets', 'tablet', 'sachet', 'lehyam', 'rasayanam', 'rasaayanam',
                 'rasayana', 'gulam', 'vatakam', 'gulika', 'capsules', 'capsule', 'vati']:
        s = s.replace(term, '')
    s = s.replace('ee', 'i').replace('oo', 'u')
    s = s.replace('th', 't').replace('dh', 'd').replace('bh', 'b').replace('kh', 'k').replace('gh', 'g')
    s = s.replace('sh', 's').replace('w', 'v')
    return re.sub(r'[^a-z0-9]', '', s)

def main():
    with open('data/supabase_config.json') as f:
        cfg = json.load(f)
    supabase_url = cfg['url']
    supabase_key = cfg['key']

    # 1. Fetch current products to prevent ANY duplicate
    fetch_req = urllib.request.Request(
        f"{supabase_url}/rest/v1/products?select=id,code,name,category_name&order=id.asc",
        headers={"apikey": supabase_key, "Authorization": f"Bearer {supabase_key}"}
    )
    with urllib.request.urlopen(fetch_req) as resp:
        existing_products = json.loads(resp.read().decode('utf-8'))
    print(f"Current products in Supabase: {len(existing_products)}")

    existing_norm_lookup = {}
    highest_code_num = 42249
    for p in existing_products:
        norm = normalize_name(p['name'])
        existing_norm_lookup[norm] = p
        m = re.search(r'SA-(\d+)', p.get('code', ''))
        if m:
            cnum = int(m.group(1))
            if cnum > highest_code_num:
                highest_code_num = cnum

    print(f"Highest code number detected: SA-{highest_code_num}")

    # 2. Load scraped Sitaram Shopify products
    with open('data/all_sitaram_shopify_products.json') as f:
        sitaram_products = json.load(f)

    handle_to_img = {}
    handle_to_title = {}
    clean_sitaram = {}

    for p in sitaram_products:
        h = p.get('handle', '')
        t = p.get('title', '')
        imgs = [i['src'] for i in p.get('images', []) if 'src' in i]
        if imgs:
            handle_to_img[h] = imgs[0]
            handle_to_title[h] = t
            ck_t = clean_key(t)
            ck_h = clean_key(h)
            if ck_t and ck_t not in clean_sitaram:
                clean_sitaram[ck_t] = (imgs[0], t)
            if ck_h and ck_h not in clean_sitaram:
                clean_sitaram[ck_h] = (imgs[0], t)

    # Category authentic packaging fallbacks from Sitaram
    cat_fallbacks = {
        'Kashayams': ('https://cdn.shopify.com/s/files/1/0705/1182/0938/files/10_AMRUTHOTHARAM_KASHAYAM_200_ML.jpg?v=1760080387', 'Amruthotharam Kashayam 200 Ml'),
        'Kashayam Tablets': ('https://cdn.shopify.com/s/files/1/0705/1182/0938/files/12_AMRUTHOTHARAM_KASHAYAM_TABLET_50_NOS.jpg?v=1760080476', 'Amruthotharam Kashayam Tablet 50 Nos'),
        'Preservative Free Kashayam Sachet': ('https://cdn.shopify.com/s/files/1/0705/1182/0938/files/chiruvilwadi-kashaya-sachet.jpg', 'Chiruvilwadi Kashaya Sachet'),
        'Lehyams': ('https://cdn.shopify.com/s/files/1/0705/1182/0938/files/173_VILWADI_LEHYAM_100_GM.jpg?v=1768203115', 'Vilwadi Lehyam 100 Gm'),
        'Single Herb Vegan Capsules': ('https://cdn.shopify.com/s/files/1/0705/1182/0938/files/33_ASHWAGANDHA_-_60_Capsules.jpg?v=1760082406', 'Ashwagandha 60 Capsules'),
        'Gulika, Gulika Tablets, Capsules': ('https://cdn.shopify.com/s/files/1/0705/1182/0938/files/68_CHANDRAPRABHA_GULIKA_TABLET_50_NOS.jpg?v=1762338652', 'Chandraprabha Gulika Tablet 50 Nos')
    }

    # Explicit accurate Sitaram handles for new medicines
    EXPLICIT_HANDLES = {
        'Siva gulika': 'sivagulika',
        'Vettumaran gulika': 'vettumaran-gulika',
        'Vettumaran gulika tablets': 'vettumaran-gulika',
        'Vayu gulika tablets': 'vayu-gulika',
        'Vilwadi gulika': 'vilwadi-gulika',
        'Vilwadi gulika tablets': 'vilwadi-gulika',
        'Swasanandam gulika': 'swasanandam-gulika-100-nos',
        'Swasanandam gulika tablets': 'swasanandam-gulika-100-nos',
        'Yogaraja guggulu gulika': 'yogaraja-guggulu-gulika-100-nos',
        'Yogaraja guggulu gulika tablets': 'yogaraja-guggulu-gulika-100-nos',
        'Amla Capsules': 'amla',
        'Aswagandha Capsules': 'ashwagandha',
        'Brahmi Capsules': 'brahmi',
        'Gokshura Capsules': 'gokshura',
        'Gulgulu Capsules': 'gulgulu',
        'Kapikachu Capsules': 'kapikacchu',
        'Shallaki Capsules': 'shallaki',
        'Shatavari Capsules': 'shatavari',
        'Tagara Capsules': 'tagara',
        'Triphala Capsules': 'triphala',
        'Amruthotharam kashayam': 'amruthotharam-kashaya',
        'Aragwadhadi kashayam': 'aragwadhadi-kashayam-200-ml',
        'Ashtavargam kashayam (balasahacharadi kashayam)': 'ashtavargam-kashayam-200-ml',
        'Balagooloochyadi kashayam': 'balaguluchyadi-kashaya-200-ml',
        'Balajeerakadi kashayam': 'balajeerakadi-kashayam-200-ml',
        'Bruhathyadi kashayam': 'bruhatyadi-kashaya',
        'Chiruvilwadi kashayam': 'chiruvilwadi-kashayam-200-ml',
        'Dasamoolakatuthrayam kashayam': 'dasamoolakatutraya-kashaya-tablet-2',
        'Dasamoolam kashayam': 'dasamoola-kashaya',
        'Dhanwantharam kashayam': 'dhanwantharam-kashayam-200-ml',
        'Dhanyamlam': 'dhanyamlam',
        'Drakshadi kashayam': 'drakshadi-kashayam-200-ml',
        'Dusparsakadi kashayam': 'dusparsakadi-kashayam-200-ml',
        'Gandharvahasthadi kashayam': 'gandharvahasthadi-kashayam-200-ml',
        'Guloochyadi kashayam': 'guduchyadi-kashaya',
        'Gulguluthikthakam kashayam': 'gulguluthikthakam-kashaya',
        'Indukantham kashayam': 'indukantham-kashayam-200-ml',
        'Kathakakhadiradi kashayam': 'kathakakhadiradi-kashayam-200-ml',
        'Kokilaksham kashayam': 'kokilaksham-kashaya',
        'Maha manjishtadi kashayam': 'maha-manjishtadi-kashaya',
        'Mahathikthakam kashayam': 'mahathikthakam-kashayam-200-ml',
        'Manjishtadi kashayam': 'manjishtadi-kashaya',
        'Musaleekhadiradi kashayam': 'musalikhadiradi-kashaya-200-ml',
        'Nayopayam kashayam': 'nayopyam-kashaya',
        'Neelithulasyadi kashayam': 'neelithulasyadi-kashaya',
        'Nimbadi kashayam': 'nimbadi-kashaya',
        'Nisakathakadi kashayam': 'nisakathakadi-kashaya',
        'Patoladi kashayam (patolakaturohinyadi kashayam)': 'patoladi-kashaya',
        'Prasaranyadi kashayam': 'prasaranyadi-kashayam-200-ml',
        'Punarnavadi kashayam': 'punarnavadi-kashaya',
        'Rasnadi kashayam': 'rasnadi-kashayam-rasnairandadi-kashayam-200-ml',
        'Rasnasapthakam kashayam': 'rasnasapthakam-kashayam-200-ml',
        'Rasnairandadi kashayam': 'rasnairandadi-kashaya',
        'Rasonadi kashayam': 'rasonadi-kashayam-200-ml',
        'Sahacharadi kashayam': 'sahacharadi-kashayam-200-ml',
        'Sapthasaram kashayam': 'sapthasaram-kashaya',
        'Shaddharanam kashayam': 'shaddharanam-kashayam',
        'Sukumaram kashayam': 'sukumaram-kashaya',
        'Thikthakam kashayam': 'thikthakam-kashayam-200-ml',
        'Varadi kashayam (varasanadi kashayam)': 'varadi-kashaya',
        'Varanadi kashayam': 'varanadi-kashaya',
        'Vasaguloochyadi kashayam': 'vasaguluchyadi-kashaya',
        'Veeratharadi kashayam': 'veerataradi-kashaya',
        'Vidyaryadi kashayam': 'vidaryadi-kashaya',
        # Tablets
        'Amruthotharam kashayam tablet': 'amruthotharam-kashayam-tablet',
        'Ashtavargam kashayam tablet': 'ashtavargam-kashayam-tablet',
        'Balagooloochyadi kashayam tablet': 'balaguluchyadi-kashayam-tablet-50-nos',
        'Bruhathyadi kashayam tablet': 'bruhathyadi-kashayam-tablet-50-nos',
        'Chiruvilwadi kashayam tablet': 'chiruvilwadi-kashayam-tablet-50-nos',
        'Chyavanaprasam kashayam tablet': 'chyavanaprasam-kashayam-tablet',
        'Dasamoolakatuthrayam kashayam tablet': 'dasamoolakatutraya-kashaya-tablet',
        'Dasamoolam kashayam tablet': 'dasamoola-kashayam-tablet-50-nos',
        'Dhanwantharam kashayam tablet': 'dhanwantharam-kashayam-tablet-50-nos',
        'Drakshadi kashayam tablet': 'drakshadi-kashayam-tablet-50-nos',
        'Gandharvahasthadi kashayam tablet': 'gandharvahasthadi-kashayam-tablet-50-nos',
        'Guloochyadi kashayam tablet': 'guluchyadi-kashayam-tablet-50-nos',
        'Gulguluthikthakam kashayam tablet': 'gulguluthithakam-kashaya-tablet',
        'Indukantham kashayam tablet': 'indukantham-kashayam-tablet-50-nos',
        'Kathakakhadiradi kashayam tablet': 'kathakakhadiradi-kashayam-tablet-50-nos',
        'Kokilaksham kashayam tablet': 'kokilaksham-kashayam-tablet-50-nos',
        'Maha manjishtadi kashayam tablet': 'maha-manjishtadi-kashayam-tablet-50-nos',
        'Maharasnadi kashayam tablet': 'maharasnadi-kashaya-tablet',
        'Mahathikthakam kashayam tablet': 'mahathikthakam-kashayam-tablet-50-nos',
        'Manjishtadi kashayam tablet': 'manjishtadi-kashayam-tablet-50-nos',
        'Nimbadi kashayam tablet': 'nimbadi-kashayam-tablet',
        'Nisakathakadi kashayam tablet': 'nisakathakadi-kashaya-tablets',
        'Pathyakshadhadhryadi kashayam tablet': 'pathyakshadhadhryadi-kashayam-tablet-50-nos',
        'Patoladi kashayam tablet': 'patoladi-kashayam-tablet-50-nos',
        'Prasaranyadi kashayam tablet': 'prasaranyadi-kashayam-tablet-50-nos',
        'Punarnavadi kashayam tablet': 'punarnavadi-kashayam-tablet-50-nos',
        'Rasnasapthakam kashayam tablet': 'rasnasapthakam-kashayam-tablet-50-nos',
        'Rasnairandadi kashayam tablet': 'rasnairandadi-kashayam-tablet-50-nos',
        'Rasonadi kashayam tablet': 'rasonadi-kashayam-tablet-50-nos',
        'Sahacharadi kashayam tablet': 'sahacharadi-kashayam-tablet-50-nos',
        'Sapthasaram kashayam tablet': 'sapthasaram-kashayam-tablet-50-nos',
        'Sukumaram kashayam tablet': 'sukumaram-kashayam-tablet-50-nos',
        'Thikthakam kashayam tablet': 'thikthakam-kashayam-tablet-50-nos',
        'Varadi kashayam tablet': 'varadi-kashayam-tablet-50-nos',
        'Varanadi kashayam tablet': 'varanadi-kashayam-tablet-50-nos',
        'Vidyaryadi kashayam tablet': 'vidaryadi-kashayam-tablet-50-nos',
        # Sachets
        'Chiruvilwadi kashayam sachet': 'chiruvilwadi-kashaya-sachet-350gm',
        'Sahacharadi kashayam sachet': 'sahacharadi-kashaya-sachet-350gm',
        # Lehyams
        'Agasthya rasayanam': 'agasthya-rasayanam-500-gm',
        'Brahma rasayanam': 'brahma-rasaayanam',
        'Bruhath madhusnuhi rasayanam': 'cheriya-madhusnuhi-rasayanam-250-gm',
        'Dasamoolahareethaki': 'dasamoolahareethaki-lehyam-250-gm',
        'Dasamoola rasayanam': 'dasamoola-rasayanam-100-gm',
        'Haridrakhandam': 'haridrakhandam-choornam-50-gm',
        'Kooshmanda rasayanam': 'kushmanda-rasayana-250-gm',
        'Narasimha rasayanam': 'narasimha-rasayanam',
        'Sathavari gulam': 'satavari-gulam-250-gm',
        'Sukumara rasayanam': 'sukumara-rasayanam-250-gm',
        'Thamboola rasayanam': 'thamboola-rasayanam-100-gm',
        'Vidyaryadi lehyam': 'vidaryadi-leham-500-gm',
        'Vilwadi lehyam': 'vilwadi-lehyam-100-gm',
    }

    to_insert = []
    skipped = []

    for med in MEDICINES_BATCH_2:
        name = med['name']
        norm = normalize_name(name)

        if norm in existing_norm_lookup:
            ex = existing_norm_lookup[norm]
            skipped.append((name, ex['name'], ex.get('code')))
            continue

        # Generate next sequential code
        highest_code_num += 1
        code = f"SA-{highest_code_num:05d}"

        # Resolve authentic photo
        photo_url = None
        source_note = ""

        # 1. Explicit handle
        if name in EXPLICIT_HANDLES:
            h = EXPLICIT_HANDLES[name]
            if h in handle_to_img:
                photo_url = handle_to_img[h]
                source_note = f"Explicit handle -> {h}"

        # 2. Fuzzy clean match
        if not photo_url:
            ck = clean_key(name)
            if ck in clean_sitaram:
                photo_url, t = clean_sitaram[ck]
                source_note = f"Fuzzy title match -> {t}"

        # 3. Substring match
        if not photo_url:
            ck = clean_key(name)
            if len(ck) >= 4:
                for sck, (img_url, t) in clean_sitaram.items():
                    if ck in sck or sck in ck:
                        photo_url = img_url
                        source_note = f"Substring match -> {t}"
                        break

        # 4. Authentic category packaging fallback from Sitaram
        if not photo_url:
            cat = med.get('category_name', '')
            fb_img, fb_title = cat_fallbacks.get(cat, cat_fallbacks['Kashayams'])
            photo_url = fb_img
            source_note = f"Authentic Sitaram Category Packaging -> {fb_title}"

        # Format ingredients for JSONB
        ingredients_formatted = []
        for ing in med.get("ingredients", []):
            if isinstance(ing, str):
                ingredients_formatted.append({"name": ing.strip()})
            elif isinstance(ing, dict):
                ingredients_formatted.append(ing)

        slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

        product_row = {
            "code": code,
            "name": name,
            "category_name": med.get("category_name", "Kashayams"),
            "classical_reference": med.get("classical_reference", "Classical Treatise"),
            "packings": med.get("packings", []),
            "ingredients": ingredients_formatted,
            "dosage": med.get("usage", "As directed by the Ayurvedic physician"),
            "indications": med.get("indications", ""),
            "description": med.get("description", f"Authentic classical Ayurvedic medicine {name}."),
            "image_url": photo_url,
            "status": "Active",
            "featured": False,
            "public_slug": slug,
            "share_qr_link": f"https://ayur-guide-admin-panel.vercel.app/product/{slug}"
        }

        to_insert.append(product_row)
        existing_norm_lookup[norm] = product_row

    print(f"\nSkipped {len(skipped)} medicines already in Supabase:")
    for s_name, ex_name, ex_code in skipped:
        print(f"  - '{s_name}' (matches '{ex_name}' [{ex_code}])")

    print(f"\nIdentified {len(to_insert)} new medicines to add to Supabase.")

    # Batch insert into Supabase
    inserted_count = 0
    batch_size = 10
    for i in range(0, len(to_insert), batch_size):
        batch = to_insert[i:i + batch_size]
        body_bytes = json.dumps(batch).encode("utf-8")
        insert_req = urllib.request.Request(
            f"{supabase_url}/rest/v1/products",
            data=body_bytes,
            headers={
                "apikey": supabase_key,
                "Authorization": f"Bearer {supabase_key}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            method="POST"
        )
        try:
            with urllib.request.urlopen(insert_req) as resp:
                res_data = json.loads(resp.read().decode())
                inserted_count += len(res_data)
                print(f"  ✓ Batch {i//batch_size + 1}: Inserted {len(res_data)} medicines (Total: {inserted_count}/{len(to_insert)})")
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode()
            print(f"  ✗ Error inserting batch {i//batch_size + 1}: {e.code} - {err_msg}")
            # Try single inserts
            for item in batch:
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

    print(f"\nSuccessfully inserted {inserted_count} new medicines into Supabase Central Database!")

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
