import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind merge utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
const geocodeCache = new Map<string, { lat: number; lng: number } | null>();

const DANISH_POSTAL_CODES: Record<string, { lat: number; lng: number; city: string }> = {
  // Copenhagen area
   '1000': { lat: 55.6761, lng: 12.5683, city: 'København K' },
  '1050': { lat: 55.6781, lng: 12.5762, city: 'København K' },
  '1100': { lat: 55.6839, lng: 12.5726, city: 'København K' },
  '1200': { lat: 55.6761, lng: 12.5683, city: 'København K' },
  '1300': { lat: 55.6761, lng: 12.5683, city: 'København K' },
  '1400': { lat: 55.6689, lng: 12.5537, city: 'København K' },
  '1500': { lat: 55.6736, lng: 12.5442, city: 'København V' },
  '1600': { lat: 55.6736, lng: 12.5442, city: 'København V' },
  '1700': { lat: 55.6736, lng: 12.5442, city: 'København V' },
  '1800': { lat: 55.6736, lng: 12.5442, city: 'Frederiksberg C' },
  '1900': { lat: 55.6736, lng: 12.5442, city: 'Frederiksberg C' },
  '2000': { lat: 55.6890, lng: 12.5497, city: 'Frederiksberg' },
  '2100': { lat: 55.7126, lng: 12.5527, city: 'København Ø' },
  '2200': { lat: 55.6938, lng: 12.5538, city: 'København N' },
  '2300': { lat: 55.6867, lng: 12.5890, city: 'København S' },
  '2400': { lat: 55.6647, lng: 12.5058, city: 'København NV' },
  '2450': { lat: 55.6547, lng: 12.5158, city: 'København SV' },
  '2500': { lat: 55.6308, lng: 12.3567, city: 'Valby' },
  '2600': { lat: 55.6395, lng: 12.4462, city: 'Glostrup' },
  '2605': { lat: 55.6695, lng: 12.4062, city: 'Brøndby' },
  '2610': { lat: 55.6795, lng: 12.4162, city: 'Rødovre' },
  '2620': { lat: 55.6495, lng: 12.3962, city: 'Albertslund' },
  '2625': { lat: 55.6195, lng: 12.3662, city: 'Vallensbæk' },
  '2630': { lat: 55.6295, lng: 12.3762, city: 'Taastrup' },
  '2635': { lat: 55.6095, lng: 12.3562, city: 'Ishøj' },
  '2640': { lat: 55.6195, lng: 12.3662, city: 'Hedehusene' },
  '2650': { lat: 55.6536, lng: 12.3564, city: 'Hvidovre' },
  '2660': { lat: 55.6236, lng: 12.5064, city: 'Brøndby Strand' },
  '2670': { lat: 55.5936, lng: 12.3264, city: 'Greve' },
  '2680': { lat: 55.5636, lng: 12.2964, city: 'Solrød Strand' },
  '2690': { lat: 55.5336, lng: 12.2664, city: 'Karlslunde' },
  '2700': { lat: 55.6181, lng: 12.4824, city: 'Brønshøj' },
  '2720': { lat: 55.6269, lng: 12.4705, city: 'Vanløse' },
  '2730': { lat: 55.7069, lng: 12.4505, city: 'Herlev' },
  '2740': { lat: 55.7169, lng: 12.4605, city: 'Skovlunde' },
  '2750': { lat: 55.7269, lng: 12.4705, city: 'Ballerup' },
  '2760': { lat: 55.7369, lng: 12.3805, city: 'Måløv' },
  '2765': { lat: 55.7469, lng: 12.3905, city: 'Smørum' },
  '2770': { lat: 55.6569, lng: 12.5905, city: 'Kastrup' },
  '2791': { lat: 55.6269, lng: 12.6205, city: 'Dragør' },
  '2800': { lat: 55.7158, lng: 12.5229, city: 'Kongens Lyngby' },
  '2820': { lat: 55.7558, lng: 12.5029, city: 'Gentofte' },
  '2830': { lat: 55.7358, lng: 12.4829, city: 'Virum' },
  '2840': { lat: 55.7458, lng: 12.4629, city: 'Holte' },
  '2850': { lat: 55.7858, lng: 12.4429, city: 'Nærum' },
  '2860': { lat: 55.7258, lng: 12.4029, city: 'Søborg' },
  '2870': { lat: 55.7658, lng: 12.4229, city: 'Dyssegård' },
  '2880': { lat: 55.7058, lng: 12.3829, city: 'Bagsværd' },
  '2900': { lat: 55.7522, lng: 12.5169, city: 'Hellerup' },
  '2920': { lat: 55.7922, lng: 12.5569, city: 'Charlottenlund' },
  '2930': { lat: 55.8022, lng: 12.5669, city: 'Klampenborg' },
  '2942': { lat: 55.8122, lng: 12.5769, city: 'Skodsborg' },
  '2950': { lat: 55.8222, lng: 12.5869, city: 'Vedbæk' },
  '2960': { lat: 55.8322, lng: 12.5969, city: 'Rungsted Kyst' },
  '2970': { lat: 55.8422, lng: 12.5069, city: 'Hørsholm' },
  '2980': { lat: 55.8522, lng: 12.4169, city: 'Kokkedal' },
  '2990': { lat: 55.8622, lng: 12.4269, city: 'Nivå' },

  // Nordsjælland (3000-3699)
  '3000': { lat: 55.7781, lng: 12.5084, city: 'Helsingør' },
  '3050': { lat: 55.8681, lng: 12.4584, city: 'Humlebæk' },
  '3060': { lat: 55.8781, lng: 12.4684, city: 'Espergærde' },
  '3070': { lat: 55.8881, lng: 12.4784, city: 'Snekkersten' },
  '3080': { lat: 55.8981, lng: 12.4884, city: 'Tikøb' },
  '3100': { lat: 55.9081, lng: 12.4984, city: 'Hornbæk' },
  '3120': { lat: 55.9181, lng: 12.5084, city: 'Dronningmølle' },
  '3140': { lat: 55.9281, lng: 12.5184, city: 'Ålsgårde' },
  '3150': { lat: 55.9381, lng: 12.5284, city: 'Hellebæk' },
  '3200': { lat: 55.9481, lng: 12.3384, city: 'Helsinge' },
  '3210': { lat: 55.9581, lng: 12.3484, city: 'Vejby' },
  '3220': { lat: 55.9681, lng: 12.3584, city: 'Tisvildeleje' },
  '3230': { lat: 55.9781, lng: 12.3684, city: 'Græsted' },
  '3250': { lat: 55.9881, lng: 12.3784, city: 'Gilleleje' },
  '3300': { lat: 55.8981, lng: 12.2884, city: 'Frederiksværk' },
  '3310': { lat: 55.9081, lng: 12.2984, city: 'Ølsted' },
  '3320': { lat: 55.9181, lng: 12.3084, city: 'Skævinge' },
  '3330': { lat: 55.9281, lng: 12.3184, city: 'Gørløse' },
  '3360': { lat: 55.9381, lng: 12.3284, city: 'Liseleje' },
  '3370': { lat: 55.9481, lng: 12.3384, city: 'Melby' },
  '3390': { lat: 55.9581, lng: 12.3484, city: 'Hundested' },
  '3400': { lat: 55.8839, lng: 12.4924, city: 'Hillerød' },
  '3450': { lat: 55.8339, lng: 12.4424, city: 'Allerød' },
  '3460': { lat: 55.8439, lng: 12.3524, city: 'Birkerød' },
  '3480': { lat: 55.8539, lng: 12.3624, city: 'Fredensborg' },
  '3490': { lat: 55.8639, lng: 12.3724, city: 'Kvistgård' },
  '3500': { lat: 55.8739, lng: 12.2824, city: 'Værløse' },
  '3520': { lat: 55.8839, lng: 12.2924, city: 'Farum' },
  '3540': { lat: 55.8939, lng: 12.3024, city: 'Lynge' },
  '3550': { lat: 55.9039, lng: 12.3124, city: 'Slangerup' },
  '3600': { lat: 55.7839, lng: 12.1924, city: 'Frederikssund' },
  '3630': { lat: 55.7939, lng: 12.2024, city: 'Jægerspris' },
  '3650': { lat: 55.8039, lng: 12.2124, city: 'Ølstykke' },
  '3660': { lat: 55.8139, lng: 12.2224, city: 'Stenløse' },
  '3670': { lat: 55.8239, lng: 12.2324, city: 'Veksø Sjælland' },

  // Midt- og Vestsjælland (4000-4999)
  '4000': { lat: 55.4038, lng: 12.1823, city: 'Roskilde' },
  '4040': { lat: 55.4538, lng: 12.1323, city: 'Jyllinge' },
  '4050': { lat: 55.4638, lng: 12.1423, city: 'Skibby' },
  '4060': { lat: 55.4738, lng: 12.1523, city: 'Kirke Såby' },
  '4070': { lat: 55.4838, lng: 12.1623, city: 'Kirke Hyllinge' },
  '4100': { lat: 55.4938, lng: 11.7723, city: 'Ringsted' },
  '4130': { lat: 55.5038, lng: 11.7823, city: 'Viby Sjælland' },
  '4140': { lat: 55.5138, lng: 11.7923, city: 'Borup' },
  '4160': { lat: 55.5238, lng: 11.8023, city: 'Herlufmagle' },
  '4171': { lat: 55.5338, lng: 11.8123, city: 'Glumsø' },
  '4173': { lat: 55.5438, lng: 11.8223, city: 'Fjenneslev' },
  '4174': { lat: 55.5538, lng: 11.8323, city: 'Jystrup Midtsj' },
  '4180': { lat: 55.5638, lng: 11.5423, city: 'Sorø' },
  '4190': { lat: 55.5738, lng: 11.5523, city: 'Munke Bjergby' },
  '4200': { lat: 55.3838, lng: 11.3623, city: 'Slagelse' },
  '4220': { lat: 55.3938, lng: 11.3723, city: 'Korsør' },
  '4230': { lat: 55.4038, lng: 11.3823, city: 'Skælskør' },
  '4241': { lat: 55.4138, lng: 11.3923, city: 'Vemmelev' },
  '4242': { lat: 55.4238, lng: 11.4023, city: 'Boeslunde' },
  '4243': { lat: 55.4338, lng: 11.4123, city: 'Rude' },
  '4250': { lat: 55.4438, lng: 11.4223, city: 'Fuglebjerg' },
  '4261': { lat: 55.4538, lng: 11.4323, city: 'Dalmose' },
  '4262': { lat: 55.4638, lng: 11.4423, city: 'Sandved' },
  '4270': { lat: 55.4738, lng: 11.4523, city: 'Høng' },
  '4281': { lat: 55.4838, lng: 11.4623, city: 'Gørlev' },
  '4291': { lat: 55.4938, lng: 11.4723, city: 'Ruds Vedby' },
  '4293': { lat: 55.5038, lng: 11.4823, city: 'Dianalund' },
   '4295': { lat: 55.5138, lng: 11.4923, city: 'Stenlille' },
  '4296': { lat: 55.5238, lng: 11.5023, city: 'Nyrup' },
  '4300': { lat: 55.6438, lng: 11.2723, city: 'Holbæk' },
  '4320': { lat: 55.5538, lng: 11.6823, city: 'Lejre' },
  '4330': { lat: 55.5638, lng: 11.6923, city: 'Hvalsø' },
  '4340': { lat: 55.5738, lng: 11.7023, city: 'Tølløse' },
  '4350': { lat: 55.5838, lng: 11.7123, city: 'Ugerløse' },
  '4360': { lat: 55.5938, lng: 11.7223, city: 'Kirke Eskilstrup' },
  '4370': { lat: 55.6038, lng: 11.7323, city: 'Store Merløse' },
  '4390': { lat: 55.6138, lng: 11.7423, city: 'Vipperød' },
  '4400': { lat: 55.7238, lng: 11.4123, city: 'Kalundborg' },
  '4420': { lat: 55.6338, lng: 11.3223, city: 'Regstrup' },
  '4440': { lat: 55.6438, lng: 11.3323, city: 'Mørkøv' },
  '4450': { lat: 55.6538, lng: 11.3423, city: 'Jyderup' },
  '4460': { lat: 55.6638, lng: 11.3523, city: 'Snertinge' },
  '4470': { lat: 55.6738, lng: 11.3623, city: 'Svebølle' },
  '4480': { lat: 55.6838, lng: 11.3723, city: 'Store Fuglede' },
  '4490': { lat: 55.6938, lng: 11.3823, city: 'Jerslev Sjælland' },
  '4500': { lat: 55.8338, lng: 11.5923, city: 'Nykøbing Sj' },
  '4520': { lat: 55.7438, lng: 11.5023, city: 'Svinninge' },
  '4532': { lat: 55.7538, lng: 11.5123, city: 'Gislinge' },
  '4534': { lat: 55.7638, lng: 11.5223, city: 'Hørve' },
  '4540': { lat: 55.7738, lng: 11.5323, city: 'Fårevejle' },
  '4550': { lat: 55.7838, lng: 11.5423, city: 'Asnæs' },
  '4560': { lat: 55.7938, lng: 11.5523, city: 'Vig' },
  '4571': { lat: 55.8038, lng: 11.5623, city: 'Grevinge' },
  '4572': { lat: 55.8138, lng: 11.5723, city: 'Nørre Asmindrup' },
  '4573': { lat: 55.8238, lng: 11.5823, city: 'Højby' },
  '4581': { lat: 55.8338, lng: 11.5923, city: 'Rørvig' },
  '4583': { lat: 55.8438, lng: 11.6023, city: 'Sjællands Odde' },
  '4591': { lat: 55.8538, lng: 11.6123, city: 'Føllenslev' },
  '4592': { lat: 55.8638, lng: 11.6223, city: 'Sejerø' },
  '4593': { lat: 55.8738, lng: 11.6323, city: 'Eskebjerg' },
  '4600': { lat: 55.2738, lng: 11.9023, city: 'Køge' },
  '4621': { lat: 55.2838, lng: 11.9123, city: 'Gadstrup' },
  '4622': { lat: 55.2938, lng: 11.9223, city: 'Havdrup' },
  '4623': { lat: 55.3038, lng: 11.9323, city: 'Lille Skensved' },
  '4632': { lat: 55.3138, lng: 11.9423, city: 'Bjæverskov' },
  '4640': { lat: 55.1738, lng: 12.0523, city: 'Faxe' },
  '4652': { lat: 55.1838, lng: 12.0623, city: 'Hårlev' },
  '4653': { lat: 55.1938, lng: 12.0723, city: 'Karise' },
  '4654': { lat: 55.2038, lng: 12.0823, city: 'Faxe Ladeplads' },
  '4660': { lat: 55.2138, lng: 12.0923, city: 'Store Heddinge' },
  '4671': { lat: 55.2238, lng: 12.1023, city: 'Strøby' },
  '4672': { lat: 55.2338, lng: 12.1123, city: 'Klippinge' },
  '4673': { lat: 55.2438, lng: 12.1223, city: 'Rødvig Stevns' },
  '4681': { lat: 55.2538, lng: 12.1323, city: 'Herfølge' },
  '4682': { lat: 55.2638, lng: 12.1423, city: 'Tureby' },
  '4683': { lat: 55.2738, lng: 12.1523, city: 'Rønnede' },
  '4684': { lat: 55.2838, lng: 12.1623, city: 'Holmegaard' },
  '4690': { lat: 55.2938, lng: 11.8723, city: 'Haslev' },
  '4700': { lat: 55.0538, lng: 11.7623, city: 'Næstved' },
  '4720': { lat: 54.9638, lng: 11.8723, city: 'Præstø' },
  '4733': { lat: 54.9738, lng: 11.8823, city: 'Tappernøje' },
  '4735': { lat: 54.9838, lng: 11.8923, city: 'Mern' },
  '4736': { lat: 54.9938, lng: 11.9023, city: 'Karrebæksminde' },
  '4750': { lat: 54.8338, lng: 11.8623, city: 'Lundby' },
  '4760': { lat: 54.7638, lng: 11.9723, city: 'Vordingborg' },
  '4771': { lat: 54.7738, lng: 11.9823, city: 'Kalvehave' },
  '4772': { lat: 54.7838, lng: 11.9923, city: 'Langebæk' },
  '4773': { lat: 54.7938, lng: 12.0023, city: 'Stensved' },
  '4780': { lat: 54.8038, lng: 12.0123, city: 'Stege' },
  '4791': { lat: 54.8138, lng: 12.0223, city: 'Borre' },
  '4792': { lat: 54.8238, lng: 12.0323, city: 'Askeby' },
  '4793': { lat: 54.8338, lng: 12.0423, city: 'Bogø By' },
  '4800': { lat: 54.7738, lng: 11.5023, city: 'Nykøbing F' },
  '4840': { lat: 54.6838, lng: 11.3523, city: 'Nørre Alslev' },
  '4850': { lat: 54.6938, lng: 11.3623, city: 'Stubbekøbing' },
  '4862': { lat: 54.7038, lng: 11.3723, city: 'Guldborg' },
  '4863': { lat: 54.7138, lng: 11.3823, city: 'Eskilstrup' },
  '4871': { lat: 54.7238, lng: 11.3923, city: 'Horbelev' },
  '4872': { lat: 54.7338, lng: 11.4023, city: 'Idestrup' },
  '4873': { lat: 54.7438, lng: 11.4123, city: 'Væggerløse' },
  '4874': { lat: 54.7538, lng: 11.4223, city: 'Gedser' },
  '4880': { lat: 54.7638, lng: 11.4323, city: 'Nysted' },
  '4891': { lat: 54.7738, lng: 11.4423, city: 'Toreby L' },
  '4892': { lat: 54.7838, lng: 11.4523, city: 'Kettinge' },
  '4894': { lat: 54.7938, lng: 11.4623, city: 'Øster Ulslev' },
  '4895': { lat: 54.8038, lng: 11.4723, city: 'Errindlev' },
  '4900': { lat: 54.6938, lng: 11.8623, city: 'Nakskov' },
  '4912': { lat: 54.7038, lng: 11.8723, city: 'Harpelunde' },
  '4913': { lat: 54.7138, lng: 11.8823, city: 'Horslunde' },
  '4920': { lat: 54.7238, lng: 11.8923, city: 'Søllested' },
  '4930': { lat: 54.8038, lng: 11.1423, city: 'Maribo' },
  '4941': { lat: 54.8138, lng: 11.1523, city: 'Bandholm' },
  '4943': { lat: 54.8238, lng: 11.1623, city: 'Torrig L' },
  '4944': { lat: 54.8338, lng: 11.1723, city: 'Fejø' },
  '4951': { lat: 54.8438, lng: 11.1823, city: 'Nørreballe' },
  '4952': { lat: 54.8538, lng: 11.1923, city: 'Stokkemarke' },
  '4953': { lat: 54.8638, lng: 11.2023, city: 'Vesterborg' },
  '4960': { lat: 54.8738, lng: 11.2123, city: 'Holeby' },
  '4970': { lat: 54.8838, lng: 11.2223, city: 'Rødby' },
  '4983': { lat: 54.8938, lng: 11.2323, city: 'Dannemare' },
  '4990': { lat: 54.9038, lng: 11.2423, city: 'Sakskøbing' },

  // Fyn (5000-5999)
  '5000': { lat: 55.3959, lng: 10.3883, city: 'Odense C' },
  '5200': { lat: 55.4059, lng: 10.3983, city: 'Odense V' },
  '5210': { lat: 55.4159, lng: 10.4083, city: 'Odense NV' },
  '5220': { lat: 55.4259, lng: 10.4183, city: 'Odense SØ' },
  '5230': { lat: 55.4359, lng: 10.4283, city: 'Odense M' },
  '5240': { lat: 55.4459, lng: 10.4383, city: 'Odense NØ' },
  '5250': { lat: 55.4559, lng: 10.4483, city: 'Odense SV' },
  '5260': { lat: 55.4659, lng: 10.4583, city: 'Odense S' },
  '5270': { lat: 55.4759, lng: 10.4683, city: 'Odense N' },
  '5290': { lat: 55.4859, lng: 10.4783, city: 'Marslev' },
  '5300': { lat: 55.2459, lng: 10.4883, city: 'Kerteminde' },
  '5320': { lat: 55.2559, lng: 10.4983, city: 'Agedrup' },
  '5330': { lat: 55.2659, lng: 10.5083, city: 'Munkebo' },
  '5350': { lat: 55.2759, lng: 10.5183, city: 'Rynkeby' },
  '5370': { lat: 55.2859, lng: 10.5283, city: 'Mesinge' },
  '5380': { lat: 55.2959, lng: 10.5383, city: 'Dalby' },
  '5390': { lat: 55.3059, lng: 10.5483, city: 'Martofte' },
  '5400': { lat: 55.5159, lng: 10.2483, city: 'Bogense' },
  '5450': { lat: 55.4659, lng: 10.1983, city: 'Otterup' },
  '5462': { lat: 55.4759, lng: 10.2083, city: 'Morud' },
  '5463': { lat: 55.4859, lng: 10.2183, city: 'Harndrup' },
  '5464': { lat: 55.4959, lng: 10.2283, city: 'Brenderup Fyn' },
  '5466': { lat: 55.5059, lng: 10.2383, city: 'Asperup' },
  '5471': { lat: 55.5159, lng: 10.2483, city: 'Søndersø' },
  '5474': { lat: 55.5259, lng: 10.2583, city: 'Veflinge' },
  '5485': { lat: 55.5359, lng: 10.2683, city: 'Skamby' },
  // Add more postal codes as needed
};

