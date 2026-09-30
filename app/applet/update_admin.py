import os

meds_js = '''    const initialMedicines = [
      {
        id: "SA-88225",
        code: "SA-88225",
        name: "Dashamoolarishtam",
        sanskritName: "दशमूलारिष्टम् (Ten Sacred Roots)",
        category: "ARI",
        status: "PUBLISHED",
        imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600",
        tagPill: "VITALITY & DETOX",
        healthGoals: ["DETOX", "DIGESTION", "IMMUNITY"],
        benefit: "Post-partum recovery, respiratory strength, digestive fire kindle and deep detox",
        shortDescription: "Traditionally used to support digestion, strength, vitality, and recovery from physical exhaustion.",
        monograph: "Master classical fermented bio-active elixir formulated with Dashamoola (Ten Roots) and Dhataki flowers. Kindles Pachaka Agni, balances Vata and Kapha, and rejuvenates exhausted tissues.",
        contraindications: "Consult Vaidya during active hyperacidity.",
        dosageSummary: "15-25 ml Twice daily after meals with equal quantity of warm water",
        anupana: "Equal volume of warm water",
        classicalRef: "Sharangadhara Samhita",
        rasa: "Tikta (Bitter), Kashaya (Astringent), Madhura (Sweet)",
        virya: "Ushna (Heating)",
        vipaka: "Madhura (Post-digestive sweet)",
        granularIngredients: [
          { sanskrit: "Dashamoola", botanical: "Aegle marmelos & 9 classical roots", ratio: "50% (Decoction base)", part: "Roots", active: "Phytosterols, Flavonoids" },
          { sanskrit: "Draksha", botanical: "Vitis vinifera", ratio: "20%", part: "Dried Fruit", active: "Polyphenols, Bio-nutrients" },
          { sanskrit: "Dhataki", botanical: "Woodfordia fruticosa", ratio: "10%", part: "Flowers", active: "Wild fermentation catalyst" },
          { sanskrit: "Amalaki", botanical: "Emblica officinalis", ratio: "20%", part: "Fruit Pulp", active: "Stable Bio-ascorbate" }
        ]
      },
      {
        id: "SA-00001",
        code: "SA-00001",
        name: "Abhayarishtam",
        sanskritName: "अभयारिष्टम् (Terminalia chebula Formulation)",
        category: "ARI",
        status: "PUBLISHED",
        imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600",
        tagPill: "DIGESTIVE HEALTH",
        healthGoals: ["DIGESTION", "DETOX"],
        benefit: "Arshas (Hemorrhoids), Udara (Abdominal disorders), Vibanda (Constipation), Agnimandya.",
        shortDescription: "Classic Ayurvedic fermented formulation indicated primarily for hemorrhoids, sluggish digestion, and chronic constipation.",
        monograph: "Abhayarishtam is prepared using Haritaki (Abhaya) and fermented herbs. It acts as an effective mild laxative, liver stimulant, and bowel regulator without causing griping or dependency.",
        contraindications: "Diarrhea, dysentery, severe dehydration.",
        dosageSummary: "15 to 25 ml twice daily after meals with equal quantity of warm water",
        anupana: "Equal quantity of warm water",
        classicalRef: "Ashtangahrudayam, Arshorogadhikaram",
        rasa: "Kashaya, Tikta, Madhura",
        virya: "Ushna",
        vipaka: "Madhura",
        granularIngredients: [
          { sanskrit: "Abhaya", botanical: "Terminalia chebula", ratio: "40%", part: "Fruit Rind", active: "Chebulinic acid, Tannins" },
          { sanskrit: "Dhatri", botanical: "Emblica officinalis", ratio: "25%", part: "Fruit", active: "Vitamin C, Emblicanin" },
          { sanskrit: "Kapitha", botanical: "Feronia elephantum", ratio: "15%", part: "Fruit Pulp", active: "Pectin, Organic acids" },
          { sanskrit: "Vishala", botanical: "Citrullus colocynthis", ratio: "20%", part: "Root", active: "Colocynthin" }
        ]
      },
      {
        id: "SA-00002",
        code: "SA-00002",
        name: "Amritarishtam",
        sanskritName: "अमृतारिष्टम् (Guduchi Bio-Ferment)",
        category: "ARI",
        status: "PUBLISHED",
        imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600",
        tagPill: "IMMUNE RESILIENCE",
        healthGoals: ["IMMUNITY", "DETOX"],
        benefit: "Jwara (Chronic & intermittent fevers), Jeerna Jwara, Ajeerna, Yakrit roga (Hepatic sluggishness).",
        shortDescription: "Potent immunomodulatory elixir that detoxifies Ama, strengthens hepatic function, and relieves recurrent pyrexia.",
        monograph: "Amritarishtam uses classical stem decoctions of Amritha (Tinospora cordifolia) naturally fermented with Dhataki flowers and Dashamoola to clear deep metabolic Ama and support liver metabolism.",
        contraindications: "Severe acute hyperacidity or gastric ulceration.",
        dosageSummary: "15 to 25 ml twice daily after food",
        anupana: "Equal volume of lukewarm water",
        classicalRef: "Bhaishajya Ratnavali, Jwaradhikaram",
        rasa: "Tikta, Kashaya",
        virya: "Ushna",
        vipaka: "Madhura",
        granularIngredients: [
          { sanskrit: "Amrita / Guduchi", botanical: "Tinospora cordifolia", ratio: "45%", part: "Mature Stem", active: "Tinosporaside, Cordifolioside" },
          { sanskrit: "Bilva", botanical: "Aegle marmelos", ratio: "20%", part: "Root Bark", active: "Marmelosin" },
          { sanskrit: "Shyonaka", botanical: "Oroxylum indicum", ratio: "20%", part: "Root Bark", active: "Baicalein" },
          { sanskrit: "Dhataki", botanical: "Woodfordia fruticosa", ratio: "15%", part: "Flowers", active: "Fermentation catalyst" }
        ]
      },
      {
        id: "SA-00003",
        code: "SA-00003",
        name: "Ashokarishtam",
        sanskritName: "अशोकारिष्टम् (Uterine Tonic)",
        category: "ARI",
        status: "PUBLISHED",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
        tagPill: "WOMEN WELLNESS",
        healthGoals: ["IMMUNITY", "VITALITY"],
        benefit: "Asrigdara (Menorrhagia), Pradara (Leucorrhea), Katishoola (Low back pain), Shweta Pradara.",
        shortDescription: "Classical uterine tonic indicated for hormonal harmony, excessive menstrual bleeding, and pelvic comfort.",
        monograph: "Formulated with true Ashoka bark and cooling astringents, Ashokarishtam regulates endometrium vascularity, soothes pelvic heaviness, and promotes emotional balance.",
        contraindications: "Contraindicated during active pregnancy.",
        dosageSummary: "15 to 25 ml twice daily after food",
        anupana: "Equal volume of warm water",
        classicalRef: "Bhaishajya Ratnavali, Pradaradhikaram",
        rasa: "Kashaya, Tikta",
        virya: "Sheeta",
        vipaka: "Katu",
        granularIngredients: [
          { sanskrit: "Ashoka", botanical: "Saraca asoca", ratio: "50%", part: "Stem Bark", active: "Saracin, Catechol tannins" },
          { sanskrit: "Dhataki", botanical: "Woodfordia fruticosa", ratio: "20%", part: "Flowers", active: "Wild yeast bio-actives" },
          { sanskrit: "Musta", botanical: "Cyperus rotundus", ratio: "15%", part: "Rhizome", active: "Cyperene, Cyperol" },
          { sanskrit: "Haritaki", botanical: "Terminalia chebula", ratio: "15%", part: "Fruit", active: "Chebulic acid" }
        ]
      },
      {
        id: "SA-13160",
        code: "SA-13160",
        name: "Triphala Churna",
        sanskritName: "त्रिफला चूर्ण (Three Sacred Fruits)",
        category: "CHO",
        status: "PUBLISHED",
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
        tagPill: "DIGESTIVE DETOX",
        healthGoals: ["DIGESTION", "DETOX"],
        benefit: "Gentle natural bowel regulator, antioxidant cellular detox, and ocular health.",
        shortDescription: "Time-tested three-fruit formulation for gentle nocturnal colon cleanse and metabolic detox.",
        monograph: "The revered triad of Haritaki, Bibhitaki, and Amalaki supports gentle colon regulation without dependency. Kindles Pachaka Agni and dislodges Ama from gastrointestinal channels.",
        contraindications: "Active diarrhea or acute dehydration.",
        dosageSummary: "3g - 5g • At Bedtime",
        anupana: "Lukewarm water or pure honey",
        classicalRef: "Charaka Samhita / Sushruta Samhita Sutrasthana 38",
        rasa: "Pancharasa (Excluding Lavana)",
        virya: "Anushnasheeta",
        vipaka: "Madhura",
        granularIngredients: [
          { sanskrit: "Haritaki", botanical: "Terminalia chebula", ratio: "33.3%", part: "Fruit Rind", active: "Chebulinic acid" },
          { sanskrit: "Bibhitaki", botanical: "Terminalia bellirica", ratio: "33.3%", part: "Fruit Rind", active: "Gallic & Ellagic acid" },
          { sanskrit: "Amalaki", botanical: "Emblica officinalis", ratio: "33.3%", part: "Dried Fruit", active: "Natural Vitamin C" }
        ]
      },
      {
        id: "SA-92629",
        code: "SA-92629",
        name: "Ashwagandha Root",
        sanskritName: "अश्वगंधा (Withania somnifera)",
        category: "CHO",
        status: "PUBLISHED",
        imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600",
        tagPill: "ADAPTOGEN",
        healthGoals: ["STRESS_RELIEF", "IMMUNITY"],
        benefit: "Somatic vitality, adrenal support, and deep restful restorative sleep.",
        shortDescription: "Classical adaptogenic root promoting somatic rejuvenation, adrenal equilibrium, and restful sleep.",
        monograph: "Supreme Rasayana for Vata and Kapha imbalances. Fortifies Ojas, nourishes Mamsa and Asthi Dhatus, down-regulates cortisol, and restores neuro-endocrine rhythm.",
        contraindications: "Severe acute Pitta aggravation with excess internal heat.",
        dosageSummary: "3-6g with warm milk",
        anupana: "Warm cow milk or lukewarm water with a dash of ghee",
        classicalRef: "Charaka Samhita Chikitsa Sthana 1.1 / AFI Vol. I",
        rasa: "Tikta, Kashaya, Madhura",
        virya: "Ushna",
        vipaka: "Madhura",
        granularIngredients: [
          { sanskrit: "Ashwagandha Moola", botanical: "Withania somnifera", ratio: "90%", part: "Mature Root", active: "Withanolides, Withaferin A" },
          { sanskrit: "Pippali", botanical: "Piper longum", ratio: "10%", part: "Fruit Spike", active: "Piperine bio-enhancer" }
        ]
      },
      {
        id: "SA-20904",
        code: "SA-20904",
        name: "Brahmi Vati",
        sanskritName: "ब्राह्मी वटी (Medhya Rasayana Tablet)",
        category: "GUL",
        status: "PUBLISHED",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
        tagPill: "NOOTROPIC",
        healthGoals: ["COGNITION", "STRESS_RELIEF"],
        benefit: "Deep mental clarity, cognitive retention, and nervous system tranquility.",
        shortDescription: "Classical neuro-protective tablet enhancing memory retention, focus, and reducing mental exhaustion.",
        monograph: "Premier Medhya Rasayana supporting Dhi (acquisition), Dhriti (retention), and Smriti (recall), while soothing nervous agitation caused by aggravated Prana Vata.",
        contraindications: "Consult physician before co-administration with prescription sedatives.",
        dosageSummary: "1-2 tablets twice daily",
        anupana: "Saraswatarishta or warm milk",
        classicalRef: "Bhaishajya Ratnavali Manasaroga Chikitsa / AFI",
        rasa: "Tikta, Kashaya",
        virya: "Sheeta",
        vipaka: "Madhura",
        granularIngredients: [
          { sanskrit: "Brahmi", botanical: "Bacopa monnieri", ratio: "50%", part: "Whole Herb", active: "Bacosides A & B" },
          { sanskrit: "Shankhapushpi", botanical: "Convolvulus pluricaulis", ratio: "25%", part: "Whole Plant", active: "Microphylic acid" },
          { sanskrit: "Vacha", botanical: "Acorus calamus", ratio: "25%", part: "Purified Rhizome", active: "Beta-asarone detoxified" }
        ]
      },
      {
        id: "SA-76907",
        code: "SA-76907",
        name: "Chyawanprash Avaleha",
        sanskritName: "च्यवनप्राश अवलेह (Rasayana Jam)",
        category: "LEH",
        status: "PUBLISHED",
        imageUrl: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600",
        tagPill: "IMMUNITY BOOSTER",
        healthGoals: ["IMMUNITY", "RESPIRATORY"],
        benefit: "Immuno-modulatory rejuvenation, lung health, and vitality for all seasons.",
        shortDescription: "Premier classical Rasayana rich in natural Vitamin C and 40+ botanical herbs.",
        monograph: "Originated by Sage Chyavana, formulated around wild steamed Amla pulp and Dashamoola decoction. Rebuilds depleted Dhatus and fortifies Pranavaha Srotas.",
        contraindications: "Uncontrolled diabetes mellitus (due to traditional organic jaggery/honey carrier matrix).",
        dosageSummary: "1-2 tablespoons morning & evening",
        anupana: "Warm milk or lukewarm water",
        classicalRef: "Charaka Samhita Chikitsa Sthana 1.1.62-74",
        rasa: "Madhura, Amla, Tikta, Katu, Kashaya",
        virya: "Sheeta-Ushna Samana",
        vipaka: "Madhura",
        granularIngredients: [
          { sanskrit: "Amalaki Fresh Pulp", botanical: "Phyllanthus emblica", ratio: "60%", part: "Fresh Berries", active: "Stable Bio-ascorbates" },
          { sanskrit: "Dashamoola Kwatha", botanical: "Ten Sacred Classical Roots", ratio: "20%", part: "Root Bark", active: "Adaptogenic Sterols" },
          { sanskrit: "Pippali & Ghee/Honey", botanical: "Piper longum, Cow Ghee, Honey", ratio: "20%", part: "Carrier Matrix", active: "Bioavailability enhancers" }
        ]
      },
      {
        id: "SA-25363",
        code: "SA-25363",
        name: "Kumkumadi Thailam",
        sanskritName: "कुंकुमादि तैलम् (Saffron Facial Elixir)",
        category: "THA",
        status: "PUBLISHED",
        imageUrl: "https://images.unsplash.com/photo-1608248597359-253106517e44?w=600",
        tagPill: "SKIN RADIANCE",
        healthGoals: ["SKIN_HEALTH"],
        benefit: "Facial radiance, hyperpigmentation correction, and epidermal glow.",
        shortDescription: "Luxurious Kashmiri saffron and red sandalwood infused classical beauty oil.",
        monograph: "Cooked slowly with pure Kashmiri Saffron, Sandalwood, and Manjistha in a virgin sesame oil base. Clarifies blemishes, stimulates micro-circulation, and pacifies Bhrajaka Pitta.",
        contraindications: "External application only.",
        dosageSummary: "3-5 drops external application",
        anupana: "Gentle circular facial massage",
        classicalRef: "Ashtanga Hrudayam / Bhaishajya Ratnavali",
        rasa: "Tikta, Kashaya, Madhura",
        virya: "Anushna",
        vipaka: "Madhura",
        granularIngredients: [
          { sanskrit: "Kashmiri Kunkuma", botanical: "Crocus sativus", ratio: "10g/L", part: "Stigmas", active: "Crocin, Safranal" },
          { sanskrit: "Chandana", botanical: "Santalum album & Pterocarpus santalinus", ratio: "20%", part: "Heartwood", active: "Santalol" },
          { sanskrit: "Manjistha", botanical: "Rubia cordifolia", ratio: "20%", part: "Stems & Roots", active: "Purpurin, Alizarin" },
          { sanskrit: "Tila Thailam", botanical: "Sesamum indicum", ratio: "50%", part: "Virgin Cold-pressed Oil", active: "Sesamin, Sesamol" }
        ]
      },
      {
        id: "SA-43264",
        code: "SA-43264",
        name: "Yogaraj Guggulu",
        sanskritName: "योगराज गुग्गुलु (Vata & Joint Compound)",
        category: "GUL",
        status: "PUBLISHED",
        imageUrl: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600",
        tagPill: "JOINT MOBILITY",
        healthGoals: ["JOINT_MOBILITY", "DETOX"],
        benefit: "Joint flexibility, synovial comfort, and elimination of metabolic ama.",
        shortDescription: "Time-honored detoxifying and anti-inflammatory classical Guggulu compound.",
        monograph: "Classic polyherbal compound combining Shuddha Guggulu with Chitraka, Rasna, and carminative herbs. Cleanses deep neuromuscular channels and alleviates painful musculoskeletal stiffness.",
        contraindications: "Caution during acute active ulcerative colitis or hyperacidity.",
        dosageSummary: "2 tablets twice daily",
        anupana: "Warm water or Dashamoolarishtam",
        classicalRef: "Bhaishajya Ratnavali Amavata Chikitsa",
        rasa: "Tikta, Katu, Kashaya",
        virya: "Ushna",
        vipaka: "Katu",
        granularIngredients: [
          { sanskrit: "Shuddha Guggulu", botanical: "Commiphora mukul", ratio: "50%", part: "Purified Gum-Resin", active: "Guggulsterones Z & E" },
          { sanskrit: "Chitraka", botanical: "Plumbago zeylanica", ratio: "15%", part: "Root Bark", active: "Plumbagin" },
          { sanskrit: "Rasna", botanical: "Pluchea lanceolata", ratio: "15%", part: "Leaves", active: "Flavonol glycosides" },
          { sanskrit: "Trikatu", botanical: "Zingiber, Piper nigrum & longum", ratio: "20%", part: "Dried Fruits/Rhizomes", active: "Piperine, Gingerols" }
        ]
      },
      {
        id: "SA-72205",
        code: "SA-72205",
        name: "Shatavari Kalpa",
        sanskritName: "शतावरी कल्प (Nourishing Granules)",
        category: "LEH",
        status: "PUBLISHED",
        imageUrl: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600",
        tagPill: "NOURISHMENT & VITALITY",
        healthGoals: ["IMMUNITY", "VITALITY"],
        benefit: "Deep lactation support, hormonal balance, mucosal nourishment, and cellular cooling.",
        shortDescription: "Sweet nourishing granules enriched with pure Shatavari for feminine vitality and digestive cooling.",
        monograph: "Shatavari is Ayurveda premier female adaptogen and tissue builder (Stanyajanana and Shukra-Artava balya). Prepared as Kalpa granules with Elaichi in unrefined raw cane matrix to soothe Pitta and Vata.",
        contraindications: "Active fluid retention without physician guidance.",
        dosageSummary: "1 to 2 teaspoons with warm milk twice daily",
        anupana: "Warm cow milk",
        classicalRef: "Sahasrayogam / AFI",
        rasa: "Madhura, Tikta",
        virya: "Sheeta",
        vipaka: "Madhura",
        granularIngredients: [
          { sanskrit: "Shatavari", botanical: "Asparagus racemosus", ratio: "40%", part: "Tuberous Roots", active: "Shatavarins I-IV, Sarsasapogenin" },
          { sanskrit: "Elaichi", botanical: "Elettaria cardamomum", ratio: "5%", part: "Seeds", active: "Terpinyl acetate, Cineole" },
          { sanskrit: "Sharkara", botanical: "Raw Cane Sugar Matrix", ratio: "55%", part: "Cane crystals", active: "Cooling palatable vehicle" }
        ]
      },
      {
        id: "SA-58259",
        code: "SA-58259",
        name: "Mahanarayan Thailam",
        sanskritName: "महानारायण तैलम् (Master Abhyanga Oil)",
        category: "THA",
        status: "PUBLISHED",
        imageUrl: "https://images.unsplash.com/photo-1512290900672-1f4963507d6d?w=600",
        tagPill: "JOINT & MUSCLE CARE",
        healthGoals: ["JOINT_MOBILITY"],
        benefit: "Musculoskeletal strength, tendon relaxation, and alleviation of chronic stiffness.",
        shortDescription: "Master classical abhyanga oil formulated with 50+ roots and botanicals.",
        monograph: "Masterwork classical massage oil featuring Dashamoola, Shatavari, Bilva, and Ashwagandha processed into cold-pressed black sesame oil. Pacifies deep-seated Vata in bones, joints, and neuromuscular pathways.",
        contraindications: "For external application only. Do not apply over open wounds or acute fractures.",
        dosageSummary: "External Abhyanga oil massage",
        anupana: "Followed by hot steam fomentation (Swedana)",
        classicalRef: "Bhaishajya Ratnavali Vatavyadhi Chikitsa",
        rasa: "Tikta, Madhura",
        virya: "Anushna",
        vipaka: "Madhura",
        granularIngredients: [
          { sanskrit: "Dashamoola & Ashwagandha", botanical: "Aegle, Withania & 10 Roots", ratio: "40%", part: "Decoction Roots", active: "Alkaloids, Phytosterols" },
          { sanskrit: "Shatavari", botanical: "Asparagus racemosus", ratio: "20%", part: "Fresh Root Juice", active: "Steroidal saponins" },
          { sanskrit: "Tila Thailam Base", botanical: "Sesamum indicum", ratio: "40%", part: "Cold-pressed Sesame Oil", active: "Sesamin, Sesamol transdermal carrier" }
        ]
      }
    ];'''

