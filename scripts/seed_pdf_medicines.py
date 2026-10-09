#!/usr/bin/env python3
"""
Seed medicines from Sitaram Ayurveda Therapeutic Index Hand Book (Pages 5-15)
Skips any medicine that already exists in Supabase.
"""

import os
import json
import re
import urllib.request
import urllib.parse
import urllib.error

# 1. Complete list of medicines extracted directly from Sitaram Ayurveda Therapeutic Index Hand Book (Pages 5-15)
MEDICINES_DATA = [
    # --- PAGE 5: ARISHTAMS ---
    {
        "name": "Abhayarishtam",
        "category_name": "Arishtam",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["450 ml"],
        "ingredients": ["Abhaya", "Dhatri", "Kapitha", "Vishala"],
        "usage": "5-25 ml Twice daily",
        "indications": "Arshas (Hemorrhoids), Udara (Ascitis), Muthra vibanda (Anuria), Vibanda (Constipation), Agnimandya (Loss of appetite)",
        "description": "Classical fermented arishtam indicated for piles, ascites, constipation, and digestive enhancement."
    },
    {
        "name": "Amrutharishtam",
        "category_name": "Arishtam",
        "classical_reference": "A.F.I. Part 1 Bhaisajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Amritha", "Bilwa", "Syonaka", "Gambhari"],
        "usage": "5-25 ml Twice daily",
        "indications": "Jwara (fever), Tundikeri (Uvulitis), Galayu (Tonsillitis), Sotha (Oedema), Agnimandya (Loss of appetite)",
        "description": "Potent antipyretic formulation with Guduchi, relieving chronic fevers, tonsillitis, and systemic inflammatory edema."
    },
    {
        "name": "Aragwadharishtam",
        "category_name": "Arishtam",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["450 ml"],
        "ingredients": ["Aragwadha", "Indrayava", "Patala", "Kakathiktha"],
        "usage": "5-25 ml twice daily",
        "indications": "Skin diseases, worms, Leucoderma, cough and Diabetes",
        "description": "Renowned blood purifier and detoxifier formulated with Cassia fistula for dermatological conditions and metabolic disorders."
    },
    {
        "name": "Arjunarishtam",
        "category_name": "Arishtam",
        "classical_reference": "A.F.I. Part 1 Bhaisajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Arjuna", "Mrdwika", "Madhuka"],
        "usage": "5-25 ml twice daily",
        "indications": "Hridgadha (Heart diseases), Balakshaya (Weakness)",
        "description": "Cardio-protective herbal fermented tonic enhancing myocardial tone and physical endurance."
    },
    {
        "name": "Asokarishtam",
        "category_name": "Arishtam",
        "classical_reference": "A.F.I. Part 1 Bhaisajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Asoka", "Dhathaki", "Ajaji"],
        "usage": "5-25 ml twice daily",
        "indications": "Asrugdara (Menorrhagia), Yoniruja (Vaginitis), Swethapradhara (Leucorrhoea)",
        "description": "Prime classical uterine restorative and uterine tonic for regulating menstrual cycles and pelvic comfort."
    },
    {
        "name": "Aswagandharishtam",
        "category_name": "Arishtam",
        "classical_reference": "A.F.I. Part 1 Bhaisajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Aswagandha", "Musali", "Manjishta", "Haritaki"],
        "usage": "5-25 ml twice daily",
        "indications": "Murccha (Syncope), Smruthibramsha (Dementia), Sosham (Emaciation), Karshya (Emaciation), Mandhagni (Indigestion)",
        "description": "Invigorating adaptogen and nervine restorative addressing physical fatigue, memory loss, and nervous exhaustion."
    },
    {
        "name": "Ayaskriti",
        "category_name": "Arishtam",
        "classical_reference": "A.F.I. Part 1 Ashtamgahrudayam",
        "packings": ["450 ml"],
        "ingredients": ["Asana", "Bhurja", "Swethavaha"],
        "usage": "5-25 ml twice daily",
        "indications": "Kushta (Skin diseases), Premeha (Polyuria), Arshas (Heamorrhoids), Aruchi (Anorexia), Krimi (Worm infestation)",
        "description": "Specialized bio-mineral iron-processed classical elixir for metabolic syndrome, diabetes, skin disorders, and obesity."
    },
    {
        "name": "Balarishtam",
        "category_name": "Arishtam",
        "classical_reference": "A.F.I. Part 1 Bhaisajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Bala", "Aswagandha", "Dhathaki", "Payasa"],
        "usage": "5-25 ml twice daily",
        "indications": "Vatharoga (Vatha predominant diseases), Balapushti (Promotes strength), Agnivardhana (Appetizer)",
        "description": "Nourishing neuro-muscular tonic promoting strength, digestion, and pacifying aggravated Vata."
    },
    {
        "name": "Dantharishtam",
        "category_name": "Arishtam",
        "classical_reference": "A.F.I. Part 1 Ashtamgahrudayam",
        "packings": ["450 ml"],
        "ingredients": ["Danthi", "Bilwa", "Gambhari", "Syonaka"],
        "usage": "5-25 ml twice daily",
        "indications": "Agnimandya (Loss of appetite), Grahani (Sprue syndrome), Gulma (Chronic obstructive diseases), Krimi (Worm infestation), Pleeharoga (Splenic disorders)",
        "description": "Digestive stimulant and hepatoprotective formulation targeting abdominal lumps, splenic complaints, and intestinal worms."
    },
    {
        "name": "Dasamoolajeerakam",
        "category_name": "Arishtam",
        "classical_reference": "Bhaisajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Bilwa", "Syonaka", "Gambhari", "Patala", "Jeeraka"],
        "usage": "5-25 ml twice daily",
        "indications": "Kushta (Skin diseases), Vataraktha (Gout), Chardi (Vomiting), Atisara (Diarrhoea), Sotha (Oedema), Agnimandya (Loss of appetite)",
        "description": "Synergistic combination of Dashamoola and Jeeraka for gout, digestive dysfunctions, vomiting, and inflammatory edema."
    },

    # --- PAGE 6: ARISHTAMS (Contd.) ---
    {
        "name": "Dasamoolarishtam",
        "category_name": "Arishtam",
        "classical_reference": "A.F.I. Part 1 Sarangadara Samhitha",
        "packings": ["450 ml"],
        "ingredients": ["Bilwa", "Syonaka", "Gambhari", "Patala", "Lodhra", "Guduchi"],
        "usage": "5-25 ml twice daily",
        "indications": "Grahani (Sprue syndrome), Aruchi (Anorexia), Shoolam (Colic), Swasa (Respiratory diseases), Kasa (Cough), Vatavyadhi (Diseases with vatha predominance), Arshas (Heamorrhoids), Kshaya (Weakness), Bhagandara (Fistula in ano)",
        "description": "Flagship postnatal and post-illness restorative revitalizing vitality, respiratory stamina, and tissue metabolism."
    },
    {
        "name": "Devadarvarishtam",
        "category_name": "Arishtam",
        "classical_reference": "A.F.I. Part 1 Bhaisajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Devadaru", "Manjishta", "Vasa", "Indrayava"],
        "usage": "5-25 ml twice daily",
        "indications": "Premeha (Polyuria), Vatharoga (Vatha predominant diseases), Arshas (Heomorrhoids), Kushta (Skin diseases), Grahani (Sprue syndrome), Muthrakrcchra (Dysuria)",
        "description": "Cedrus deodara decoction fermented elixir for urinary incontinence, dysuria, skin disorders, and chronic sprue."
    },
    {
        "name": "Dhanwanthararishtam",
        "category_name": "Arishtam",
        "classical_reference": "Ayurvedic proprietary medicine",
        "packings": ["450 ml"],
        "ingredients": ["Prisniparni", "Salaprani", "Badara", "Brihathi", "Bala"],
        "usage": "5-25 ml twice daily",
        "indications": "Vataraktha (Gout), Jwara (Fever), Gulma (Chronic obstructive diseases), mutravibanda (Urine retension), Arditha (Facial palsy)",
        "description": "Celebrated neuro-muscular medicine for facial palsy, gouty arthritis, fever, and urinary retention."
    },
    {
        "name": "Draksharishtam",
        "category_name": "Arishtam",
        "classical_reference": "A.F.I. Part 1 Sarangadara Samhitha",
        "packings": ["450 ml"],
        "indications": "Agnimandya (Loss of appetite), Urakshatha (Chest infections), Kshaya (Weakness), Kasa (Cough), Swasa (Respiratory diseases), Galaroga (Diseases of throat)",
        "ingredients": ["Draksha", "Twak", "Ela", "Patra"],
        "usage": "5-25 ml twice daily",
        "description": "Nourishing raisin-based preparation for strengthening pulmonary parenchyma, throat conditions, and relieving chronic debility."
    },
    {
        "name": "Duralabharishtam",
        "category_name": "Arishtam",
        "classical_reference": "A.F.I. Part 3 Ashtamgahrudayam",
        "packings": ["450 ml"],
        "ingredients": ["Duralabha", "Amalaki", "Danthi", "Chitraka"],
        "usage": "5-25 ml twice daily",
        "indications": "Grahani (Sprue syndrome), Pandu (Anaemia), Arshas (Heamorrhoids), Kushta (Skin diseases), Premeha (Polyuria), Sleepatha (Filariasis)",
        "description": "Classical formulation targeting sprue, filariasis, piles, and anemia with digestive and lymph-clearing properties."
    },
    {
        "name": "Jeerakarishtam",
        "category_name": "Arishtam",
        "classical_reference": "A.F.I. Part 1 Bhaisajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Jeeraka", "Sunti", "Dhataki", "Jatiphala"],
        "usage": "5-25 ml twice daily",
        "indications": "Soothikaroga (Post-partum complaints), Agnimandya (Loss of appetite), Atisara (Diarrhoea), Grahani (Sprue syndrome)",
        "description": "Essential cumin-based puerperal tonic enhancing lactation, uterine involution, and digestive fire."
    },
    {
        "name": "Khadirarishtam",
        "category_name": "Arishtam",
        "classical_reference": "A.F.I. Part 1 Sarangadara Samhitha",
        "packings": ["450 ml"],
        "ingredients": ["Khadira", "Bakuchi", "Devadaru", "Daruharidra"],
        "usage": "5-25 ml twice daily",
        "indications": "Granthi (Cyst), Krimi (Worm infestation), Pandu (Anaemia), Gulma (Chronic obstructive diseases), Kusta (Skin diseases)",
        "description": "Foremost classical remedy for chronic skin diseases, cysts, intestinal parasites, and inflammatory lesions."
    },
    {
        "name": "Kutajarishtam",
        "category_name": "Arishtam",
        "classical_reference": "A.F.I. Part 1 Bhaisajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Kutaja", "Mrdwika", "Madhuka", "Kashmari"],
        "usage": "5-25 ml twice daily",
        "indications": "Jwara (Fever), Grahani (Sprue syndrome), Rakthatisara (Dysentery), Agnimandya (Loss of appetite)",
        "description": "Time-tested antidiarrheal and antidysenteric formulation targeting amebic infections and ulcerative colitis."
    },
    {
        "name": "Lakshmanarishtam",
        "category_name": "Arishtam",
        "classical_reference": "Bhaisajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Lakshmana", "Dhataki", "Mustaka", "Yashtimadhu"],
        "usage": "5-25 ml twice daily",
        "indications": "Sthreegadha (Gynaecological disorders), Asrugdara (Menorrhagia), Sthreevandyatwa (Infertility in females), Swethapradaram (Leucorrhoea)",
        "description": "Specific female reproductive tonic indicated for conception support, menorrhagia, and leucorrhea."
    },

    # --- PAGE 7: ARISHTAMS & ASAVAS ---
    {
        "name": "Mustharishtam",
        "category_name": "Arishtam",
        "classical_reference": "A.F.I. Part 1 Bhaisajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Musthaka", "Yavani", "Dhathaki", "Visvabheshaja"],
        "usage": "5-25 ml twice daily",
        "indications": "Ajeerna (Indigestion), Agnimandya (Loss of appetite), Grahani (Sprue syndrome), Atisara (Diarrhoea), Aruchi (Anorexia)",
        "description": "Nutgrass-based carminative and astringent tonic for malabsorption, indigestion, and irritable bowel."
    },
    {
        "name": "Parpatakarishtam",
        "category_name": "Arishtam",
        "classical_reference": "Bhaisajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Parpataka", "Dhataki", "Amrutha", "Musthaka"],
        "usage": "5-25 ml twice daily",
        "indications": "Kamala (Jaundice), Sotha (Oedema), Udara (Ascitis), Vridhi (Condition like hernia), Ashtila (Enlarged prostate), Pandu (Anemia), Gulma (Chronic obstructive disease)",
        "description": "Herbal preparation for hepatic congestion, obstructive jaundice, ascites, and benign prostatic enlargement."
    },
    {
        "name": "Sudarsanarishtam",
        "category_name": "Arishtam",
        "classical_reference": "Bhaisajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Rajani", "Devadaru", "Vacha", "Ghana"],
        "usage": "5-25 ml twice daily",
        "indications": "Jwara (Fever), Pleeharoga (Splenic disorders), Yakrutvikaras (For healthy liver), Gulma (Chronic obstructive diseases)",
        "description": "Broad-spectrum antipyretic supporting hepatobiliary excretion and systemic clearance of persistent fevers."
    },
    {
        "name": "Vasarishtam",
        "category_name": "Arishtam",
        "classical_reference": "A.F.I. Part 1 Gadanigraham",
        "packings": ["450 ml"],
        "ingredients": ["Vasa", "Dhathaki", "Twak", "Ela"],
        "usage": "5-25 ml twice daily",
        "indications": "Sopha (Oedema), Kasa (Cough), Swasa (Respiratory diseases), Rakthapitha (Bleeding disorders)",
        "description": "Adhatoda vasica bronchodilator and hemostatic formulation for hemoptysis, bronchial asthma, and chronic bronchitis."
    },
    {
        "name": "Vidangarishtam",
        "category_name": "Arishtam",
        "classical_reference": "A.F.I. Part 1 Sarangadhara Samhitha",
        "packings": ["450 ml"],
        "ingredients": ["Vidanga", "Rasna", "Grandhika", "Kutaja"],
        "usage": "5-25 ml twice daily",
        "indications": "Vidradi (Abscess), Urustambam (Stillness of thigh), Gulma (Chronic obstructive diseases), Bhagandara (Fistula in ano)",
        "description": "Anthelmintic and wound-healing arishtam for chronic deep-seated abscesses, fistula-in-ano, and thigh stiffness."
    },
    {
        "name": "Aravindasavam",
        "category_name": "Asavam",
        "classical_reference": "A.F.I. Part 1 Bhaisajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Aravinda", "Ushira", "Kashmari", "Neelotpala"],
        "usage": "5-25 ml twice daily",
        "indications": "Bala roga (Pediatric diseases), Karshya (Emaciation), Balakshaya (Weakness), Atisara (Diarrhoea), Agnimandya (Loss of appetite)",
        "description": "Classical lotus-flower based pediatric restorative boosting immunity, digestion, and physical growth in children."
    },
    {
        "name": "Bhrngarajasavam",
        "category_name": "Asavam",
        "classical_reference": "Gadanigraham",
        "packings": ["450 ml"],
        "ingredients": ["Bhrungaraja", "Haritaki", "Pippali", "Jathi"],
        "usage": "5-25 ml twice daily",
        "indications": "Dhathukshayam (Weakness of dhathu), Panchavidha kasam (Cough), Vandhyatwa (Infertility), Karshya (Emaciation), Kasa (Cough), Keshya (Promotes healthy hair)",
        "description": "Eclipta alba rejuvenator promoting hair health, reproductive vitality, tissue nourishment, and respiratory relief."
    },

    # --- PAGE 8: ASAVAS (Contd.) ---
    {
        "name": "Chandanasavam",
        "category_name": "Asavam",
        "classical_reference": "A.F.I. Part 1 Bhaisajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Chandana", "Hrivera", "Musta", "Gambhari", "Nilotpala"],
        "usage": "5-25 ml twice daily",
        "indications": "Meha (Polyuria), Balakara (Promotes strength), Vahnideepana (Improves digestion), Hridroga (Heart diseases), Fever (Jwara), Daha (Burning sensation)",
        "description": "Cooling sandalwood infusion indicated for burning micturition, polyuria, cardiac palpitation, and Pitta heat."
    },
    {
        "name": "Chavikasavam",
        "category_name": "Asavam",
        "classical_reference": "Yogaratnakara",
        "packings": ["450 ml"],
        "ingredients": ["Chavika", "Chitraka", "Bashpika"],
        "usage": "5-25 ml twice daily",
        "indications": "Agnimandya (Loss of appetite), Pandu (Anaemia), Peenasa (Rhinitis), Kasam (Cough), Kshayam (Weakness)",
        "description": "Deeply warming digestive stimulant indicated for sluggish metabolism, allergic rhinitis, and anemia."
    },
    {
        "name": "Gulgulwasavam",
        "category_name": "Asavam",
        "classical_reference": "Gadanigraham",
        "packings": ["450 ml"],
        "ingredients": ["Harithaki", "Vibhitaki", "Amalaki", "Guggulu"],
        "usage": "5-25 ml twice daily",
        "indications": "Udararoga (Abdominal diseases), Pleeha (Spleenic disorders), Urusthamba (Stillness of legs), Kamala (Jaundice)",
        "description": "Triphala and Guggulu fermented elixir for lipid clearing, abdominal distention, and splenomegaly."
    },
    {
        "name": "Kanakasavam",
        "category_name": "Asavam",
        "classical_reference": "A.F.I. Part 1 Bhaisajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Kanaka", "Vasa", "Yashtimadhu", "Magadhi"],
        "usage": "5-25 ml twice daily",
        "indications": "Swasa (Respiratory diseases), Kasa (Cough), Kshathaksheena (Traumatic injuries), Jwara (Fever), Rakthapitha (Bleeding disorders)",
        "description": "Potent antispasmodic bronchodilator for bronchial asthma, chronic cough, and chest trauma."
    },
    {
        "name": "Kumaryasavam",
        "category_name": "Asavam",
        "classical_reference": "A.F.I. Part 1 Sarngadhara Samhitha",
        "packings": ["450 ml"],
        "ingredients": ["Kumari", "Sunti", "Maricha", "Pippali"],
        "usage": "5-25 ml twice daily",
        "indications": "Udara (Ascitis), Kshaya (Weakness), Udhavarta, Muthrakrcchra (Dysuria), Krimi (Worm infestation), Rakthapitha (Bleeding disorders)",
        "description": "Aloe vera hepatic and digestive elixir for hepatomegaly, female endocrine balance, and urinary disorders."
    },
    {
        "name": "Lodhrasavam",
        "category_name": "Asavam",
        "classical_reference": "A.F.I. Part 1 Ashtamgahrudayam",
        "packings": ["450 ml"],
        "ingredients": ["Lodhra", "Murva", "Shati", "Vella"],
        "usage": "5-25 ml twice daily",
        "indications": "Meha (Polyuria), Pandu (Anemia), Garbashayaroga (Uterine diseases), Arshas (Heamorrhoids), Pleeha (Splenic disorders), Kandu (Itching)",
        "description": "Symplocos racemosa astringent formulation indicated for excessive vaginal discharges, menorrhagia, and metabolic anemia."
    },
    {
        "name": "Lohasavam",
        "category_name": "Asavam",
        "classical_reference": "A.F.I. Part 1 Sarangadhara Samhitha",
        "packings": ["450 ml"],
        "ingredients": ["Loha", "Sunti", "Maricha", "Pippali"],
        "usage": "5-25 ml twice daily",
        "indications": "Pandu (Anemia), Sotha (Oedema), Gulma (Chronic obstructive diseases), Arshas (Heomorrhoids), Swasa (Respiratory diseases)",
        "description": "Natural bio-available iron-infusion elixir for microcytic anemia, systemic swelling, and respiratory fatigue."
    },
    {
        "name": "Mruthasanjeevani",
        "category_name": "Asavam",
        "classical_reference": "A.F.I. Part 1 Bhaishajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Babbula", "Dadima", "Vasa twak", "Mocha"],
        "usage": "5-25 ml twice daily",
        "indications": "Vatharoga (Vatha predominant diseases), Vishuchika (Abdominal colic), Jwara (Fever), Karshya (Emaciation)",
        "description": "Potent classical restorative and circulatory stimulant reviving vital energy after debilitating acute illnesses."
    },
    {
        "name": "Nalikerasavam",
        "category_name": "Asavam",
        "classical_reference": "A.F.I. Part 3 Gadanigraham",
        "packings": ["450 ml"],
        "ingredients": ["Nalikera jala", "Shalmali rasa", "Ikshu rasa"],
        "usage": "5-25 ml twice daily",
        "indications": "Napumsakata (Impotency), Palitha (Greying of hair), Valitham (Wrinkles on skin), Daha (Burning sensation)",
        "description": "Rejuvenative coconut-water based tonic promoting youthful skin tone, virility, and combating premature aging."
    },
    {
        "name": "Nimbamruthasavam",
        "category_name": "Asavam",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["450 ml"],
        "ingredients": ["Nimba", "Amrutha", "Vrusha", "Patola"],
        "usage": "5-25 ml twice daily",
        "indications": "Vatharoga (Diseases of vatha localised in the Asthi, Santhi and Majja), Kushta (Skin diseases), Nadivruna (Sinus ulcers), Vatharaktha (Gout)",
        "description": "Neem and Guduchi fermented tonic targeting deep-seated bone, marrow, and connective tissue inflammatory ailments."
    },

    # --- PAGE 9: ASAVAS & ARKAM ---
    {
        "name": "Pippalyasavam",
        "category_name": "Asavam",
        "classical_reference": "A.F.I. Part 1 Sarngadhara Samhitha",
        "packings": ["450 ml"],
        "ingredients": ["Pippali", "Maricha", "Chavya", "Haridra"],
        "usage": "5-25 ml twice daily",
        "indications": "Kshaya (Weakness), Gulma (Chronic obstructive disease), Udara (Ascitis), Karshya (Emaciation), Grahani (Sprue syndrome), Mandagni (Loss of appetite)",
        "description": "Long pepper based carminative targeting gastrointestinal stasis, wasting syndromes, and malabsorption."
    },
    {
        "name": "Poothikasavam",
        "category_name": "Asavam",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["450 ml"],
        "ingredients": ["Poothika", "Pippali", "Maricha"],
        "usage": "5-25 ml twice daily",
        "indications": "Udara (Ascitis), Pleeharoga (Splenic disorders), Gulma (Chronic obstructive disorders)",
        "description": "Classical Holoptelea integrifolia infusion for abdominal enlargement, splenomegaly, and mesenteric obstructions."
    },
    {
        "name": "Punarnavasavam",
        "category_name": "Asavam",
        "classical_reference": "A.F.I. Part 1 Bhaisajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Punarnava", "Maricha", "Pippali", "Harithaki"],
        "usage": "5-25 ml twice daily",
        "indications": "Amla pitha (Sour belching), Sotha (Oedema), Udara (Ascitis), Yakrit (For healthy liver)",
        "description": "Boerhavia diffusa diuretic and hepatic protector relieving anasarca, acid reflux, and portal hypertension."
    },
    {
        "name": "Saribadyasavam",
        "category_name": "Asavam",
        "classical_reference": "A.F.I. Part 1 Bhaisajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Sariva", "Musta", "Lodhra"],
        "usage": "5-25 ml twice daily",
        "indications": "Pidaka (Carbuncle), Vataraktha (Gout), Meha (Polyuria), Bhagandara (Fistula in ano)",
        "description": "Hemidesmus indicus blood cleansing preparation for painful diabetic carbuncles, gout, and rectal fistula."
    },
    {
        "name": "Usheerasavam",
        "category_name": "Asavam",
        "classical_reference": "A.F.I. Part 1 Bhaisajya Ratnavali",
        "packings": ["450 ml"],
        "ingredients": ["Ushira", "Hrivera", "Padma", "Kashmarya"],
        "usage": "5-25 ml twice daily",
        "indications": "Rakthapitha (Bleeding disorders), Pandu (Anaemia), Kushta (Skin diseases), Premeha (Polyuria)",
        "description": "Vetiver cooling infusion effective against hemorrhages, hematuria, skin inflammations, and anemia."
    },
    {
        "name": "Mahisha Dravakam",
        "category_name": "Arkam",
        "classical_reference": "Ayurveda proprietary medicine",
        "packings": ["450 ml"],
        "ingredients": ["Dusparsha", "Rasna", "Eranda", "Vasa"],
        "usage": "20 ml two or three times a day with or without proper kashayam",
        "indications": "Kati Shoolam (Low back ache), Angamarda (Body pain), Vatharoga (Vatha predominant diseases)",
        "description": "Aromatic distilled medicinal arkam for rapid relief in lumbar spinal pain, generalized body ache, and neuromuscular stiffness."
    },

    # --- PAGE 10: BHASMAM / KSHARAMS & CHOORNAMS ---
    {
        "name": "Aviltholadi Bhasmam",
        "category_name": "Bhasmas / Ksharams",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 g"],
        "ingredients": ["Puthikatwak", "Apamarga", "Danthi", "Arka"],
        "usage": "1 g at a time mixed with hot water",
        "indications": "Sopha (Oedema), Gulma (Chronic obstructive disorders), Udara (Ascitis)",
        "description": "Alkaline botanical ash formulation for rapid reduction of intractable ascites, edema, and abdominal lumps."
    },
    {
        "name": "Kalyana Ksharam",
        "category_name": "Bhasmas / Ksharams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 g"],
        "ingredients": ["Saindhava", "Samudra lavana", "Vidalavana"],
        "usage": "1 g with ghee or warm water",
        "indications": "Udavartha (Upward movement of vatha), Vibanda (Constipation), Arshas (Haemorrhoids), Gulma (Chronic obstructive disorders), Pandu (Anemia)",
        "description": "Alkaline mineral-herb formulation addressing retrograde Vata motion, constipation, piles, and digestive tumors."
    },
    {
        "name": "Aparajitha Dhoopa Choornam",
        "category_name": "Choornams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 g"],
        "ingredients": ["Pura", "Dhyama", "Vacha", "Sarjarasam"],
        "usage": "Used for fumigation",
        "indications": "Used for fumigation, air sterilization, fever management, and warding off airborne pathogens",
        "description": "Classical aromatic antimicrobial fumigation powder for purifying clinical sickrooms and sanitizing living environments."
    },
    {
        "name": "Ashtachoornam",
        "category_name": "Choornams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 g"],
        "ingredients": ["Sunti", "Maricha", "Pippali", "Ajamoda"],
        "usage": "To be taken with first morsel of food with ghee",
        "indications": "Agnimandya (Loss of appetite), Gulma (Chronic obstructive diseases), Vatharoga (Vatha predominant diseases)",
        "description": "Eight-spice carminative appetizer taken with the first morsel of warm rice to kindle gastric Agni and relieve gas."
    },
    {
        "name": "Aswagandha Choornam",
        "category_name": "Choornams",
        "classical_reference": "Yogatharangini",
        "packings": ["50 g"],
        "ingredients": ["Aswagandha"],
        "usage": "5-10 g or as directed by the Physician",
        "indications": "Karshya (Emaciation), Ksheena (Weakness), Vajikaranam (Aphrodisiac), Anidra (Sleeping disorders)",
        "description": "Single-herb Withania somnifera powder delivering restorative adaptogenic nourishment, sleep enhancement, and vigor."
    },
    {
        "name": "Aswagandhadi Choornam",
        "category_name": "Choornams",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 g"],
        "ingredients": ["Aswagandha", "Lavanga", "Nagakesara", "Ela"],
        "usage": "5-10 g or as directed by the Physician",
        "indications": "Vatharoga (Vatha predominant diseases), Pandu (Anaemia), Gulma (Chronic obstructive diseases), Kshaya (Weakness), Arochaka (Anorexia)",
        "description": "Synergistic Ashwagandha compound with aromatic cardiotonics for physical wasting, anemia, and anorexia."
    },
    {
        "name": "Avipathi Choornam",
        "category_name": "Choornams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 g"],
        "ingredients": ["Maricha", "Sunti", "Pippali", "Trivrit"],
        "usage": "5-10 g with hot water early morning",
        "indications": "Muthrakrcchra (Dysuria), Jwara (Fever), Chardi (Vomiting), Sosha (Emaciation), Pandu (Anaemia), Mandagni (Loss of appetite), Kshaya (Weakness), Vibanda (Constipation)",
        "description": "Gentle Pitta-purgative powder indicated for hyperacidity, bilious vomiting, dysuria, and gentle daily bowel regulation."
    },

    # --- PAGE 11: CHOORNAMS (Contd.) ---
    {
        "name": "Dadimashtaka Choornam",
        "category_name": "Choornams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 g"],
        "ingredients": ["Thavakshiri", "Patra", "Twak", "Dadima"],
        "usage": "5-10 g twice daily or as directed by the Physician",
        "indications": "Atisara (Diarrhoea), Grahani (Sprue syndrome), Pandu (Anemia)",
        "description": "Pomegranate-based bowel astringent and digestive tonic for chronic diarrhea, irritable bowel, and sprue."
    },
    {
        "name": "Eladi Choornam",
        "category_name": "Choornams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 g"],
        "ingredients": ["Ela", "Thurushka", "Kushta", "Tagara"],
        "usage": "For external application only",
        "indications": "Visha (Toxins), Vathakapha hara (Vatha and Kapha predominant diseases), Kandu (Itching), Pidaka (Carbuncles)",
        "description": "Aromatic cardamomic topical powder mixed with water or buttermilk to treat pruritus, carbuncles, and urticaria."
    },
    {
        "name": "Gokshura Choornam",
        "category_name": "Choornams",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 g"],
        "ingredients": ["Gokshura"],
        "usage": "1 tsp with hot water",
        "indications": "Mutrakrcchra (Dysuria), Improves strength and vitality in men, Renal support",
        "description": "Tribulus terrestris powder supporting renal filtration, urinary ease, and male reproductive vitality."
    },
    {
        "name": "Gruhadhoomadi Choornam",
        "category_name": "Choornams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 g"],
        "ingredients": ["Gruhadhooma", "Vacha", "Kushta"],
        "usage": "For external application only",
        "indications": "Vatharaktha (Gout), Sopha (Oedema)",
        "description": "Traditional topical anti-inflammatory paste for relieving excruciating joint pain in acute gouty flares."
    },
    {
        "name": "Guggulu Panchapala Choornam",
        "category_name": "Choornams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 g"],
        "ingredients": ["Guggulu", "Magadhika", "Harithaki", "Vibhitaki", "Amalaki"],
        "usage": "5-10 g mixed with honey, hot water",
        "indications": "Gulma (Chronic obstructive diseases), Kushta (Skin diseases), Bhagandara (Fistula in ano)",
        "description": "Five-part Guggulu powder formulated for clearing non-healing sinuses, skin lesions, and abdominal tumors."
    },
    {
        "name": "Hinguvachadi Choornam",
        "category_name": "Choornams",
        "classical_reference": "A.F.I. Part 1 Ashtamgahrudayam",
        "packings": ["50 g"],
        "ingredients": ["Hingu", "Vacha", "Haritaki", "Pasugandha"],
        "usage": "5-10 g mixed with honey, hot water",
        "indications": "Hrud parshva vasthi trika yoni payu Shoolamni (Colicky pain in chest region, genito urinary region, sacral region)",
        "description": "Asafoetida and Acorus powder relieving excruciating radiating colicky pain across the chest, flanks, bladder, and pelvis."
    },
    {
        "name": "Jatamayadi Choornam",
        "category_name": "Choornams",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 g"],
        "ingredients": ["Jatamamsi", "Kushta", "Chandana"],
        "usage": "For external application only",
        "indications": "Daha (Burning sensation), Sopha (Oedema), Vatharaktha (Gout), Sandhi Sopham (Joint inflammation)",
        "description": "Cooling analgesic herbal paste for external application over swollen, hot, burning arthritic joints."
    },
    {
        "name": "Kapikachu Choornam",
        "category_name": "Choornams",
        "classical_reference": "API Part 1 Vol 4",
        "packings": ["50 g"],
        "ingredients": ["Kapikachu"],
        "usage": "5-10 g mixed with honey, hot water",
        "indications": "Vatharogam (Vatha predominant), Vajikarana (Aphrodisiac), Neuro-motor support",
        "description": "Pure Mucuna pruriens seed powder supplying natural L-DOPA for nervous stability and spermatogenic rejuvenation."
    },
    {
        "name": "Karpooradi Choornam",
        "category_name": "Choornams",
        "classical_reference": "A.F.I. Part 1 Sahasrayogam",
        "packings": ["50 g"],
        "ingredients": ["Karpooram", "Chocha", "Jatiphalam", "Thakkolam"],
        "usage": "For internal use only",
        "indications": "Hridyamrochanam (Improves appetite), Kasa (Cough), Swasa (Respiratory diseases), Aruchi (Anorexia), Jwara (Fever)",
        "description": "Camphoraceous digestive and respiratory powder easing bronchial spasm and restoring taste and salivation."
    },
    {
        "name": "Kolakulathadi Choornam",
        "category_name": "Choornams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 g"],
        "ingredients": ["Kola", "Kulatha", "Amaradaru", "Yava"],
        "usage": "For external application only (Udvartana / Lepa)",
        "indications": "Vatharoga (Vatha predominant diseases like Pakshaghatha, Arditha etc for external applications), Dry powder massage (Udhvarthana) in medoroga (To reduce excess fat)",
        "description": "Coarse herbal formulation used for therapeutic dry powder massage (Udvartana) to break down cellulite and subcutaneous fat."
    },
    {
        "name": "Kottamchukkadi Choornam",
        "category_name": "Choornams",
        "classical_reference": "Sahasrayogam",
        "packings": ["100 g", "500 g"],
        "ingredients": ["Kushta", "Sunti", "Vacha", "Shigru"],
        "usage": "For external application only, made into a paste with juice of tamarind leaves and apply over the affected area",
        "indications": "Vathavyadhi (Vatha predominant diseases), Sandhi shopham (Joint oedema)",
        "description": "Classical Saussurea and Ginger paste mixed with tamarind leaf extract to dramatically relieve joint inflammation and swelling."
    },

    # --- PAGE 12: CHOORNAMS (Contd.) ---
    {
        "name": "Lodhradi Choornam",
        "category_name": "Choornams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 g"],
        "ingredients": ["Lodhra", "Sevya", "Padmaka", "Padmarenu"],
        "usage": "For internal and external use",
        "indications": "Lutha visha (Spider poison), Kita visha (Insect bites), Skin toxicity",
        "description": "Anti-venomous and anti-toxic herbal formulation neutralizing localized insect bites, spider toxins, and dermatitis."
    },
    {
        "name": "Nagaradi lepa Choornam",
        "category_name": "Choornams",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 g"],
        "ingredients": ["Sunti", "Kumari sara", "Vacha", "Laksha"],
        "usage": "For external application only",
        "indications": "Abhighathaja Sopham (Traumatic oedema), Sprains, Blunt trauma",
        "description": "Trauma-care herbal paste applied externally over acute sprains, contusions, and traumatic swelling."
    },
    {
        "name": "Nimbadi Choornam",
        "category_name": "Choornams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 g"],
        "ingredients": ["Nimba", "Haridra", "Daruharidra", "Surasa"],
        "usage": "For external application only",
        "indications": "Kandu (Itching), Pidaka (Carbuncles), Kota (Allergic manifestation), Kushta (Skin diseases), Udarda (Urticaria)",
        "description": "Neem and turmeric topical cleansing powder relieving severe allergic urticaria, pruritus, and infected pustules."
    },
    {
        "name": "Nisamalaka Choornam",
        "category_name": "Choornams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 g"],
        "ingredients": ["Nisa", "Amalaki"],
        "usage": "5-10 g twice daily or as directed by the Physician",
        "indications": "Prameha (Polyuria), Diabetes mellitus, Blood sugar stabilization",
        "description": "Premier anti-diabetic botanical duo of Haridra and Amalaki protecting microvascular circulation and glycemic health."
    },
    {
        "name": "Panchakola Choornam",
        "category_name": "Choornams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 g"],
        "ingredients": ["Pippali", "Pippalimoola", "Chavya", "Chitraka", "Nagara"],
        "usage": "5-10 g twice daily, mixed with honey/hot water",
        "indications": "Gulma (Chronic obstructive diseases), Shoolam (Colicy pain), Agnideepanam (Appetizer), Aruchi (Anorexia)",
        "description": "The five pungent roots formulation boosting Agni, clearing Ama toxins, and easing abdominal gas and colic."
    },
    {
        "name": "Pushyanuga Choornam",
        "category_name": "Choornams",
        "classical_reference": "A.F.I. Part 1 Bhaisajya Ratnavali",
        "packings": ["50 g"],
        "ingredients": ["Patha", "Jambu beeja majja", "Daruharidra", "Amra beeja majja"],
        "usage": "5-10 g twice daily with honey, or as directed by the Physician",
        "indications": "Raktha Atisara (Dysentery), Swetha pradharam (Leucorrhoea), Menorrhagia",
        "description": "Renowned astringent and hemostatic formulation targeting excessive vaginal discharges, dysfunctional uterine bleeding, and colitis."
    },
    {
        "name": "Rajanyadi choornam",
        "category_name": "Choornams",
        "classical_reference": "A.F.I. Part 1 Ashtamgahrudayam",
        "packings": ["50 g"],
        "ingredients": ["Rajani", "Devadaru", "Sarala", "Sreyasi"],
        "usage": "As directed by the Physician",
        "indications": "Atisara (Diarrhoea), Grahani (Sprue syndrome), Jwara (Fever), Pandu (Anaemia)",
        "description": "Turmeric-centered pediatric formulation protecting against diarrheal illnesses, fever, and childhood indigestion."
    },
    {
        "name": "Rasnadi Choornam",
        "category_name": "Choornams",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 g", "10 g", "30 Nos"],
        "ingredients": ["Rasna", "Aswagandha", "Devadaru", "Katvi"],
        "usage": "For external application only (rubbed onto scalp crown / Tala)",
        "indications": "ShirasThotha (Headache), Prathishyaya (Rhinitis), Cold prevention after head bath",
        "description": "Essential Kerala scalp powder rubbed on the vertex after bathing to prevent upper respiratory colds and sinus headaches."
    },
    {
        "name": "Shaddharana Choornam",
        "category_name": "Choornams",
        "classical_reference": "Baishajyaratnavali",
        "packings": ["50 g"],
        "ingredients": ["Chitraka", "Indrayava", "Patha"],
        "usage": "5-10 g twice daily or as directed by the Physician",
        "indications": "Mahavyadhis (Vatha predominant diseases), Kushta (Skin diseases), Meha (Polyuria), Bhagandara (Fistula in ano), Vatharaktha (Gout), Vatharoga (Vatha predominant diseases)",
        "description": "Powerful six-herb combination indicated in obstinate neurological disorders, chronic gout, metabolic disorders, and fistula."
    },
    {
        "name": "Sigrupunarnavadi Choornam",
        "category_name": "Choornams",
        "classical_reference": "Ayurveda proprietary medicine",
        "packings": ["50 g"],
        "ingredients": ["Shigru", "Punarnava", "Haridra", "Vacha"],
        "usage": "For external application only. Mix with boiled dhanyamla, make a paste and apply on the oedema allow to dry",
        "indications": "Sopha (Oedema) and Shoolam (Pain) in insect bites, Acute inflammatory swellings",
        "description": "Moringa and Boerhavia poultice powder mixed with fermented grain water to resolve acute inflammatory edema and toxic stings."
    },

    # --- PAGE 13: CHOORNAMS & GULIKAS ---
    {
        "name": "Sudarsana Choornam",
        "category_name": "Choornams",
        "classical_reference": "Sahasrayogam",
        "packings": ["50 g"],
        "ingredients": ["Harithaki", "Vibhitaki", "Amalaki", "Haridra", "Musta", "Kiratatikta"],
        "usage": "5-10 g with hot water twice daily",
        "indications": "Tridoshahara (Pacifies all three doshas), Swasa (Respiratory diseases), Kasa (Cough), Jwara (Fever), Pleeharoga (Splenic disorders)",
        "description": "Famous 53-ingredient bitter formulation for all chronic and infectious fevers, liver disorders, and splenic enlargement."
    },
    {
        "name": "Thaleesapatradi Choornam",
        "category_name": "Choornams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 g"],
        "ingredients": ["Thaleesa", "Maricha", "Nagara", "Pippali"],
        "usage": "5 g to be dissolved in mouth at frequent intervals",
        "indications": "Agnideepanam (Appetizer), Kasa (Cough), Swasa (Respiratory diseases), Aruchi (Anorexia), Chardi (Vomiting)",
        "description": "Talispatra aromatic lozenge powder dissolved slowly in the mouth to soothe irritable cough, asthma, and nausea."
    },
    {
        "name": "Thriphala Choornam",
        "category_name": "Choornams",
        "classical_reference": "A.F.I. Part 1 Bhavaprakasha",
        "packings": ["50 g"],
        "ingredients": ["Harithaki", "Vibhitaki", "Amalaki"],
        "usage": "5-10 g twice daily",
        "indications": "Tridoshahara, Jwara (Fever), Aruchi (Anorexia), Mandagni (Loss of appetite), Kushta (Skin diseases)",
        "description": "Foundational three-myrobalan Rasayana balancing all three doshas, supporting ocular health, bowel regularity, and cellular longevity."
    },
    {
        "name": "Vaiswanara choornam",
        "category_name": "Choornams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 g"],
        "ingredients": ["Saindhava lavana", "Yavani", "Ajamoda", "Pippali"],
        "usage": "5-10 g twice daily in hot water or buttermilk",
        "indications": "Agnimandya (Loss of appetite), Vibanda (Constipation)",
        "description": "Digestive salt and carminative seed blend stimulating sluggish gastrointestinal peristalsis and clearing fecal impaction."
    },
    {
        "name": "Vidangathandulathi Choornam",
        "category_name": "Choornams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 g"],
        "ingredients": ["Vidanagathandula", "Harithaki", "Vibhithaki", "Amalaki"],
        "usage": "5-12 g mixed with honey, ghee, jaggery",
        "indications": "Gulma (Chronic obstructive diseases), Kaphavatha roga (Kapha and Vatha predominant diseases)",
        "description": "Antiparasitic and metabolic clarifying powder targeting abdominal masses, sluggish digestion, and Kapha congestion."
    },
    {
        "name": "Yashtitriphala Choornam",
        "category_name": "Choornams",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["50 g"],
        "ingredients": ["Yashtimadhu", "Harithaki", "Vibhithaki", "Amalaki"],
        "usage": "5-12 g mixed with honey",
        "indications": "Vibanda (Constipation), Nethra rogas (Ophthalmic diseases), Udara roga (Abdominal diseases)",
        "description": "Licorice and Triphala synergy providing gentle laxation, mucosal rejuvenation, and ocular nourishment."
    },
    {
        "name": "Arogyavardhini gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "A.F.I. Part 1 Rasa Ratna Samuchayam",
        "packings": ["100 Nos."],
        "ingredients": ["Shuddha Paradha", "Shuddha Gandhaka", "Loha bhasma", "Abraka bhasma", "Triphala"],
        "usage": "Internal",
        "indications": "Skin diseases, Dyslipidemia, Obesity, Jwara",
        "description": "Celebrated herbo-mineral tablet for liver detox, lipid management, eczema, and metabolic restoration."
    },
    {
        "name": "Arogyavardhini gulika tablets",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "A.F.I. Part 1 Rasa Ratna Samuchayam",
        "packings": ["60 Nos."],
        "ingredients": ["Shuddha Paradha", "Shuddha Gandhaka", "Loha bhasma", "Abraka bhasma", "Triphala"],
        "usage": "Internal",
        "indications": "Skin diseases, Dyslipidemia, Obesity, Jwara",
        "description": "Modern compressed tablet form of Arogyavardhini for precise clinical dosing in hepatobiliary and metabolic disorders."
    },
    {
        "name": "Chandraprabha gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Bhaisajya Ratnavali",
        "packings": ["100 Nos."],
        "ingredients": ["Chandraprabha", "Vacha", "Musta", "Bhunimba"],
        "usage": "Internal",
        "indications": "Polyuria, Dysuria, Renal Calculi, Anuria, Hydrocele, Anemia",
        "description": "Premier genito-urinary rejuvenating pill supporting renal excretion, clearing urinary tract inflammation, and reducing prostate discomfort."
    },
    {
        "name": "Chandraprabha gulika tablets",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Bhaisajya Ratnavali",
        "packings": ["50 Nos."],
        "ingredients": ["Chandraprabha", "Vacha", "Musta", "Bhunimba"],
        "usage": "Internal",
        "indications": "Polyuria, Dysuria, Renal Calculi, Anuria, Hydrocele, Anaemia",
        "description": "Standardized tableted Chandraprabha formulation for diabetic urinary complications and calculi prevention."
    },

    # --- PAGE 14: GULIKAS (Contd.) ---
    {
        "name": "Chukkumthippalyadi gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Sahasrayogam",
        "packings": ["100 Nos."],
        "ingredients": ["Chukku", "Pippali", "Chenninayakam", "Vacha"],
        "usage": "Internal",
        "indications": "Fever, Cough, Respiratory disease",
        "description": "Acute respiratory pill quickly reducing febrile chills, productive cough, and mucosal congestion."
    },
    {
        "name": "Dhanwantharam gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "A.F.I. Part 1 Sahasrayogam",
        "packings": ["100 Nos."],
        "ingredients": ["Ela", "Viswa", "Haritaki", "Jathiphala"],
        "usage": "Internal",
        "indications": "Tuberculosis, Hiccups, Vomiting, Respiratory diseases, Cough, Abdominal colic, Abdominal distension",
        "description": "Celebrated multi-indication carminative and anti-emetic pill for gastric bloating, intractable hiccups, and chest tightness."
    },
    {
        "name": "Dhanwantharam gulika tablets",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Sahasrayogam",
        "packings": ["100 Nos."],
        "ingredients": ["Ela", "Viswa", "Haritaki", "Jathiphala"],
        "usage": "Internal",
        "indications": "Tuberculosis, Hiccups, Vomiting, Respiratory diseases, Cough, Abdominal colic, Vomiting, Abdominal distension",
        "description": "Tablet format of Dhanwantharam gulika for convenient clinical administration in pregnancy vomiting and gastrointestinal spasms."
    },
    {
        "name": "Dooshivishari gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["100 Nos."],
        "ingredients": ["Pippali", "Pippali mula", "Gajapippali", "Dhyamaka"],
        "usage": "Internal",
        "indications": "Mild poisoning, Skin diseases, Cumulative latent toxins (Dushivisha)",
        "description": "Renowned anti-toxin formulation neutralizing chronic latent chemical and biological toxicity affecting the skin and blood."
    },
    {
        "name": "Dooshivishari gulika tablets",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["60 Nos."],
        "ingredients": ["Pippali", "Pippali mula", "Gajapippali", "Dhyamaka"],
        "usage": "Internal",
        "indications": "Mild poisoning, Skin diseases, Chronic auto-toxic reactions",
        "description": "Tableted antitoxic medicine for allergic food reactions, dermatitis, and slow-acting systemic poisons."
    },
    {
        "name": "Gopichandanadi gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Arogyakalpadrumam",
        "packings": ["100 Nos."],
        "ingredients": ["Ushira", "Sariva", "Hrivera", "Triphala"],
        "usage": "Internal",
        "indications": "Fever, Upper Respiratory infections",
        "description": "Mild, soothing pediatric and adult formulation for respiratory catarrh, viral fevers, and inflamed pharynx."
    },
    {
        "name": "Gorochanadi gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "A.F.I. Part 1 Vaidyayogatharangini",
        "packings": ["100 Nos."],
        "ingredients": ["Gorochanam", "Chandana", "Rudraksha", "Vacha"],
        "usage": "Internal",
        "indications": "All types of fever, Epilepsy, Respiratory diseases",
        "description": "Precious neuro-protective formulation for hyperpyrexia, convulsions, febrile delirium, and respiratory distress."
    },
    {
        "name": "Gorochanadi gulika tablets",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "A.F.I. Part 1 Vaidyayogatharangini",
        "packings": ["100 Nos."],
        "ingredients": ["Gorochanam", "Chandana", "Rudraksha", "Vacha"],
        "usage": "Internal",
        "indications": "All types of fever, Epilepsy, Respiratory diseases",
        "description": "Standardized tablet dosage form of Gorochanadi for acute neuro-pulmonary episodes and fevers."
    },
    {
        "name": "Hinguvachadi gulika tablet",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Ashtamgahrudayam",
        "packings": ["100 Nos."],
        "ingredients": ["Hingu", "Vacha", "Harithaki"],
        "usage": "Internal",
        "indications": "Colic pain, Pain in sacral region, Pain in urinary bladder, Intercostal neuralgia, Abdominal distention, Chronic obstructive diseases",
        "description": "Convenient tablet form of Hinguvachadi providing rapid relief from pelvic, bladder, and intercostal neuralgic spasms."
    },
    {
        "name": "Kaisora gulgulu gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Bhaisajya Ratnavali",
        "packings": ["100 Nos."],
        "ingredients": ["Guduchi", "Triphala", "Trikatui", "Guggulu"],
        "usage": "Internal",
        "indications": "Gout, Skin diseases, Cough, Ulcers, Chronic obstructive diseases, Swelling",
        "description": "The gold-standard Ayurvedic anti-inflammatory pill for hyperuricemia, gouty arthritis, and stubborn chronic ulcers."
    },
    {
        "name": "Kaisora guggulu gulika tablet",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Bhaisajya Ratnavali",
        "packings": ["50 Nos."],
        "ingredients": ["Guduchi", "Triphala", "Trikatui", "Guggulu"],
        "usage": "Internal",
        "indications": "Gout, Skin diseases, Cough, Ulcers, Chronic obstructive diseases, Swelling",
        "description": "Modern compressed tablet of Kaishore Guggulu for targeted management of joint swelling and inflammatory dermatoses."
    },
    {
        "name": "Kanchanara guggulu gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Bhaisajya Ratnavali",
        "packings": ["100 Nos."],
        "ingredients": ["Kanchanara", "Triphala", "Trikatui", "Guggulu"],
        "usage": "Internal",
        "indications": "Gandamala, Cyst, Ulcers, Chronic obstructive diseases, Skin diseases, Fistula in ano, Obesity",
        "description": "Foremost classical remedy for thyroid nodules, cervical lymphadenitis, fibroids, cysts, and lipomas."
    },

    # --- PAGE 15: GULIKAS (Contd.) ---
    {
        "name": "Kanchanara gulgulu gulika tablet",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Bhaisajya Ratnavali",
        "packings": ["60 Nos."],
        "ingredients": ["Kanchanara", "Triphala", "Trikatui", "Guggulu"],
        "usage": "Internal",
        "indications": "Gandamala, Cyst, Ulcers, Chronic obstructive diseases, Skin diseases, Fistula in ano, Obesity",
        "description": "Standardized tableted Bauhinia variegata formulation for clearing lymphatic stagnation and benign glandular swellings."
    },
    {
        "name": "Kaphakethurasam gulika tablet",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "A.F.I. Part 1 Rasendrasarasamgraha",
        "packings": ["100 Nos."],
        "ingredients": ["Tankana Bhasma", "Pippali", "Shanka bhasma"],
        "usage": "Internal",
        "indications": "Cough, Respiratory diseases, Rhinitis",
        "description": "Fast-acting mineral-herbal decongestant tablet for cutting thick mucous obstructions and acute sinusitis."
    },
    {
        "name": "Karutha vattu",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Sahasrayogam",
        "packings": ["10 Nos."],
        "ingredients": ["Shallaki", "Kanyasaram", "Kannaram"],
        "usage": "Internal / External",
        "indications": "Diseases of head - Different types of headache, External abscess",
        "description": "Specialized Kerala black pill ground with breast milk or water and applied to forehead for migraine, tension headache, and boils."
    },
    {
        "name": "Kasthooryadi gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "A.F.I. Part 1 Sahasrayogam",
        "packings": ["100 Nos."],
        "ingredients": ["Kasturi", "Kirathatiktha", "Rasna", "Loha Bhasma"],
        "usage": "External / Internal",
        "indications": "Diseases with Vatha predominance, Fever with vatha and kapha vitiation, Respiratory diseases",
        "description": "Precious musk and iron compounded pill providing rapid respiratory and cardiac resuscitation in severe febrile crises."
    },
    {
        "name": "Kombanchadi gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Arogyakalpadrumam",
        "packings": ["100 Nos."],
        "ingredients": ["Kiratathikta", "Kankola", "Misreya", "Dronapushpi"],
        "usage": "Internal",
        "indications": "Fever, Cough, Epilepsy, Sprue syndrome, Respiratory diseases",
        "description": "Traditional pediatric and general preparation for infantile convulsive disorders, high fever, and bronchial cough."
    },
    {
        "name": "Krimighna gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Ayurveda proprietary medicine",
        "packings": ["100 Nos."],
        "ingredients": ["Lashuna", "Hingu", "Nirgundi"],
        "usage": "Internal",
        "indications": "Intestinal worm infestation, Enterobiasis, Ascariasis",
        "description": "Potent garlic, asafoetida, and vitex vermifuge expelling all classes of intestinal worms and relieving perianal itching."
    },
    {
        "name": "Manasamithram gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "A.F.I. Part 1 Sahasrayogam",
        "packings": ["100 Nos."],
        "ingredients": ["Bala", "Nagabala", "Bilva", "Prisniparni", "Pravala pishti"],
        "usage": "Internal",
        "indications": "Psychiatric diseases, Epilepsy, Speech disorders, Stress, Anxiety",
        "description": "Crown jewel of Ayurvedic psychotropic formulations calming panic, severe anxiety, insomnia, and cognitive disturbances."
    },
    {
        "name": "Manasamithram gulika tablets",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "A.F.I. Part 1 Sahasrayogam",
        "packings": ["60 Nos."],
        "ingredients": ["Bala", "Nagabala", "Bilva", "Prisniparni", "Pravala pishti"],
        "usage": "Internal",
        "indications": "Psychiatric diseases, Epilepsy, Speech disorders, Stress, Anxiety",
        "description": "Standardized tableted format of Manasamitra Vatakam for clinical psychiatric and psychosomatic therapy."
    },
    {
        "name": "Nirgundyadi gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Arogyakalpadrumam",
        "packings": ["100 Nos."],
        "ingredients": ["Nirgundi", "Murva", "Shanapushpi", "Dronapushpi"],
        "usage": "Internal",
        "indications": "Sprue syndrome, Abdominal colic, Fever, Loss of appetite, Diarrhoea, Worm infestation",
        "description": "Vitex negundo compound resolving infantile and adult bowel colic, chronic enteritis, and parasite burden."
    },
    {
        "name": "Ponkaradi gulika",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Sahasrayogam",
        "packings": ["100 Nos."],
        "ingredients": ["Jeeraka", "Vacha", "Kuberaksha", "Lashuna"],
        "usage": "Internal",
        "indications": "Abdominal colic, Loss of appetite, Diarrhoea, Abdominal disease",
        "description": "Borax and cumin formulation rapidly relieving painful spasmodic intestinal cramps and chronic loose stools."
    },
    {
        "name": "Rajapravartini vati tablet",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Bhaisajya Ratnavali",
        "packings": ["100 Nos."],
        "ingredients": ["Kanyasaram", "Kasisa", "Hingu", "Tankana"],
        "usage": "Internal",
        "indications": "Amenorrhea, Dysmenorrhea, Oligomenorrhea",
        "description": "Premier emmenagogue formulation initiating delayed menses and relieving debilitating spasmodic dysmenorrhea."
    },
    {
        "name": "Shaddharanam capsules",
        "category_name": "Gulika, Gulika Tablets, Capsules",
        "classical_reference": "Ashtangasangraham",
        "packings": ["50 Nos."],
        "ingredients": ["Darvi", "Kutaja", "Katuka", "Ativisha", "Chitraka"],
        "usage": "Internal",
        "indications": "Ascitis, Chronic obstructive diseases, Skin diseases, Gout, Sprue syndrome, Polyuria, Rheumatism",
        "description": "Modern encapsulated presentation of Shaddharana formulation for Rheumatoid arthritis, Gout, and refractory skin conditions."
    }
]

