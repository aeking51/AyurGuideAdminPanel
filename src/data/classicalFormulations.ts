import { IngredientItem } from '../types';

/**
 * Authentic classical Ayurvedic formulation ingredient recipes
 * derived from Sharangadhara Samhita, Charaka Samhita, Bhaishajya Ratnavali, and AFI.
 */
export const CLASSICAL_FORMULATIONS_RECIPES: Record<string, IngredientItem[]> = {
  // Dashamoolarishtam - The legendary 63 classical herbs & ingredients formulation
  dashamoolarishtam: [
    // 1-10: Dashamoola (Ten Sacred Roots)
    { name: 'Bilva', sanskritName: 'बिल्व', botanicalName: 'Aegle marmelos', partUsed: 'Root', classicalRole: 'Vatahara, Deepana, Hridya' },
    { name: 'Agnimantha', sanskritName: 'अग्निमन्थ', botanicalName: 'Premna integrifolia', partUsed: 'Root', classicalRole: 'Shothahara, Vatahara' },
    { name: 'Shyonaka', sanskritName: 'श्योनाक', botanicalName: 'Oroxylum indicum', partUsed: 'Root', classicalRole: 'Deepana, Grahi, Amapachana' },
    { name: 'Patala', sanskritName: 'पाटला', botanicalName: 'Stereospermum suaveolens', partUsed: 'Root', classicalRole: 'Hridya, Tridoshahara' },
    { name: 'Gambhari', sanskritName: 'गम्भारी', botanicalName: 'Gmelina arborea', partUsed: 'Root', classicalRole: 'Rasayana, Balya, Dahashamaka' },
    { name: 'Brihati', sanskritName: 'बृहती', botanicalName: 'Solanum indicum', partUsed: 'Root / Whole plant', classicalRole: 'Kanthya, Deepana, Pachana' },
    { name: 'Kantakari', sanskritName: 'कण्टकारी', botanicalName: 'Solanum surattense', partUsed: 'Root / Whole plant', classicalRole: 'Kasahara, Shwasahara' },
    { name: 'Gokshura', sanskritName: 'गोक्षुर', botanicalName: 'Tribulus terrestris', partUsed: 'Fruit / Root', classicalRole: 'Mutrala, Ashmarighna, Balya' },
    { name: 'Shalaparni', sanskritName: 'शालपर्णी', botanicalName: 'Desmodium gangeticum', partUsed: 'Root / Whole plant', classicalRole: 'Angamardaprashamana, Balya' },
    { name: 'Prishniparni', sanskritName: 'पृश्निपर्णी', botanicalName: 'Uraria picta', partUsed: 'Root / Whole plant', classicalRole: 'Sandhaniya, Vatahara, Tridoshahara' },

    // 11-20: Deepana, Pachana & Rejuvenating Decoction Actives
    { name: 'Chitraka', sanskritName: 'चित्रक', botanicalName: 'Plumbago zeylanica', partUsed: 'Root', classicalRole: 'Deepana, Pachana, Shothahara' },
    { name: 'Pushkaramoola', sanskritName: 'पुष्करमूल', botanicalName: 'Inula racemosa', partUsed: 'Root', classicalRole: 'Hikkanigrahana, Shwasahara, Parshwashoolahara' },
    { name: 'Lodhra', sanskritName: 'लोध्र', botanicalName: 'Symplocos racemosa', partUsed: 'Stem bark', classicalRole: 'Grahi, Shonitasthapana, Shothahara' },
    { name: 'Guduchi', sanskritName: 'गुडूची', botanicalName: 'Tinospora cordifolia', partUsed: 'Stem', classicalRole: 'Rasayana, Jwarahara, Vayasthapana' },
    { name: 'Dhatri (Amalaki)', sanskritName: 'धात्री / आमलकी', botanicalName: 'Phyllanthus emblica', partUsed: 'Fruit pericarp', classicalRole: 'Rasayana, Chakshushya, Tridoshahara' },
    { name: 'Duralabha', sanskritName: 'दुरालभा', botanicalName: 'Fagonia cretica', partUsed: 'Whole plant', classicalRole: 'Pittahara, Trishna-nigrahana, Jwarahara' },
    { name: 'Khadira', sanskritName: 'खदिर', botanicalName: 'Acacia catechu', partUsed: 'Heartwood', classicalRole: 'Kushtaghna, Medohara, Raktashodhaka' },
    { name: 'Bijasara', sanskritName: 'बीजसार', botanicalName: 'Pterocarpus marsupium', partUsed: 'Heartwood', classicalRole: 'Rasayana, Pramehaghna, Varnya' },
    { name: 'Haritaki', sanskritName: 'हरीतकी', botanicalName: 'Terminalia chebula', partUsed: 'Fruit pericarp', classicalRole: 'Anulomana, Deepana, Rasayana' },
    { name: 'Kushta', sanskritName: 'कुष्ठ', botanicalName: 'Saussurea lappa', partUsed: 'Root', classicalRole: 'Vatahara, Shukrala, Kushtaghna' },

    // 21-30: Classical Systemic Tonics & Tissue Restoratives
    { name: 'Manjistha', sanskritName: 'मञ्जिष्ठा', botanicalName: 'Rubia cordifolia', partUsed: 'Root / Stem', classicalRole: 'Raktashodhaka, Varnya, Vishaghna' },
    { name: 'Devadaru', sanskritName: 'देवदारु', botanicalName: 'Cedrus deodara', partUsed: 'Heartwood', classicalRole: 'Vatahara, Shothahara, Vedanasthapana' },
    { name: 'Vidanga', sanskritName: 'विडङ्ग', botanicalName: 'Embelia ribes', partUsed: 'Fruit', classicalRole: 'Kriminashaka, Deepana, Anulomana' },
    { name: 'Yashtimadhu', sanskritName: 'यष्टिमधु', botanicalName: 'Glycyrrhiza glabra', partUsed: 'Root', classicalRole: 'Kanthya, Varnya, Jeevaneeya, Balya' },
    { name: 'Bharangi', sanskritName: 'भारङ्गी', botanicalName: 'Clerodendrum serratum', partUsed: 'Root', classicalRole: 'Kasahara, Shwasahara, Kaphahara' },
    { name: 'Kapittha', sanskritName: 'कपित्थ', botanicalName: 'Feronia elephantum', partUsed: 'Fruit pulp', classicalRole: 'Grahi, Deepana, Vatapittashamaka' },
    { name: 'Bibhitaki', sanskritName: 'बिभीतक', botanicalName: 'Terminalia bellirica', partUsed: 'Fruit pericarp', classicalRole: 'Bhedana, Kaphahara, Chakshushya' },
    { name: 'Punarnava', sanskritName: 'पुनर्नवा', botanicalName: 'Boerhavia diffusa', partUsed: 'Whole plant', classicalRole: 'Shothahara, Mutrala, Hridya' },
    { name: 'Chavya', sanskritName: 'चव्य', botanicalName: 'Piper retrofractum', partUsed: 'Stem', classicalRole: 'Deepana, Pachana, Ruchya' },
    { name: 'Jatamansi', sanskritName: 'जटामांसी', botanicalName: 'Nardostachys jatamansi', partUsed: 'Rhizome', classicalRole: 'Medhya, Nidrajanana, Manasadoshahara' },

    // 31-40: Micro-circulatory & Metabolic Enhancers
    { name: 'Priyangu', sanskritName: 'प्रियङ्गु', botanicalName: 'Callicarpa macrophylla', partUsed: 'Flower', classicalRole: 'Raktapittahara, Varnya, Sandhaniya' },
    { name: 'Sariva', sanskritName: 'सारिवा', botanicalName: 'Hemidesmus indicus', partUsed: 'Root', classicalRole: 'Dahaprashamana, Raktashodhaka, Rasayana' },
    { name: 'Krishna Jeeraka', sanskritName: 'कृष्ण जीरक', botanicalName: 'Carum carvi', partUsed: 'Seed', classicalRole: 'Deepana, Ruchya, Sangrahi' },
    { name: 'Trivrit', sanskritName: 'त्रिवृत्', botanicalName: 'Operculina turpethum', partUsed: 'Root bark', classicalRole: 'Sukhavirechana, Pittashamaka' },
    { name: 'Renuka', sanskritName: 'रेणुका', botanicalName: 'Vitex agnus-castus', partUsed: 'Seed', classicalRole: 'Deepana, Pachana, Vishaghna' },
    { name: 'Rasna', sanskritName: 'रास्ना', botanicalName: 'Pluchea lanceolata', partUsed: 'Leaf / Root', classicalRole: 'Vatahara, Amapachana, Shothahara' },
    { name: 'Pippali', sanskritName: 'पिप्पली', botanicalName: 'Piper longum', partUsed: 'Fruit', classicalRole: 'Deepana, Rasayana, Shwasahara' },
    { name: 'Kramuka', sanskritName: 'क्रमुक', botanicalName: 'Areca catechu', partUsed: 'Nut', classicalRole: 'Kaphahara, Grahi, Deepana' },
    { name: 'Shati', sanskritName: 'शटी', botanicalName: 'Hedychium spicatum', partUsed: 'Rhizome', classicalRole: 'Shwasahara, Deepana, Ruchya' },
    { name: 'Haridra', sanskritName: 'हरिद्रा', botanicalName: 'Curcuma longa', partUsed: 'Rhizome', classicalRole: 'Varnya, Vishaghna, Pramehahara' },

    // 41-50: Classical Ashtavarga & Vitality Adaptogens
    { name: 'Shatapushpa', sanskritName: 'शतपुष्पा', botanicalName: 'Anethum sowa', partUsed: 'Fruit / Seed', classicalRole: 'Deepana, Anulomana, Vatahara' },
    { name: 'Padmaka', sanskritName: 'पद्मक', botanicalName: 'Prunus cerasoides', partUsed: 'Heartwood', classicalRole: 'Garbhasthapana, Varnya, Dahashamaka' },
    { name: 'Nagakeshara', sanskritName: 'नागकेशर', botanicalName: 'Mesua ferrea', partUsed: 'Stamen', classicalRole: 'Raktasthapana, Grahi, Pachana' },
    { name: 'Musta', sanskritName: 'मुस्ता', botanicalName: 'Cyperus rotundus', partUsed: 'Tuber / Rhizome', classicalRole: 'Deepana, Pachana, Grahi, Jwarahara' },
    { name: 'Indrayava', sanskritName: 'इन्द्रयव', botanicalName: 'Holarrhena antidysenterica', partUsed: 'Seed', classicalRole: 'Deepana, Atisarahara, Kriminashaka' },
    { name: 'Karkatashringi', sanskritName: 'कर्कटशृङ्गी', botanicalName: 'Pistacia chinensis', partUsed: 'Gall', classicalRole: 'Kasahara, Hikkanigrahana, Shwasahara' },
    { name: 'Jivaka', sanskritName: 'जीवक', botanicalName: 'Crepidium acuminatum', partUsed: 'Pseudobulb', classicalRole: 'Jeevaneeya, Balya, Shukrala' },
    { name: 'Rishabhaka', sanskritName: 'ऋषभक', botanicalName: 'Malaxis muscifera', partUsed: 'Pseudobulb', classicalRole: 'Jeevaneeya, Brimhana, Balya' },
    { name: 'Meda', sanskritName: 'मेदा', botanicalName: 'Polygonatum verticillatum', partUsed: 'Rhizome', classicalRole: 'Jeevaneeya, Stanyajanana, Brimhana' },
    { name: 'Mahameda', sanskritName: 'महामेदा', botanicalName: 'Polygonatum cirrhifolium', partUsed: 'Rhizome', classicalRole: 'Jeevaneeya, Shukrala, Rasayana' },

    // 51-60: Rasayana Tonics & Classical Catalyst Complex
    { name: 'Kakoli', sanskritName: 'काकोली', botanicalName: 'Fritillaria roylei', partUsed: 'Tuber', classicalRole: 'Jeevaneeya, Brimhana, Balya' },
    { name: 'Kshirakakoli', sanskritName: 'क्षीरकाकोली', botanicalName: 'Lilium polyphyllum', partUsed: 'Bulb', classicalRole: 'Jeevaneeya, Shukrala, Hridya' },
    { name: 'Riddhi', sanskritName: 'ऋद्धि', botanicalName: 'Habenaria intermedia', partUsed: 'Tuber', classicalRole: 'Jeevaneeya, Balya, Rasayana' },
    { name: 'Vriddhi', sanskritName: 'वृद्धि', botanicalName: 'Habenaria edgeworthii', partUsed: 'Tuber', classicalRole: 'Jeevaneeya, Rasayana, Brimhana' },
    { name: 'Draksha', sanskritName: 'द्राक्षा', botanicalName: 'Vitis vinifera', partUsed: 'Dried fruit', classicalRole: 'Brimhana, Shramahara, Rasayana, Snehana' },
    { name: 'Dhataki', sanskritName: 'धातकी', botanicalName: 'Woodfordia fruticosa', partUsed: 'Flower', classicalRole: 'Sandhaniya, Fermentation catalyst' },
    { name: 'Kankola', sanskritName: 'कङ्कोल', botanicalName: 'Piper cubeba', partUsed: 'Fruit', classicalRole: 'Deepana, Ruchya, Mukhashodhaka' },
    { name: 'Jalamustha', sanskritName: 'जलमुस्त', botanicalName: 'Cyperus esculentus', partUsed: 'Rhizome', classicalRole: 'Pittashamaka, Stanyajanana' },
    { name: 'Chandana (Shweta Chandana)', sanskritName: 'श्वेत चन्दन', botanicalName: 'Santalum album', partUsed: 'Heartwood', classicalRole: 'Dahaprashamana, Varnya, Hridya' },
    { name: 'Jatiphala', sanskritName: 'जातीफल', botanicalName: 'Myristica fragrans', partUsed: 'Seed (Nutmeg)', classicalRole: 'Deepana, Grahi, Ruchya, Vatahara' },

    // 61-63: Prakshepa Dravyas (Aromatic Bioavailability Enhancers)
    { name: 'Lavanga', sanskritName: 'लवङ्ग', botanicalName: 'Syzygium aromaticum', partUsed: 'Flower bud', classicalRole: 'Deepana, Ruchya, Kaphahara, Shoolahara' },
    { name: 'Twak', sanskritName: 'त्वक्', botanicalName: 'Cinnamomum verum', partUsed: 'Stem bark', classicalRole: 'Deepana, Hridya, Ruchya, Vatahara' },
    { name: 'Ela', sanskritName: 'एला', botanicalName: 'Elettaria cardamomum', partUsed: 'Seed', classicalRole: 'Deepana, Ruchya, Hridya, Tridoshahara' }
  ],

  // Amritarishtam
  amritarishtam: [
    { name: 'Amrita (Guduchi)', sanskritName: 'अमृता / गुडूची', botanicalName: 'Tinospora cordifolia', partUsed: 'Stem', classicalRole: 'Jwarahara, Rasayana, Pittashamaka' },
    { name: 'Bilva', sanskritName: 'बिल्व', botanicalName: 'Aegle marmelos', partUsed: 'Root', classicalRole: 'Deepana, Grahi, Vatahara' },
    { name: 'Agnimantha', sanskritName: 'अग्निमन्थ', botanicalName: 'Premna integrifolia', partUsed: 'Root', classicalRole: 'Shothahara, Vatahara' },
    { name: 'Shyonaka', sanskritName: 'श्योनाक', botanicalName: 'Oroxylum indicum', partUsed: 'Root', classicalRole: 'Deepana, Grahi' },
    { name: 'Patala', sanskritName: 'पाटला', botanicalName: 'Stereospermum suaveolens', partUsed: 'Root', classicalRole: 'Hridya, Tridoshahara' },
    { name: 'Gambhari', sanskritName: 'गम्भारी', botanicalName: 'Gmelina arborea', partUsed: 'Root', classicalRole: 'Rasayana, Dahashamaka' },
    { name: 'Brihati', sanskritName: 'बृहती', botanicalName: 'Solanum indicum', partUsed: 'Whole plant', classicalRole: 'Kanthya, Deepana' },
    { name: 'Kantakari', sanskritName: 'कण्टकारी', botanicalName: 'Solanum surattense', partUsed: 'Whole plant', classicalRole: 'Kasahara, Shwasahara' },
    { name: 'Gokshura', sanskritName: 'गोक्षुर', botanicalName: 'Tribulus terrestris', partUsed: 'Fruit', classicalRole: 'Mutrala, Ashmarighna' },
    { name: 'Shalaparni', sanskritName: 'शालपर्णी', botanicalName: 'Desmodium gangeticum', partUsed: 'Whole plant', classicalRole: 'Angamardaprashamana' },
    { name: 'Prishniparni', sanskritName: 'पृश्निपर्णी', botanicalName: 'Uraria picta', partUsed: 'Whole plant', classicalRole: 'Sandhaniya, Tridoshahara' },
    { name: 'Dhataki', sanskritName: 'धातकी', botanicalName: 'Woodfordia fruticosa', partUsed: 'Flower', classicalRole: 'Natural fermentation catalyst' },
    { name: 'Shunti', sanskritName: 'शुण्ठी', botanicalName: 'Zingiber officinale', partUsed: 'Rhizome', classicalRole: 'Amapachana, Deepana' },
    { name: 'Maricha', sanskritName: 'मरिच', botanicalName: 'Piper nigrum', partUsed: 'Fruit', classicalRole: 'Pramathi, Deepana' },
    { name: 'Pippali', sanskritName: 'पिप्पली', botanicalName: 'Piper longum', partUsed: 'Fruit', classicalRole: 'Rasayana, Deepana' },
    { name: 'Nagakeshara', sanskritName: 'नागकेशर', botanicalName: 'Mesua ferrea', partUsed: 'Stamen', classicalRole: 'Grahi, Pachana' }
  ],

  // Abhayarishtam
  abhayarishtam: [
    { name: 'Abhaya (Haritaki)', sanskritName: 'अभया / हरीतकी', botanicalName: 'Terminalia chebula', partUsed: 'Fruit pericarp', classicalRole: 'Anulomana, Arshoghna, Deepana' },
    { name: 'Dhatri (Amalaki)', sanskritName: 'धात्री / आमलकी', botanicalName: 'Phyllanthus emblica', partUsed: 'Fruit pericarp', classicalRole: 'Rasayana, Tridoshahara' },
    { name: 'Kapittha', sanskritName: 'कपित्थ', botanicalName: 'Feronia elephantum', partUsed: 'Fruit pulp', classicalRole: 'Grahi, Vatapittashamaka' },
    { name: 'Vishala (Indravaruni)', sanskritName: 'विशाला / इन्द्रवारुणी', botanicalName: 'Citrullus colocynthis', partUsed: 'Root / Fruit', classicalRole: 'Rechana, Bhedana' },
    { name: 'Vidanga', sanskritName: 'विडङ्ग', botanicalName: 'Embelia ribes', partUsed: 'Fruit', classicalRole: 'Kriminashaka, Deepana' },
    { name: 'Pippali', sanskritName: 'पिप्पली', botanicalName: 'Piper longum', partUsed: 'Fruit', classicalRole: 'Deepana, Pachana' },
    { name: 'Maricha', sanskritName: 'मरिच', botanicalName: 'Piper nigrum', partUsed: 'Fruit', classicalRole: 'Deepana, Shoolahara' },
    { name: 'Dhataki', sanskritName: 'धातकी', botanicalName: 'Woodfordia fruticosa', partUsed: 'Flower', classicalRole: 'Fermentation catalyst' }
  ],

  // Ashokarishtam
  ashokarishtam: [
    { name: 'Ashoka', sanskritName: 'अशोक', botanicalName: 'Saraca asoca', partUsed: 'Stem bark', classicalRole: 'Hormonal balancer, Hridya, Shonitasthapana' },
    { name: 'Dhataki', sanskritName: 'धातकी', botanicalName: 'Woodfordia fruticosa', partUsed: 'Flower', classicalRole: 'Fermentation catalyst' },
    { name: 'Musta', sanskritName: 'मुस्ता', botanicalName: 'Cyperus rotundus', partUsed: 'Tuber', classicalRole: 'Deepana, Pachana, Grahi' },
    { name: 'Shunti', sanskritName: 'शुण्ठी', botanicalName: 'Zingiber officinale', partUsed: 'Rhizome', classicalRole: 'Amapachana, Deepana' },
    { name: 'Haritaki', sanskritName: 'हरीतकी', botanicalName: 'Terminalia chebula', partUsed: 'Fruit pericarp', classicalRole: 'Anulomana, Rasayana' },
    { name: 'Bibhitaki', sanskritName: 'बिभीतक', botanicalName: 'Terminalia bellirica', partUsed: 'Fruit pericarp', classicalRole: 'Kaphahara, Bhedana' },
    { name: 'Amalaki', sanskritName: 'आमलकी', botanicalName: 'Phyllanthus emblica', partUsed: 'Fruit pericarp', classicalRole: 'Rasayana, Raktapittahara' },
    { name: 'Jeeraka', sanskritName: 'जीरक', botanicalName: 'Cuminum cyminum', partUsed: 'Seed', classicalRole: 'Deepana, Garbhashayashodhaka' },
    { name: 'Chandana', sanskritName: 'चन्दन', botanicalName: 'Santalum album', partUsed: 'Heartwood', classicalRole: 'Dahaprashamana, Varnya' }
  ],

  // Triphala Churna
  triphala: [
    { name: 'Haritaki', sanskritName: 'हरीतकी', botanicalName: 'Terminalia chebula', partUsed: 'Fruit pericarp', classicalRole: 'Anulomana, Vatahara, Rasayana' },
    { name: 'Bibhitaki', sanskritName: 'बिभीतक', botanicalName: 'Terminalia bellirica', partUsed: 'Fruit pericarp', classicalRole: 'Bhedana, Kaphahara, Chakshushya' },
    { name: 'Amalaki', sanskritName: 'आमलकी', botanicalName: 'Phyllanthus emblica', partUsed: 'Fruit pericarp', classicalRole: 'Rasayana, Pittahara, Chakshushya' }
  ]
};

/**
 * Normalizes formulation name and retrieves authentic classical ingredients.
 */
export function getClassicalFormulationIngredients(productName: string): IngredientItem[] | null {
  if (!productName || typeof productName !== 'string') return null;
  const clean = productName.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (clean.includes('dashamoola') || clean.includes('dasamoola') || clean.includes('dashamularishta')) {
    return CLASSICAL_FORMULATIONS_RECIPES.dashamoolarishtam;
  }
  if (clean.includes('amritarishta') || clean.includes('amrutharishta')) {
    return CLASSICAL_FORMULATIONS_RECIPES.amritarishtam;
  }
  if (clean.includes('abhayarishta')) {
    return CLASSICAL_FORMULATIONS_RECIPES.abhayarishtam;
  }
  if (clean.includes('ashokarishta')) {
    return CLASSICAL_FORMULATIONS_RECIPES.ashokarishtam;
  }
  if (clean.includes('triphala')) {
    return CLASSICAL_FORMULATIONS_RECIPES.triphala;
  }

  return null;
}