def update_file(filepath):
    if not os.path.exists(filepath):
        print(f'File does not exist: {filepath}')
        return False
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    start_str = '    const initialMedicines = ['
    end_str = '    let medicines = [...initialMedicines];'

    p1 = content.find(start_str)
    p2 = content.find(end_str)

    if p1 == -1 or p2 == -1:
        print(f'Error: Could not locate markers in {filepath}')
        return False

    new_content = content[:p1] + meds_js + '\n\n' + content[p2:]

    # Update STORAGE_KEY_MEDICINES
    new_content = new_content.replace(
        "const STORAGE_KEY_MEDICINES = 'ayurguide_medicines_catalogue_v3';",
        "const STORAGE_KEY_MEDICINES = 'ayurguide_medicines_catalogue_v4';"
    )

    old_load_storage = '''    function loadMedicinesFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_MEDICINES);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            medicines = parsed;
          }
        }
      } catch (e) {
        console.warn('Unable to read medicines from localStorage', e);
      }

      // Ensure every medicine has valid timestamps for dashboard feeds
      const now = new Date();
      medicines.forEach((m, idx) => {
        if (!m.createdAt) {
          const pastDate = new Date(now.getTime() - (medicines.length - idx) * 86400000);
          m.createdAt = pastDate.toISOString();
        }
        if (!m.updatedAt) {
          m.updatedAt = m.createdAt || now.toISOString();
        }
      });
    }'''

    new_load_storage = '''    function loadMedicinesFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_MEDICINES);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Filter out any stale placeholder medicines that were never in the database
            const cleaned = parsed.filter(m => {
              const id = (m.id || '').toLowerCase();
              const name = (m.name || '').toLowerCase();
              if (id.includes('dashamula_kwatha') || name.includes('dashamula kwatha')) return false;
              if (id.includes('gokshuradi_guggulu') || name.includes('gokshuradi guggulu')) return false;
              return true;
            });
            if (cleaned.length > 0) {
              medicines = cleaned;
            }
          }
        }
      } catch (e) {
        console.warn('Unable to read medicines from localStorage', e);
      }

      // Ensure every medicine has valid timestamps for dashboard feeds
      const now = new Date();
      medicines.forEach((m, idx) => {
        if (!m.createdAt) {
          const pastDate = new Date(now.getTime() - (medicines.length - idx) * 86400000);
          m.createdAt = pastDate.toISOString();
        }
        if (!m.updatedAt) {
          m.updatedAt = m.createdAt || now.toISOString();
        }
      });
    }

    async function loadMedicinesFromServer() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const json = await res.json();
          if (json && Array.isArray(json.data) && json.data.length > 0) {
            const serverProducts = json.data;
            const mapped = serverProducts.map(sp => {
              const localMatch = initialMedicines.find(im => 
                (im.code && sp.code && im.code.toLowerCase() === sp.code.toLowerCase()) ||
                (im.name && sp.name && im.name.toLowerCase() === sp.name.toLowerCase()) ||
                (im.id && String(sp.id) === String(im.id))
              );

              return {
                id: sp.code || `med_${sp.id}`,
                code: sp.code || (localMatch ? localMatch.code : ''),
                name: sp.name,
                sanskritName: localMatch?.sanskritName || sp.sanskrit_name || sp.sanskritName || `${sp.name} (Classical Formulation)`,
                category: sp.category || sp.category_name || (localMatch ? localMatch.category : 'Arishtam'),
                status: (sp.status || 'Active').toUpperCase() === 'ACTIVE' ? 'PUBLISHED' : (sp.status || 'PUBLISHED').toUpperCase(),
                imageUrl: sp.imageUrl || sp.image_url || (localMatch ? localMatch.imageUrl : 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600'),
                tagPill: localMatch?.tagPill || (sp.category ? sp.category.toUpperCase() : 'CLASSICAL'),
                healthGoals: localMatch?.healthGoals || sp.health_goals || ["IMMUNITY"],
                benefit: sp.indications || sp.description || localMatch?.benefit || "Supports holistic vitality, tissue rejuvenation and metabolic balance.",
                shortDescription: sp.description || localMatch?.shortDescription || "Classical Ayurvedic formulation prepared according to authentic traditional texts.",
                monograph: localMatch?.monograph || sp.description || "Authentic classical preparation conforming strictly to the Ayurvedic Formulary of India (AFI).",
                contraindications: localMatch?.contraindications || "None known when administered under qualified Ayurvedic medical supervision.",
                dosageSummary: sp.usage || localMatch?.dosageSummary || "15-25 ml twice daily after meals with equal quantity of warm water.",
                anupana: localMatch?.anupana || "Warm water or lukewarm milk as prescribed",
                classicalRef: sp.classicalReference || localMatch?.classicalRef || "Ayurvedic Formulary of India",
                rasa: localMatch?.rasa || "Tikta, Kashaya, Madhura",
                virya: localMatch?.virya || "Ushna",
                vipaka: localMatch?.vipaka || "Madhura",
                granularIngredients: (localMatch?.granularIngredients && localMatch.granularIngredients.length > 0)
                  ? localMatch.granularIngredients
                  : (Array.isArray(sp.ingredients) && sp.ingredients.length > 0
                      ? sp.ingredients.map(ing => ({
                          sanskrit: typeof ing === 'string' ? ing : (ing.name || 'Classical Herb'),
                          botanical: typeof ing === 'string' ? ing : (ing.botanicalName || ing.name || 'Botanical'),
                          ratio: 'Standard Classical Proportion',
                          part: 'Purified Herb',
                          active: 'Phytochemical Actives'
                        }))
                      : [
                          { sanskrit: sp.name, botanical: "Classical Botanical Compound", ratio: "100%", part: "Processed Form", active: "Bio-active markers" }
                        ])
              };
            });

            medicines = mapped;
            saveMedicinesToStorage();
            renderMedicines();
            updateMetrics();
            renderDashboardRecentMedicines();
            if (typeof updateGlobalDraftAlertBar === 'function') {
              updateGlobalDraftAlertBar();
            }
          }
        }
      } catch (e) {
        console.warn('Unable to load medicines from server API:', e);
      }
    }'''

    new_content = new_content.replace(old_load_storage, new_load_storage)

    old_auth_call = '''      loadCategoriesFromStorage();
      populateCategoryDropdowns();
      loadCategoriesFromServer();
      loadMedicinesFromStorage();
      renderMedicines();'''

    new_auth_call = '''      loadCategoriesFromStorage();
      populateCategoryDropdowns();
      loadCategoriesFromServer();
      loadMedicinesFromStorage();
      renderMedicines();
      loadMedicinesFromServer();'''

    new_content = new_content.replace(old_auth_call, new_auth_call)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f'Successfully updated {filepath}')
    return True

update_file('public/admin.html')
update_file('web-admin/admin.html')