def normalize_text(text: str) -> str:
    """Normalize text for reliable fuzzy comparison."""
    t = text.lower()
    # Normalize common transliteration variants
    t = t.replace('th', 't').replace('sh', 's').replace('oo', 'u').replace('ee', 'i').replace('aa', 'a')
    return re.sub(r'[^a-z0-9]', '', t)

def generate_slug(name: str) -> str:
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    return slug

def main():
    supabase_url = os.environ.get("SUPABASE_URL", "https://ksnsfilauqzxsegpjpdt.supabase.co").rstrip("/")
    supabase_key = os.environ.get("SUPABASE_ANON_KEY", "").strip()

    if not supabase_key:
        cfg_file = "data/supabase_config.json"
        if os.path.exists(cfg_file):
            with open(cfg_file, "r") as f:
                c = json.load(f)
                supabase_url = c.get("url", supabase_url).rstrip("/")
                supabase_key = c.get("key", "")

    if not supabase_key:
        print("ERROR: Supabase key not found.")
        return

    print(f"Connecting to Supabase at: {supabase_url}")

    # Fetch existing products from Supabase
    fetch_req = urllib.request.Request(
        f"{supabase_url}/rest/v1/products?select=id,name,code,category_name",
        headers={
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}"
        }
    )

    with urllib.request.urlopen(fetch_req) as resp:
        existing_products = json.loads(resp.read().decode())

    print(f"Total existing products in Supabase: {len(existing_products)}")

    # Build normalized lookup map of existing products
    existing_lookup = {}
    for p in existing_products:
        n = normalize_text(p.get("name", ""))
        existing_lookup[n] = p

    # Find highest existing code index
    max_code_num = 100
    for p in existing_products:
        code = p.get("code", "")
        m = re.search(r'SA-(\d+)', code)
        if m:
            val = int(m.group(1))
            if val > max_code_num:
                max_code_num = val

    print(f"Starting code index: SA-{max_code_num + 1:05d}")

    to_insert = []
    skipped = []

    for item in MEDICINES_DATA:
        norm_name = normalize_text(item["name"])

        # Check if already present in Supabase
        if norm_name in existing_lookup:
            matched = existing_lookup[norm_name]
            skipped.append((item["name"], matched["name"], matched.get("code")))
            continue

        # Check for close matches like "Amritarishtam" vs "Amrutharishtam", "Ashokarishtam" vs "Asokarishtam"
        # If it contains exact root
        is_dup = False
        for ext_norm, ext_prod in existing_lookup.items():
            if norm_name == ext_norm or (len(norm_name) > 6 and (norm_name in ext_norm or ext_norm in norm_name) and item["category_name"] == ext_prod.get("category_name")):
                skipped.append((item["name"], ext_prod["name"], ext_prod.get("code")))
                is_dup = True
                break

        if is_dup:
            continue

        max_code_num += 1
        new_code = f"SA-{max_code_num:05d}"
        slug = generate_slug(item["name"])

        # Format ingredients array as list of objects
        ing_objs = [{"name": ing.strip()} for ing in item["ingredients"]]

        product_row = {
            "code": new_code,
            "name": item["name"],
            "category_name": item["category_name"],
            "classical_reference": item["classical_reference"],
            "packings": item["packings"],
            "ingredients": ing_objs,
            "dosage": item["usage"],
            "indications": item["indications"],
            "description": item["description"],
            "image_url": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600",
            "status": "Active",
            "featured": False,
            "public_slug": slug,
            "share_qr_link": f"https://ayur-guide-admin-panel.vercel.app/product/{slug}"
        }

        to_insert.append(product_row)
        # Register in lookup so duplicates within input list are also skipped
        existing_lookup[norm_name] = product_row

    print(f"\nSkipped {len(skipped)} medicines already present:")
    for req_name, matched_name, code in skipped:
        print(f"  - '{req_name}' (already in Supabase as '{matched_name}' [{code}])")

    print(f"\nIdentified {len(to_insert)} new authentic medicines to add into Supabase.")

    # Insert into Supabase in batches of 10
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
            # Try inserting one by one to isolate any specific error
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

    print(f"\nSuccessfully populated {inserted_count} new medicines into Supabase Central Database!")

    # Update sitaram_export.json backup as well
    export_path = "data/sitaram_export.json"
    if os.path.exists(export_path):
        try:
            with open(export_path, "r") as f:
                exp_data = json.load(f)
            # Fetch all fresh products from Supabase
            fetch_all_req = urllib.request.Request(
                f"{supabase_url}/rest/v1/products?select=*&order=id.asc",
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}"
                }
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
