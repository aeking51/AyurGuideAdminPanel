import { Category, Product, User, AuditLog } from '../types';

export const initialCategories: Category[] = [
  { id: 1, name: "Arishtam", code: "ARI", description: "Self-generated herbal fermented elixirs and tonics prepared with boiled decoction bases.", sortOrder: 1, status: "Active" },
  { id: 2, name: "Asavam", code: "ASA", description: "Fermented herbal infusions prepared with fresh juices or cold water extracts.", sortOrder: 2, status: "Active" },
  { id: 3, name: "Arkam", code: "ARK", description: "Distilled herbal extracts capturing essential aromatic actives.", sortOrder: 3, status: "Active" },
  { id: 4, name: "Bhasmas / Ksharams", code: "BHA", description: "Calcined nano-mineral preparations and purified alkaline botanical ashes.", sortOrder: 4, status: "Active" },
  { id: 5, name: "Choornams", code: "CHO", description: "Finely sifted botanical powders for digestive, metabolic and systemic therapeutic use.", sortOrder: 5, status: "Active" },
  { id: 6, name: "Gulika & Tablets", code: "GUL", description: "Classical hand-rolled pills, compressed tablets and vegetarian capsules.", sortOrder: 6, status: "Active" },
  { id: 7, name: "Single Herb Vegan Capsules", code: "SHC", description: "Pure single botanical standard extracts in 100% vegetarian plant cellulose shells.", sortOrder: 7, status: "Active" },
  { id: 8, name: "Kashayams", code: "KAS", description: "Concentrated aqueous herbal extracts formulated according to classical treatises.", sortOrder: 8, status: "Active" },
  { id: 9, name: "Kashayam Tablets", code: "KTB", description: "Spray-dried aqueous herbal decoctions compressed into convenient, precise tablet forms.", sortOrder: 9, status: "Active" },
  { id: 10, name: "Preservative Free Kashayam Sachet", code: "KSC", description: "Pure vacuum-sealed classical decoctions with zero artificial preservatives.", sortOrder: 10, status: "Active" },
  { id: 11, name: "Lehyams", code: "LEH", description: "Semi-solid nutritive herbal jams prepared in raw jaggery, honey and cow ghee.", sortOrder: 11, status: "Active" },
  { id: 12, name: "Ghruthams", code: "GHR", description: "Medicated cow ghee preparations crossing the blood-brain barrier for deep cellular delivery.", sortOrder: 12, status: "Active" },
  { id: 13, name: "Avartis", code: "AVA", description: "Repeatedly potentiated herbal lipid formulations processed up to 101 cycles.", sortOrder: 13, status: "Active" },
  { id: 14, name: "Soft Gel Capsules", code: "SGC", description: "Lipid-soluble classical medicated oils and actives encapsulated for modern palate.", sortOrder: 14, status: "Active" },
  { id: 15, name: "Sevams / Vasthi Thailams", code: "SVT", description: "Internal administration and panchakarma basti (enema) medicated oils.", sortOrder: 15, status: "Active" },
  { id: 16, name: "Eranda Thailams", code: "ERA", description: "Herbal-infused purified castor oil preparations for metabolic purgation and vata disorders.", sortOrder: 16, status: "Active" },
  { id: 17, name: "Thailams", code: "THI", description: "Traditional sesame oil-based external and internal medicated preparations.", sortOrder: 17, status: "Active" },
  { id: 18, name: "Kuzhambu", code: "KUZ", description: "Thick, viscous poly-herbal multi-oil formulations for musculoskeletal and joint disorders.", sortOrder: 18, status: "Active" },
  { id: 19, name: "Lepams / Ointments", code: "LEP", description: "Therapeutic herbal pastes, creams and topical emollient salves for dermatological applications.", sortOrder: 19, status: "Active" },
  { id: 20, name: "Ethical Patents", code: "PAT", description: "Scientifically validated proprietary intellectual formulas and targeted therapeutic blends.", sortOrder: 20, status: "Active" },
  { id: 21, name: "Drops (Nasya / Netra)", code: "DRP", description: "Nasal (Nasya), ear (Karnapoorana) and eye drop formulations.", sortOrder: 21, status: "Active" },
  { id: 22, name: "Syrups / Tonics", code: "SYR", description: "Palatable sweet medicinal syrups for pediatric and geriatric care.", sortOrder: 22, status: "Active" },
  { id: 23, name: "Kera Thailams", code: "KTH", description: "Pitta-pacifying cooling medicated oils prepared in pure cold-pressed coconut oil.", sortOrder: 23, status: "Active" },
  { id: 24, name: "OTC Wellness Products", code: "OTC", description: "Direct consumer wellness preparations, lozenges, balms and health boosters.", sortOrder: 24, status: "Active" }
];

// Clean initial data: zero placeholder products and zero placeholder users
export const initialProducts: Product[] = [];
export const initialUsers: User[] = [];
export const initialAuditLogs: AuditLog[] = [];
