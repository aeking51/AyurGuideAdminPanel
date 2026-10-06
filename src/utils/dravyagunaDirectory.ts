import { BotanicalIngredient } from '../types';

export interface ClassicalHerbMetadata {
  name: string;
  botanicalName: string;
  sanskritName: string;
  partUsed: string;
  therapeuticAction: string;
  referenceLink?: string;
  aliases?: string[];
}

/**
 * Standard Ayurvedic Pharmacopoeia Dravyaguna Reference Dictionary.
 * Contains authentic classical data for standard herbs used across Classical formulations.
 */
export const DRAVYAGUNA_REFERENCE_HERBS: ClassicalHerbMetadata[] = [
  {
    name: 'Ashwagandha',
    botanicalName: 'Withania somnifera',
    sanskritName: 'अश्वगन्धा',
    partUsed: 'Root',
    therapeuticAction: 'Rasayana, Balya, Vatahara',
    referenceLink: 'https://en.wikipedia.org/wiki/Withania_somnifera',
    aliases: ['Ashwagandha Root', 'Asgandh']
  },
  {
    name: 'Rasna',
    botanicalName: 'Pluchea lanceolata',
    sanskritName: 'रास्ना',
    partUsed: 'Root / Leaf',
    therapeuticAction: 'Vatahara, Amapachana, Shothahara',
    referenceLink: 'https://en.wikipedia.org/wiki/Pluchea_lanceolata',
    aliases: ['Rasna (Pluchea lanceolata)', 'Yuktarasa']
  },
  {
    name: 'Bala',
    botanicalName: 'Sida cordifolia',
    sanskritName: 'बला',
    partUsed: 'Root / Whole plant',
    therapeuticAction: 'Balya, Brimhana, Vatapittahara',
    referenceLink: 'https://en.wikipedia.org/wiki/Sida_cordifolia',
    aliases: ['Balamoola', 'Country Mallow']
  },
  {
    name: 'Erandamoola',
    botanicalName: 'Ricinus communis',
    sanskritName: 'एरण्डमूल',
    partUsed: 'Root',
    therapeuticAction: 'Vatahara, Rechana, Vedanasthapana',
    referenceLink: 'https://en.wikipedia.org/wiki/Ricinus',
    aliases: ['Eranda', 'Castor Root', 'Gandharvahasta']
  },
  {
    name: 'Devadaru',
    botanicalName: 'Cedrus deodara',
    sanskritName: 'देवदारु',
    partUsed: 'Heartwood',
    therapeuticAction: 'Vatahara, Shothahara, Vedanasthapana',
    referenceLink: 'https://en.wikipedia.org/wiki/Cedrus_deodara',
    aliases: ['Deodar Cedar', 'Suradaru']
  },
  {
    name: 'Gokshura',
    botanicalName: 'Tribulus terrestris',
    sanskritName: 'गोक्षुर',
    partUsed: 'Fruit / Root',
    therapeuticAction: 'Mutrala, Ashmarighna, Vrishya',
    referenceLink: 'https://en.wikipedia.org/wiki/Tribulus_terrestris',
    aliases: ['Gokhru', 'Chhota Gokhru']
  },
  {
    name: 'Amalaki',
    botanicalName: 'Phyllanthus emblica',
    sanskritName: 'आमलकी',
    partUsed: 'Fruit pericarp',
    therapeuticAction: 'Rasayana, Chakshushya, Tridoshahara',
    referenceLink: 'https://en.wikipedia.org/wiki/Phyllanthus_emblica',
    aliases: ['Amla', 'Indian Gooseberry', 'Dhatri']
  },
  {
    name: 'Haritaki',
    botanicalName: 'Terminalia chebula',
    sanskritName: 'हरीतकी',
    partUsed: 'Fruit pericarp',
    therapeuticAction: 'Anulomana, Deepana, Rasayana',
    referenceLink: 'https://en.wikipedia.org/wiki/Terminalia_chebula',
    aliases: ['Harad', 'Chebulic Myrobalan', 'Abhaya']
  },
  {
    name: 'Bibhitaki',
    botanicalName: 'Terminalia bellirica',
    sanskritName: 'बिभीतक',
    partUsed: 'Fruit pericarp',
    therapeuticAction: 'Bhedana, Kaphahara, Chakshushya',
    referenceLink: 'https://en.wikipedia.org/wiki/Terminalia_bellirica',
    aliases: ['Baheda', 'Belliric Myrobalan']
  },
  {
    name: 'Guduchi',
    botanicalName: 'Tinospora cordifolia',
    sanskritName: 'गुडूची',
    partUsed: 'Stem',
    therapeuticAction: 'Jvarahara, Rasayana, Dahaprashamana',
    referenceLink: 'https://en.wikipedia.org/wiki/Tinospora_cordifolia',
    aliases: ['Giloy', 'Amrita']
  },
  {
    name: 'Shatavari',
    botanicalName: 'Asparagus racemosus',
    sanskritName: 'शतावरी',
    partUsed: 'Tuberous root',
    therapeuticAction: 'Stanyajanana, Balya, Rasayana',
    referenceLink: 'https://en.wikipedia.org/wiki/Asparagus_racemosus',
    aliases: ['Satavar', 'Wild Asparagus']
  },
  {
    name: 'Yashtimadhu',
    botanicalName: 'Glycyrrhiza glabra',
    sanskritName: 'यष्टिमधु',
    partUsed: 'Root & Stolon',
    therapeuticAction: 'Kanthya, Pittashamana, Varnya',
    referenceLink: 'https://en.wikipedia.org/wiki/Liquorice',
    aliases: ['Mulethi', 'Licorice', 'Madhuyashti']
  },
  {
    name: 'Pippali',
    botanicalName: 'Piper longum',
    sanskritName: 'पिप्पली',
    partUsed: 'Fruit',
    therapeuticAction: 'Deepana, Pachana, Rasayana, Kasahara',
    referenceLink: 'https://en.wikipedia.org/wiki/Long_pepper',
    aliases: ['Long Pepper', 'Magadha']
  },
  {
    name: 'Maricha',
    botanicalName: 'Piper nigrum',
    sanskritName: 'मरिच',
    partUsed: 'Fruit',
    therapeuticAction: 'Deepana, Shirovirechana, Kaphavatahara',
    referenceLink: 'https://en.wikipedia.org/wiki/Black_pepper',
    aliases: ['Black Pepper', 'Kali Mirch']
  },
  {
    name: 'Shunti',
    botanicalName: 'Zingiber officinale',
    sanskritName: 'शुण्ठी',
    partUsed: 'Dried Rhizome',
    therapeuticAction: 'Deepana, Pachana, Bhedana, Vatahara',
    referenceLink: 'https://en.wikipedia.org/wiki/Ginger',
    aliases: ['Sunthi', 'Dry Ginger', 'Nagara']
  },
  {
    name: 'Draksha',
    botanicalName: 'Vitis vinifera',
    sanskritName: 'द्राक्षा',
    partUsed: 'Dried Fruit',
    therapeuticAction: 'Brimhana, Tarpana, Kanthya',
    referenceLink: 'https://en.wikipedia.org/wiki/Grape',
    aliases: ['Raisin', 'Dry Grapes']
  },
  {
    name: 'Dhataki',
    botanicalName: 'Woodfordia fruticosa',
    sanskritName: 'धातकी',
    partUsed: 'Flower',
    therapeuticAction: 'Sandhaniya, Deepana, Fermenting catalyst',
    referenceLink: 'https://en.wikipedia.org/wiki/Woodfordia_fruticosa',
    aliases: ['Dhataki Pushpa', 'Fire-flame bush']
  },
  {
    name: 'Manjistha',
    botanicalName: 'Rubia cordifolia',
    sanskritName: 'मञ्जिष्ठा',
    partUsed: 'Stem',
    therapeuticAction: 'Raktaprasadana, Varnya, Vishaghna',
    referenceLink: 'https://en.wikipedia.org/wiki/Rubia_cordifolia',
    aliases: ['Indian Madder', 'Manjit']
  },
  {
    name: 'Sariva',
    botanicalName: 'Hemidesmus indicus',
    sanskritName: 'सारिवा',
    partUsed: 'Root',
    therapeuticAction: 'Raktashodhaka, Dahaprashamana, Deepana',
    referenceLink: 'https://en.wikipedia.org/wiki/Hemidesmus_indicus',
    aliases: ['Anantamoola', 'Indian Sarsaparilla']
  },
  {
    name: 'Chandana',
    botanicalName: 'Santalum album',
    sanskritName: 'चन्दन',
    partUsed: 'Heartwood',
    therapeuticAction: 'Pittashamana, Dahahara, Hridya',
    referenceLink: 'https://en.wikipedia.org/wiki/Sandalwood',
    aliases: ['Sweta Chandana', 'White Sandalwood']
  },
  {
    name: 'Musta',
    botanicalName: 'Cyperus rotundus',
    sanskritName: 'मुस्ता',
    partUsed: 'Rhizome tuber',
    therapeuticAction: 'Deepana, Pachana, Grahi, Jvarahara',
    referenceLink: 'https://en.wikipedia.org/wiki/Cyperus_rotundus',
    aliases: ['Nagarmotha', 'Nut grass']
  },
  {
    name: 'Katuki',
    botanicalName: 'Picrorhiza kurroa',
    sanskritName: 'कटुकी',
    partUsed: 'Rhizome',
    therapeuticAction: 'Bhedana, Deepana, Yakriduttejaka',
    referenceLink: 'https://en.wikipedia.org/wiki/Picrorhiza_kurrooa',
    aliases: ['Kutki', 'Tikta']
  },
  {
    name: 'Nimba',
    botanicalName: 'Azadirachta indica',
    sanskritName: 'निम्ब',
    partUsed: 'Bark / Leaves',
    therapeuticAction: 'Krimighna, Kandughna, Kaphapittahara',
    referenceLink: 'https://en.wikipedia.org/wiki/Azadirachta_indica',
    aliases: ['Neem', 'Arishta']
  },
  {
    name: 'Tulsi',
    botanicalName: 'Ocimum sanctum',
    sanskritName: 'तुलसी',
    partUsed: 'Leaves / Seed',
    therapeuticAction: 'Shvasahara, Kasahara, Krimighna',
    referenceLink: 'https://en.wikipedia.org/wiki/Ocimum_tenuiflorum',
    aliases: ['Holy Basil', 'Surasa']
  },
  {
    name: 'Vasa',
    botanicalName: 'Adhatoda vasica',
    sanskritName: 'वासा',
    partUsed: 'Leaves',
    therapeuticAction: 'Kasahara, Shvasahara, Raktapittahara',
    referenceLink: 'https://en.wikipedia.org/wiki/Justicia_adhatoda',
    aliases: ['Vasaka', 'Malabar Nut']
  },
  {
    name: 'Kantakari',
    botanicalName: 'Solanum surattense',
    sanskritName: 'कण्टकारी',
    partUsed: 'Whole plant',
    therapeuticAction: 'Kasahara, Shvasahara, Deepana',
    referenceLink: 'https://en.wikipedia.org/wiki/Solanum_surattense',
    aliases: ['Chhoti Kateri', 'Yellow-berried Nightshade']
  },
  {
    name: 'Brihati',
    botanicalName: 'Solanum indicum',
    sanskritName: 'बृहती',
    partUsed: 'Root',
    therapeuticAction: 'Deepana, Pachana, Grahi, Kaphahara',
    referenceLink: 'https://en.wikipedia.org/wiki/Solanum_violaceum',
    aliases: ['Badi Kateri', 'Indian Nightshade']
  },
  {
    name: 'Shalaparni',
    botanicalName: 'Desmodium gangeticum',
    sanskritName: 'शालपर्णी',
    partUsed: 'Whole plant / Root',
    therapeuticAction: 'Balya, Brimhana, Vatahara',
    referenceLink: 'https://en.wikipedia.org/wiki/Desmodium_gangeticum',
    aliases: ['Sarivan', 'Vidarigandha']
  },
  {
    name: 'Prishniparni',
    botanicalName: 'Uraria picta',
    sanskritName: 'पृश्निपर्णी',
    partUsed: 'Whole plant / Root',
    therapeuticAction: 'Angamardaprashamana, Tridoshahara',
    referenceLink: 'https://en.wikipedia.org/wiki/Uraria_picta',
    aliases: ['Pithavan', 'Kalashi']
  },
  {
    name: 'Bilva',
    botanicalName: 'Aegle marmelos',
    sanskritName: 'बिल्व',
    partUsed: 'Root bark / Unripe fruit',
    therapeuticAction: 'Sangrahi, Deepana, Vatakaphahara',
    referenceLink: 'https://en.wikipedia.org/wiki/Aegle_marmelos',
    aliases: ['Bael', 'Shandilya']
  },
  {
    name: 'Agnimantha',
    botanicalName: 'Clerodendrum phlomidis',
    sanskritName: 'अग्निमन्थ',
    partUsed: 'Root bark',
    therapeuticAction: 'Shothahara, Vedanasthapana, Deepana',
    referenceLink: 'https://en.wikipedia.org/wiki/Clerodendrum_phlomidis',
    aliases: ['Arani', 'Ganiari']
  },
  {
    name: 'Shyonaka',
    botanicalName: 'Oroxylum indicum',
    sanskritName: 'श्योनाक',
    partUsed: 'Root bark',
    therapeuticAction: 'Deepana, Grahi, Shothahara',
    referenceLink: 'https://en.wikipedia.org/wiki/Oroxylum_indicum',
    aliases: ['Sonapatha', 'Midnight Horror']
  },
  {
    name: 'Patala',
    botanicalName: 'Stereospermum suaveolens',
    sanskritName: 'पाटला',
    partUsed: 'Root bark',
    therapeuticAction: 'Tridoshahara, Hridya, Deepana',
    referenceLink: 'https://en.wikipedia.org/wiki/Stereospermum_chelonoides',
    aliases: ['Padal', 'Kuberakshi']
  },
  {
    name: 'Gambhari',
    botanicalName: 'Gmelina arborea',
    sanskritName: 'गम्भारी',
    partUsed: 'Root bark / Fruit',
    therapeuticAction: 'Dahahara, Medhya, Keshya',
    referenceLink: 'https://en.wikipedia.org/wiki/Gmelina_arborea',
    aliases: ['Kashmarya', 'White Teak']
  },
  {
    name: 'Haridra',
    botanicalName: 'Curcuma longa',
    sanskritName: 'हरिद्रा',
    partUsed: 'Rhizome',
    therapeuticAction: 'Lekhana, Vishaghna, Varnya, Krimighna',
    referenceLink: 'https://en.wikipedia.org/wiki/Turmeric',
    aliases: ['Turmeric', 'Haldi', 'Nisha']
  },
  {
    name: 'Daruharidra',
    botanicalName: 'Berberis aristata',
    sanskritName: 'दारुहरिद्रा',
    partUsed: 'Stem / Root',
    therapeuticAction: 'Chakshushya, Kaphapittashamana, Lekhana',
    referenceLink: 'https://en.wikipedia.org/wiki/Berberis_aristata',
    aliases: ['Daru Haldi', 'Indian Barberry']
  },
  {
    name: 'Punarnava',
    botanicalName: 'Boerhavia diffusa',
    sanskritName: 'पुनर्नवा',
    partUsed: 'Root / Whole plant',
    therapeuticAction: 'Shothahara, Mutrala, Rasayana',
    referenceLink: 'https://en.wikipedia.org/wiki/Boerhavia_diffusa',
    aliases: ['Raktapunarnava', 'Spreading Hogweed']
  },
  {
    name: 'Varuna',
    botanicalName: 'Crataeva nurvala',
    sanskritName: 'वरुण',
    partUsed: 'Stem bark',
    therapeuticAction: 'Ashmarighna, Bhedana, Deepana',
    referenceLink: 'https://en.wikipedia.org/wiki/Crateva_religiosa',
    aliases: ['Barna', 'Three-leaved Caper']
  },
  {
    name: 'Arjuna',
    botanicalName: 'Terminalia arjuna',
    sanskritName: 'अर्जुन',
    partUsed: 'Stem bark',
    therapeuticAction: 'Hridya, Sandhaniya, Raktaprasadana',
    referenceLink: 'https://en.wikipedia.org/wiki/Terminalia_arjuna',
    aliases: ['Kahu', 'Arjun Tree']
  },
  {
    name: 'Lodhra',
    botanicalName: 'Symplocos racemosa',
    sanskritName: 'लोध्र',
    partUsed: 'Stem bark',
    therapeuticAction: 'Grahi, Stambhana, Chakshushya',
    referenceLink: 'https://en.wikipedia.org/wiki/Symplocos_racemosa',
    aliases: ['Rodhra', 'Lodh']
  },
  {
    name: 'Ashoka',
    botanicalName: 'Saraca asoca',
    sanskritName: 'अशोक',
    partUsed: 'Stem bark',
    therapeuticAction: 'Hridya, Stambhana, Garbhashaya balya',
    referenceLink: 'https://en.wikipedia.org/wiki/Saraca_asoca',
    aliases: ['Asok', 'Sorrowless Tree']
  },
  {
    name: 'Guggulu',
    botanicalName: 'Commiphora mukul',
    sanskritName: 'गुग्गुलु',
    partUsed: 'Purified Exudate / Resin',
    therapeuticAction: 'Vatahara, Medohara, Sandhaniya, Rasayana',
    referenceLink: 'https://en.wikipedia.org/wiki/Commiphora_wightii',
    aliases: ['Guggul', 'Indian Bdellium']
  },
  {
    name: 'Triphala Complex',
    botanicalName: 'Terminalia chebula et al.',
    sanskritName: 'त्रिफला',
    partUsed: 'Combined fruit pericarps',
    therapeuticAction: 'Synergistic detoxifier, Chakshushya, Rasayana',
    referenceLink: 'https://en.wikipedia.org/wiki/Triphala',
    aliases: ['Triphala', 'Phalatrikam']
  },
  {
    name: 'Trikatu Complex',
    botanicalName: 'Piper nigrum et al.',
    sanskritName: 'त्रिकटु',
    partUsed: 'Combined spices (Sunthi, Maricha, Pippali)',
    therapeuticAction: 'Deepana, Pachana, Srotoshodhaka',
    referenceLink: 'https://en.wikipedia.org/wiki/Trikatu',
    aliases: ['Trikatu', 'Katutraya']
  },
  {
    name: 'Dashamoola Complex',
    botanicalName: 'Aegle marmelos et al.',
    sanskritName: 'दशमूल',
    partUsed: 'Ten sacred roots',
    therapeuticAction: 'Shothahara, Vatahara, Sannipatahara',
    referenceLink: 'https://en.wikipedia.org/wiki/Dashamula',
    aliases: ['Dashamoola', 'Dasamoolam']
  }
];