// Default coordinates for Denmark (center of country)
const DEFAULT_COORDS = { lat: 56.2639, lng: 9.5018 };

export async function geocodePostalCode(postalCode: string): Promise<{ lat: number; lng: number } | null> {
  // Check cache first
  if (geocodeCache.has(postalCode)) {
    return geocodeCache.get(postalCode);
  }

  // Try static database first (fastest and most reliable)
  if (DANISH_POSTAL_CODES[postalCode]) {
    const coords = {
      lat: DANISH_POSTAL_CODES[postalCode].lat,
      lng: DANISH_POSTAL_CODES[postalCode].lng
    };
    geocodeCache.set(postalCode, coords);
    return coords;
  }

  // Try API as fallback
  try {
    console.log(`Geocoding ${postalCode} via API...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      const API_BASE =
        typeof window === 'undefined'
          ? process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000'
          : '';
          const res = await fetch(`${API_BASE}/api/geocode?postalCode=${encodeURIComponent(postalCode)}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Geocoding API failed for ${postalCode}: ${res.status}`);
      geocodeCache.set(postalCode, null);
      return null;
    }

    const data = await res.json();

    // Handle different response formats
    if (data.error) {
      console.warn(`Geocoding error for ${postalCode}:`, data.error);
      geocodeCache.set(postalCode, null);
      return null;
    }

    // If data is an array (direct Nominatim response)
    if (Array.isArray(data)) {
      if (data.length === 0) {
        geocodeCache.set(postalCode, null);
        return null;
      }
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      geocodeCache.set(postalCode, coords);
      return coords;
    }

    // If data is an object (formatted response)
    if (data.lat && data.lng) {
      const coords = { lat: data.lat, lng: data.lng };
      geocodeCache.set(postalCode, coords);
      return coords;
    }

    console.warn(`Unexpected response format for ${postalCode}:`, data);
    geocodeCache.set(postalCode, null);
    return null;

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`Geocoding timeout for ${postalCode}`);
    } else {
      console.warn(`Geocoding error for ${postalCode}:`, error);
    }
    geocodeCache.set(postalCode, null);
    return null;
  }
}

// Alternative function that always returns coordinates (with fallback)
export async function geocodePostalCodeWithFallback(postalCode: string): Promise<{ lat: number; lng: number }> {
  const result = await geocodePostalCode(postalCode);
  return result || DEFAULT_COORDS;
}

// Batch geocoding with rate limiting
export async function batchGeocode(postalCodes: string[], delayMs: number = 1000): Promise<Map<string, { lat: number; lng: number } | null>> {
  const results = new Map<string, { lat: number; lng: number } | null>();
  
  for (let i = 0; i < postalCodes.length; i++) {
    const postalCode = postalCodes[i];
    
    // Add delay between requests (except for first one)
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    const coords = await geocodePostalCode(postalCode);
    results.set(postalCode, coords);
    
    // Log progress
    console.log(`Geocoded ${i + 1}/${postalCodes.length}: ${postalCode}`);
  }
  
  return results;
}