/**
 * Searches and normalizes an ingredient string (e.g. "Rasna (Pluchea lanceolata)", "Ashwagandha")
 * against the registered botanicals or Dravyaguna reference database.
 */
export function resolveHerbDetails(
  rawInput: string,
  customList: BotanicalIngredient[] = []
): {
  name: string;
  botanicalName: string;
  sanskritName: string;
  partUsed: string;
  therapeuticAction: string;
  referenceLink: string;
  isRegistered: boolean;
} {
  const clean = (rawInput || '').trim();
  if (!clean) {
    return {
      name: 'Classical Botanical',
      botanicalName: '',
      sanskritName: '',
      partUsed: 'Standardized Part',
      therapeuticAction: 'Classical Therapeutic',
      referenceLink: '',
      isRegistered: false
    };
  }

  // 1. Check if botanical name is in parentheses (e.g. "Rasna (Pluchea lanceolata)")
  let embeddedBotanical = '';
  let commonClean = clean;
  const parenMatch = clean.match(/^([^(]+)\s*\(([^)]+)\)$/);
  if (parenMatch) {
    commonClean = parenMatch[1].trim();
    embeddedBotanical = parenMatch[2].trim();
  }

  const searchTarget = commonClean.toLowerCase();

  // 2. Check Custom User Registered List (from Supabase public.ingredients)
  const customMatch = customList.find(b => {
    const bName = (b.name || '').toLowerCase();
    const bLatin = (b.botanicalName || '').toLowerCase();
    const bSans = (b.sanskritName || '').toLowerCase();
    return bName === searchTarget || 
           searchTarget.includes(bName) || 
           bName.includes(searchTarget) || 
           bLatin === searchTarget ||
           (embeddedBotanical && bLatin.includes(embeddedBotanical.toLowerCase())) ||
           bSans === searchTarget;
  });

  if (customMatch) {
    return {
      name: customMatch.name,
      botanicalName: customMatch.botanicalName || embeddedBotanical || '',
      sanskritName: customMatch.sanskritName || '',
      partUsed: customMatch.partUsed || 'Standardized Part',
      therapeuticAction: customMatch.therapeuticAction || 'Classical active',
      referenceLink: customMatch.referenceLink || '',
      isRegistered: true
    };
  }

  // 3. Check Dravyaguna Reference Dictionary
  const refMatch = DRAVYAGUNA_REFERENCE_HERBS.find(h => {
    const hName = h.name.toLowerCase();
    const hLatin = h.botanicalName.toLowerCase();
    const hSans = h.sanskritName.toLowerCase();
    const matchesAliases = h.aliases?.some(a => a.toLowerCase() === searchTarget || searchTarget.includes(a.toLowerCase()));

    return hName === searchTarget || 
           searchTarget.includes(hName) || 
           hName.includes(searchTarget) || 
           hLatin === searchTarget ||
           (embeddedBotanical && hLatin.includes(embeddedBotanical.toLowerCase())) ||
           hSans === searchTarget ||
           matchesAliases;
  });

  if (refMatch) {
    return {
      name: commonClean,
      botanicalName: embeddedBotanical || refMatch.botanicalName,
      sanskritName: refMatch.sanskritName,
      partUsed: refMatch.partUsed,
      therapeuticAction: refMatch.therapeuticAction,
      referenceLink: refMatch.referenceLink || '',
      isRegistered: false
    };
  }

  // 4. Fallback for uncatalogued herb
  return {
    name: commonClean,
    botanicalName: embeddedBotanical || '',
    sanskritName: '',
    partUsed: 'Standardized Part',
    therapeuticAction: 'Classical formulation active',
    referenceLink: `https://en.wikipedia.org/wiki/${encodeURIComponent(embeddedBotanical || commonClean)}`,
    isRegistered: false
  };
}

/**
 * Extracts all unique ingredients used across medicines and merges them with registered botanicals.
 */
export function buildUnifiedBotanicalDirectory(
  registeredBotanicals: BotanicalIngredient[],
  products: { id: number | string; name: string; code: string; ingredients?: any[] }[]
): BotanicalIngredient[] {
  const mergedMap = new Map<string, BotanicalIngredient>();

  // 1. Add all registered botanicals first
  for (const reg of registeredBotanicals) {
    const key = (reg.name || '').trim().toLowerCase();
    if (key) {
      mergedMap.set(key, { ...reg });
    }
  }

  // 2. Parse all ingredients from all products
  let virtualIdCounter = 9000;
  for (const product of products) {
    const ingList = product.ingredients || [];
    for (const rawItem of ingList) {
      let rawName = '';
      let existingObj: any = null;

      if (typeof rawItem === 'string') {
        rawName = rawItem.trim();
      } else if (typeof rawItem === 'object' && rawItem !== null) {
        rawName = (rawItem.name || '').trim();
        existingObj = rawItem;
      }

      if (!rawName) continue;

      const normKey = rawName.toLowerCase().replace(/\s*\([^)]*\)/, '').trim();

      // If already exists, enrich missing fields
      if (mergedMap.has(normKey)) {
        const current = mergedMap.get(normKey)!;
        if (!current.botanicalName && existingObj?.botanicalName) {
          current.botanicalName = existingObj.botanicalName;
        }
        if (!current.partUsed && existingObj?.partUsed) {
          current.partUsed = existingObj.partUsed;
        }
        continue;
      }

      // Not yet in map: resolve from Dravyaguna reference dictionary
      const details = resolveHerbDetails(rawName, registeredBotanicals);
      const unifiedItem: BotanicalIngredient = {
        id: existingObj?.id || `derived-${virtualIdCounter++}`,
        name: details.name,
        botanicalName: existingObj?.botanicalName || details.botanicalName,
        sanskritName: existingObj?.sanskritName || details.sanskritName,
        partUsed: existingObj?.partUsed || details.partUsed,
        therapeuticAction: existingObj?.classicalRole || existingObj?.therapeuticAction || details.therapeuticAction,
        referenceLink: existingObj?.referenceLink || details.referenceLink,
        createdAt: new Date().toISOString()
      };

      mergedMap.set(normKey, unifiedItem);
    }
  }

  return Array.from(mergedMap.values());
}
