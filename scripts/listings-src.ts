/**
 * Hand-authored listing rows. Expanded into data/listings.json by scripts/generate-data.ts.
 *
 * amenity codes:  C car parking · T two-wheeler parking · P pets · B balcony · G gated
 *                 U power backup · W washing machine · K modular kitchen
 * lifestyle codes: g guests · t no timing · n non-veg · o owner elsewhere · f women-friendly
 *                  q quiet street · m groceries nearby
 * rooms: three space-separated tokens; "b" = attached bath, "a" = AC, "-" = neither.
 */
import type { AreaId } from "../lib/data/catalog";
import type { Furnishing } from "../lib/data/types";

export interface Row {
  id: string;
  title: string;
  area: AreaId;
  society: string;
  street: string;
  rent: number;
  deposit: number;
  bhk: number;
  baths: number;
  sqft: number;
  floor: number;
  floors: number;
  lift: boolean;
  furnishing: Furnishing;
  am: string;
  life: string;
  rooms: string;
  metro: number | null;
  availIn: number;
  by: "owner" | "broker";
  desc: string;
}

export const ROWS: Row[] = [
  // ——— Baner ———
  { id: "bnr-01", title: "Top-floor 3BHK with a private terrace", area: "baner", society: "Kesar Heights", street: "Pancard Club Road",
    rent: 54000, deposit: 150000, bhk: 3, baths: 3, sqft: 1380, floor: 11, floors: 11, lift: true, furnishing: "full",
    am: "CTPBGUWK", life: "gtnofm", rooms: "ba ba a", metro: 12, availIn: 10, by: "owner",
    desc: "Corner flat on the top floor with a 200 sq ft terrace that catches the evening breeze off the Baner hill. Owner lives in Bangalore and is relaxed about pets and guests. The drive to Hinjewadi Phase 1 is the catch at peak hour." },
  { id: "bnr-02", title: "Airy 3BHK in a low-rise near Baner Gaon", area: "baner", society: "Mitra Kunj", street: "Baner Gaon Lane 4",
    rent: 60000, deposit: 180000, bhk: 3, baths: 3, sqft: 1290, floor: 4, floors: 4, lift: false, furnishing: "semi",
    am: "TBGK", life: "gnqm", rooms: "b b -", metro: 20, availIn: 25, by: "broker",
    desc: "Four-storey building tucked behind the old village temple, so it's quiet after 9 pm. Big windows on both sides. Top floor with no lift and the rent is at the upper end for the lane." },
  { id: "bnr-03", title: "Tidy 3BHK close to Baner metro", area: "baner", society: "Sai Aangan", street: "Baner Road, near Mahabaleshwar Hotel",
    rent: 58000, deposit: 200000, bhk: 3, baths: 2, sqft: 1150, floor: 6, floors: 9, lift: true, furnishing: "semi",
    am: "CTGUK", life: "tm", rooms: "b a -", metro: 6, availIn: 40, by: "broker",
    desc: "Six minutes' walk to the Baner metro station with a supermarket on the ground floor. Only two bathrooms for three bedrooms. Society rules say no pets and the owner prefers vegetarian tenants." },

  // ——— Balewadi ———
  { id: "bal-01", title: "Sunny 3BHK a walk from Balewadi High Street", area: "balewadi", society: "Amber Crest", street: "Balewadi High Street",
    rent: 51000, deposit: 150000, bhk: 3, baths: 3, sqft: 1320, floor: 6, floors: 12, lift: true, furnishing: "semi",
    am: "CTPGUWK", life: "gtnofm", rooms: "ba a a", metro: 18, availIn: 14, by: "owner",
    desc: "East-facing, with a washing machine and ACs in all three bedrooms already fitted. Balewadi High Street's cafés are five minutes away. No balcony, and the building faces the main road." },
  { id: "bal-02", title: "Compact ground-floor 3BHK behind the stadium", area: "balewadi", society: "Shree Ganesh Residency", street: "Stadium Road, Lane 2",
    rent: 48000, deposit: 120000, bhk: 3, baths: 2, sqft: 1060, floor: 1, floors: 4, lift: false, furnishing: "unfurnished",
    am: "TPBU", life: "tqm", rooms: "b - -", metro: 12, availIn: 30, by: "owner",
    desc: "First-floor flat in a small four-storey building, so no lift is needed. Twelve minutes on foot to the Balewadi stadium metro. It's unfurnished and the rooms are on the smaller side." },
  { id: "bal-03", title: "Premium 3BHK in a gated Balewadi tower", area: "balewadi", society: "Orchid Towers", street: "Balewadi Phata",
    rent: 57000, deposit: 150000, bhk: 3, baths: 3, sqft: 1410, floor: 14, floors: 18, lift: true, furnishing: "full",
    am: "CTPBGUWK", life: "gtnof", rooms: "ba ba a", metro: 14, availIn: 20, by: "broker",
    desc: "Clubhouse, pool and a proper gym downstairs, fully furnished and ready to move in. Balconies off two bedrooms. Priced slightly above most Balewadi 3BHKs." },
  { id: "bal-04", title: "Older 3BHK in a walk-up near Balewadi Gaon", area: "balewadi", society: "Ashirwad Apartments", street: "Balewadi Gaon Road",
    rent: 44000, deposit: 100000, bhk: 3, baths: 2, sqft: 1100, floor: 4, floors: 4, lift: false, furnishing: "semi",
    am: "TBK", life: "gnm", rooms: "b - -", metro: 22, availIn: 5, by: "owner",
    desc: "Good value for the area and the owner has just repainted. Top floor of a walk-up, so it's four flights with shopping bags. No power backup." },

  // ——— Aundh ———
  { id: "aun-01", title: "Spacious 3BHK off ITI Road", area: "aundh", society: "Parihar Greens", street: "ITI Road",
    rent: 68000, deposit: 200000, bhk: 3, baths: 3, sqft: 1450, floor: 5, floors: 10, lift: true, furnishing: "full",
    am: "CTBGUWK", life: "gtofqm", rooms: "ba ba a", metro: 10, availIn: 35, by: "broker",
    desc: "Quiet, leafy stretch of ITI Road with bakeries and D-Mart nearby. Fully furnished with good light. It's expensive, and the drive to Hinjewadi at peak hour is long." },
  { id: "aun-02", title: "Old-Aundh 3BHK with a big balcony", area: "aundh", society: "Sindh Society Row", street: "Sindh Society, Lane 3",
    rent: 48000, deposit: 150000, bhk: 3, baths: 2, sqft: 1250, floor: 3, floors: 3, lift: false, furnishing: "semi",
    am: "TBGK", life: "gnqm", rooms: "b - -", metro: 15, availIn: 12, by: "owner",
    desc: "Top floor of a 1980s building in one of Aundh's calmest lanes, with a long balcony over mango trees. No lift. The owner lives on the ground floor." },
  { id: "aun-03", title: "2BHK + study near Bremen Chowk", area: "aundh", society: "Vasundhara", street: "DP Road, Bremen Chowk",
    rent: 42000, deposit: 120000, bhk: 2, baths: 2, sqft: 1020, floor: 0, floors: 7, lift: true, furnishing: "semi",
    am: "CTGUK", life: "tnm", rooms: "b - -", metro: 9, availIn: 8, by: "broker",
    desc: "Ground-floor flat with a small sit-out garden, and the study is big enough for a single bed. Only two bathrooms. It faces the parking lot." },

  // ——— Pashan ———
  { id: "pas-01", title: "Leafy 3BHK off Pashan–Sus Road", area: "pashan", society: "Green Meadows", street: "Pashan–Sus Road",
    rent: 52500, deposit: 150000, bhk: 3, baths: 3, sqft: 1340, floor: 3, floors: 7, lift: true, furnishing: "full",
    am: "TBGUK", life: "gtoq", rooms: "b b -", metro: null, availIn: 18, by: "owner",
    desc: "Looks onto the Pashan hill, fully furnished with balconies off the living room and master bedroom. Sus Road gets you to Hinjewadi without the highway. The owner is vegetarian and doesn't allow pets." },
  { id: "pas-02", title: "Lovely 5th-floor walk-up with lake views", area: "pashan", society: "Sutarwadi Heights", street: "Near Pashan Lake",
    rent: 40000, deposit: 100000, bhk: 3, baths: 3, sqft: 1300, floor: 5, floors: 5, lift: false, furnishing: "full",
    am: "TPBGUWK", life: "gtnofqm", rooms: "ba b a", metro: null, availIn: 7, by: "owner",
    desc: "The prettiest flat on the list: a wraparound balcony over Pashan lake, fully furnished and well under budget. The catch is five floors of stairs and no lift." },
  { id: "pas-03", title: "Renovated 3BHK near NCL", area: "pashan", society: "Panchvati Enclave", street: "NCL Colony Road",
    rent: 55500, deposit: 150000, bhk: 3, baths: 3, sqft: 1360, floor: 2, floors: 8, lift: true, furnishing: "full",
    am: "CTBGUWK", life: "gtoqm", rooms: "ba b a", metro: null, availIn: 22, by: "broker",
    desc: "Freshly renovated with a new modular kitchen and bathrooms, in a green, quiet campus-side lane. A little above what most of the group wants to spend." },

  // ——— Bavdhan ———
  { id: "bav-01", title: "Hill-view 3BHK in Bavdhan", area: "bavdhan", society: "Nisarg Park", street: "Chandni Chowk Road",
    rent: 44000, deposit: 120000, bhk: 3, baths: 3, sqft: 1310, floor: 7, floors: 12, lift: true, furnishing: "semi",
    am: "CTPBGUK", life: "gtnofq", rooms: "b b a", metro: null, availIn: 28, by: "broker",
    desc: "Wide views of the NDA hills and cool evenings. Groceries mean a drive. Aundh is a 25-minute ride through Chandni Chowk traffic." },
  { id: "bav-02", title: "Budget 3BHK in an older Bavdhan society", area: "bavdhan", society: "Ram Nagar CHS", street: "Bavdhan Khurd",
    rent: 36000, deposit: 90000, bhk: 3, baths: 2, sqft: 1080, floor: 3, floors: 4, lift: false, furnishing: "unfurnished",
    am: "TK", life: "nm", rooms: "b - -", metro: null, availIn: 45, by: "owner",
    desc: "Honest, cheap and a bit dated. Third floor, no lift, no backup, and the owner lives two doors down." },

  // ——— Wakad ———
  { id: "wak-01", title: "Corner 3BHK near Wakad Chowk", area: "wakad", society: "Silver Oak Residency", street: "Wakad–Hinjewadi Road",
    rent: 45000, deposit: 135000, bhk: 3, baths: 2, sqft: 1240, floor: 9, floors: 14, lift: true, furnishing: "full",
    am: "CTPBGUW", life: "gtno", rooms: "ba a -", metro: null, availIn: 15, by: "owner",
    desc: "Fully furnished corner flat with cross-ventilation and a balcony off the living room. Fifteen minutes to Hinjewadi Phase 1. Only two bathrooms, and Wakad Chowk is loud at rush hour." },
  { id: "wak-02", title: "Large 3BHK in a gated Wakad township", area: "wakad", society: "Kalpataru Vista", street: "Dange Chowk",
    rent: 50000, deposit: 180000, bhk: 3, baths: 3, sqft: 1420, floor: 10, floors: 20, lift: true, furnishing: "semi",
    am: "CTPBGUWK", life: "gtnofm", rooms: "ba b a", metro: null, availIn: 32, by: "broker",
    desc: "Township with a pool, jogging track and weekend market. Three bathrooms and generous rooms. The owner wants a six-month deposit, which is steep." },
  { id: "wak-03", title: "Well-priced 3BHK behind Phoenix Mall", area: "wakad", society: "Siddhi Enclave", street: "Bhumkar Chowk Lane",
    rent: 38000, deposit: 100000, bhk: 3, baths: 3, sqft: 1180, floor: 5, floors: 7, lift: true, furnishing: "semi",
    am: "CGUK", life: "gnm", rooms: "b b -", metro: null, availIn: 20, by: "broker",
    desc: "Good price, lift, three bathrooms. The society has car slots only, and two-wheelers have to go on the street outside." },
  { id: "wak-04", title: "2BHK + study near Wakad bridge", area: "wakad", society: "Pratik Apartments", street: "Kaspate Vasti",
    rent: 32000, deposit: 80000, bhk: 2, baths: 2, sqft: 980, floor: 3, floors: 4, lift: false, furnishing: "semi",
    am: "TPK", life: "tnm", rooms: "b - -", metro: null, availIn: 10, by: "owner",
    desc: "The cheapest place on the list that would still work for three. The study is snug. Third floor with no lift." },

  // ——— Hinjewadi ———
  { id: "hin-01", title: "Phase 1 3BHK walking distance to offices", area: "hinjewadi", society: "Megapolis Sunway", street: "Hinjewadi Phase 1",
    rent: 36000, deposit: 100000, bhk: 3, baths: 2, sqft: 1100, floor: 12, floors: 22, lift: true, furnishing: "semi",
    am: "CTPGUK", life: "gtnof", rooms: "b a -", metro: 10, availIn: 6, by: "broker",
    desc: "Walk to the Phase 1 offices, with the metro station opening nearby. Huge township, so it can feel anonymous. Everything east of the highway is a long ride." },
  { id: "hin-02", title: "Phase 2 3BHK with clubhouse", area: "hinjewadi", society: "Blue Ridge", street: "Hinjewadi Phase 2",
    rent: 41000, deposit: 120000, bhk: 3, baths: 3, sqft: 1250, floor: 8, floors: 16, lift: true, furnishing: "full",
    am: "CTPBGUWK", life: "gtnofm", rooms: "ba b a", metro: 14, availIn: 25, by: "owner",
    desc: "Fully furnished with a riverside jogging track. Very good value. The trade is distance: Aundh and the city centre are 40+ minutes away." },
  { id: "hin-03", title: "2BHK + study in Maan village", area: "hinjewadi", society: "Om Sai Park", street: "Maan Road",
    rent: 30000, deposit: 75000, bhk: 2, baths: 2, sqft: 950, floor: 4, floors: 4, lift: false, furnishing: "unfurnished",
    am: "TK", life: "nq", rooms: "b - -", metro: null, availIn: 50, by: "owner",
    desc: "Very cheap, with fields out the back. Unfurnished, fourth floor, no lift, and you'd need a vehicle for everything." },

  // ——— Pimple Saudagar ———
  { id: "pim-01", title: "Budget-friendly 3BHK in Pimple Saudagar", area: "pimple_saudagar", society: "Rose Valley", street: "Kunal Icon Road",
    rent: 42000, deposit: 100000, bhk: 3, baths: 3, sqft: 1210, floor: 2, floors: 11, lift: true, furnishing: "semi",
    am: "TBGUWK", life: "nfqm", rooms: "b b a", metro: null, availIn: 12, by: "owner",
    desc: "Quiet inner road with a vegetable market two minutes away, and three proper bathrooms. The owner is particular about late nights and guests. Aundh is 20 minutes across the bridge." },
  { id: "pim-02", title: "Roomy 3BHK near Shivar Chowk", area: "pimple_saudagar", society: "Govind Garden", street: "Shivar Chowk",
    rent: 39000, deposit: 100000, bhk: 3, baths: 2, sqft: 1190, floor: 4, floors: 4, lift: false, furnishing: "semi",
    am: "TPBK", life: "gtnm", rooms: "b - -", metro: null, availIn: 18, by: "broker",
    desc: "Spacious rooms and a lively neighbourhood full of places to eat. Fourth floor of a walk-up." },
  { id: "pim-03", title: "New-build 3BHK in a gated complex", area: "pimple_saudagar", society: "Vision Galaxy", street: "Rahatani Road",
    rent: 49000, deposit: 200000, bhk: 3, baths: 3, sqft: 1330, floor: 6, floors: 14, lift: true, furnishing: "semi",
    am: "CTPBGUK", life: "gtnof", rooms: "ba b a", metro: null, availIn: 38, by: "broker",
    desc: "Brand new, never lived in, with a gym and play area. The broker is asking a ₹2L deposit, well above what the group planned for." },

  // ——— Kothrud ———
  { id: "kot-01", title: "Within-budget 3BHK near Karishma Society", area: "kothrud", society: "Shubham Apartments", street: "Karishma Chowk",
    rent: 46000, deposit: 120000, bhk: 3, baths: 3, sqft: 1260, floor: 3, floors: 7, lift: true, furnishing: "semi",
    am: "CTBGUK", life: "gnfqm", rooms: "b b a", metro: 10, availIn: 16, by: "owner",
    desc: "Sensible, well-kept and a ten-minute walk to the Kothrud metro. Everything a flat should be, but Aundh is a 30-minute cross-city ride and Hinjewadi is further." },
  { id: "kot-02", title: "Old-Kothrud 3BHK walk-up", area: "kothrud", society: "Mayur Colony CHS", street: "Mayur Colony",
    rent: 39000, deposit: 100000, bhk: 3, baths: 2, sqft: 1140, floor: 3, floors: 3, lift: false, furnishing: "unfurnished",
    am: "TBK", life: "qm", rooms: "b - -", metro: 12, availIn: 30, by: "owner",
    desc: "Peaceful colony with big trees and good snacks at the corner shop. Top floor, no lift, and the owner downstairs prefers vegetarian tenants." },
  { id: "kot-03", title: "3BHK by the Vanaz metro station", area: "kothrud", society: "Vanaz Corner", street: "Paud Road",
    rent: 55000, deposit: 165000, bhk: 3, baths: 3, sqft: 1300, floor: 8, floors: 12, lift: true, furnishing: "full",
    am: "CTGUWK", life: "gtnom", rooms: "ba b a", metro: 3, availIn: 9, by: "broker",
    desc: "Three minutes from the Vanaz metro station, fully furnished and bright. Paud Road traffic noise reaches the front rooms." },

  // ——— Karve Nagar ———
  { id: "kar-01", title: "Quiet 3BHK near Karve Nagar lake garden", area: "karve_nagar", society: "Kamala Residency", street: "Hingne Road",
    rent: 37000, deposit: 100000, bhk: 3, baths: 2, sqft: 1120, floor: 2, floors: 5, lift: true, furnishing: "semi",
    am: "TBUK", life: "nfqm", rooms: "b - -", metro: null, availIn: 21, by: "owner",
    desc: "Calm residential pocket near the canal garden, and very affordable. It's far from the west-side IT parks, and the owner locks the gate at 11 pm." },
  { id: "kar-02", title: "2BHK + study in Karve Nagar", area: "karve_nagar", society: "Swapnashilpa", street: "Warje Road",
    rent: 43000, deposit: 120000, bhk: 2, baths: 2, sqft: 1050, floor: 6, floors: 9, lift: true, furnishing: "full",
    am: "CTGUWK", life: "gtnom", rooms: "b a -", metro: null, availIn: 14, by: "broker",
    desc: "Fully furnished with a big study that could be a third bedroom. Only two bathrooms and no balcony." },

  // ——— Deccan ———
  { id: "dec-01", title: "Heritage bungalow-floor 3BHK in Deccan", area: "deccan", society: "Prabhat Villa", street: "Prabhat Road, Lane 12",
    rent: 65000, deposit: 250000, bhk: 3, baths: 3, sqft: 1600, floor: 0, floors: 2, lift: false, furnishing: "semi",
    am: "CTPBUK", life: "gtnoqm", rooms: "ba b -", metro: 10, availIn: 55, by: "owner",
    desc: "Ground floor of a 1960s bungalow with high ceilings and a garden. Charming and central, and priced for it." },
  { id: "dec-02", title: "Central 3BHK near Deccan metro", area: "deccan", society: "Garware Heights", street: "FC Road end",
    rent: 58000, deposit: 175000, bhk: 3, baths: 3, sqft: 1280, floor: 7, floors: 10, lift: true, furnishing: "full",
    am: "CTGUWK", life: "gtnofm", rooms: "ba b a", metro: 5, availIn: 11, by: "broker",
    desc: "Five minutes from the Deccan Gymkhana metro station, with FC Road on the doorstep. Noisy, no balcony, and far from the IT parks." },

  // ——— Shivajinagar ———
  { id: "shi-01", title: "3BHK above Shivajinagar metro", area: "shivajinagar", society: "Model Colony Crest", street: "Model Colony",
    rent: 62000, deposit: 180000, bhk: 3, baths: 3, sqft: 1330, floor: 5, floors: 9, lift: true, furnishing: "full",
    am: "CTBGUWK", life: "gtnofm", rooms: "ba ba a", metro: 4, availIn: 26, by: "broker",
    desc: "Model Colony address with metro, cafés and colleges all within a short walk. Well above budget for most groups." },
  { id: "shi-02", title: "Older 3BHK near Modern College", area: "shivajinagar", society: "Janaki Niwas", street: "Ganeshkhind Road",
    rent: 48000, deposit: 120000, bhk: 3, baths: 2, sqft: 1170, floor: 4, floors: 4, lift: false, furnishing: "semi",
    am: "TK", life: "nm", rooms: "b - -", metro: 8, availIn: 19, by: "owner",
    desc: "Central, cheap for the area and near the metro. It's a tired old building on a busy road, top floor with no lift." },

  // ——— Koregaon Park ———
  { id: "kp-01", title: "Designer 3BHK in Koregaon Park Lane 6", area: "koregaon_park", society: "The Banyan", street: "Lane 6, North Main Road",
    rent: 85000, deposit: 300000, bhk: 3, baths: 3, sqft: 1650, floor: 3, floors: 6, lift: true, furnishing: "full",
    am: "CTPBGUWK", life: "gtnofq", rooms: "ba ba ba", metro: null, availIn: 30, by: "broker",
    desc: "Beautifully done up and shaded by huge rain trees, with every bedroom en-suite and air-conditioned. It costs almost double what the group planned." },
  { id: "kp-02", title: "Garden-facing 3BHK in KP Annexe", area: "koregaon_park", society: "Riverdale", street: "KP Annexe",
    rent: 78000, deposit: 250000, bhk: 3, baths: 3, sqft: 1500, floor: 2, floors: 5, lift: true, furnishing: "semi",
    am: "CTPBGUK", life: "gtnofq", rooms: "ba b a", metro: null, availIn: 42, by: "broker",
    desc: "Overlooks a private garden, with pets welcome. Very expensive, and far from the west-side offices." },
  { id: "kp-03", title: "Ground-floor 3BHK in Lane 7", area: "koregaon_park", society: "Lane 7 Cottage", street: "Lane 7",
    rent: 72000, deposit: 250000, bhk: 3, baths: 2, sqft: 1400, floor: 0, floors: 2, lift: false, furnishing: "semi",
    am: "CTPBUK", life: "gtnoq", rooms: "b a -", metro: null, availIn: 20, by: "owner",
    desc: "Cottage-style ground floor with a veranda. Only two bathrooms, and still very pricey." },

  // ——— Kalyani Nagar ———
  { id: "kal-01", title: "Riverside 3BHK in Kalyani Nagar", area: "kalyani_nagar", society: "Marigold Towers", street: "Riverside Drive",
    rent: 75000, deposit: 225000, bhk: 3, baths: 3, sqft: 1480, floor: 9, floors: 15, lift: true, furnishing: "full",
    am: "CTPBGUWK", life: "gtnofm", rooms: "ba ba a", metro: 12, availIn: 17, by: "broker",
    desc: "River views and a short walk to the metro. Kavita's partner would love it. Everyone else's commute and budget would not." },
  { id: "kal-02", title: "Mid-size 3BHK near Kalyani Nagar metro", area: "kalyani_nagar", society: "Saffron Court", street: "Central Avenue",
    rent: 68000, deposit: 200000, bhk: 3, baths: 3, sqft: 1300, floor: 4, floors: 8, lift: true, furnishing: "semi",
    am: "CTBGUK", life: "gtnofm", rooms: "ba b -", metro: 7, availIn: 29, by: "broker",
    desc: "Well-connected, with good restaurants nearby. Expensive, and a long way from Hinjewadi and Aundh." },

  // ——— Viman Nagar ———
  { id: "vim-01", title: "3BHK near Phoenix Marketcity", area: "viman_nagar", society: "Skyline Oasis", street: "Nagar Road",
    rent: 60000, deposit: 180000, bhk: 3, baths: 3, sqft: 1350, floor: 7, floors: 13, lift: true, furnishing: "full",
    am: "CTPBGUWK", life: "gtnofm", rooms: "ba b a", metro: 16, availIn: 24, by: "broker",
    desc: "Ready to move in, with the mall and airport minutes away. Over budget, and a 75-minute peak-hour drive from Hinjewadi." },
  { id: "vim-02", title: "Walk-up 3BHK in Viman Nagar", area: "viman_nagar", society: "Datta Mandir CHS", street: "Datta Mandir Chowk",
    rent: 52000, deposit: 150000, bhk: 3, baths: 2, sqft: 1200, floor: 4, floors: 4, lift: false, furnishing: "semi",
    am: "TBK", life: "gnm", rooms: "b - -", metro: null, availIn: 13, by: "owner",
    desc: "Reasonable for Viman Nagar and close to Symbiosis. Top floor, no lift, two bathrooms." },
  { id: "vim-03", title: "Bright 3BHK off Airport Road", area: "viman_nagar", society: "Clover Park", street: "Airport Road",
    rent: 56000, deposit: 160000, bhk: 3, baths: 3, sqft: 1290, floor: 5, floors: 10, lift: true, furnishing: "semi",
    am: "CTGUWK", life: "gtnof", rooms: "ba b -", metro: null, availIn: 36, by: "broker",
    desc: "Well-maintained, but there's flight noise in the mornings. Too far east for anyone working in Hinjewadi." },

  // ——— Kharadi ———
  { id: "khr-01", title: "3BHK next to EON IT Park", area: "kharadi", society: "Gera Greens", street: "EON Free Zone Road",
    rent: 50000, deposit: 150000, bhk: 3, baths: 3, sqft: 1320, floor: 11, floors: 20, lift: true, furnishing: "semi",
    am: "CTPBGUWK", life: "gtnofm", rooms: "ba b a", metro: null, availIn: 16, by: "broker",
    desc: "Township living next to EON, with plenty of food options. Great for East-Pune offices and awkward for everyone else." },
  { id: "khr-02", title: "Value 3BHK in Kharadi Bypass", area: "kharadi", society: "Mangal Bhairav", street: "Kharadi Bypass",
    rent: 47000, deposit: 140000, bhk: 3, baths: 2, sqft: 1180, floor: 3, floors: 7, lift: true, furnishing: "unfurnished",
    am: "TGUK", life: "gnm", rooms: "b - -", metro: null, availIn: 44, by: "owner",
    desc: "A decent price for a lift building, but unfurnished, on the bypass, and only two bathrooms." },

  // ——— Hadapsar/Magarpatta ———
  { id: "had-01", title: "Magarpatta City 3BHK", area: "hadapsar", society: "Magarpatta Cosmos", street: "Magarpatta City",
    rent: 45000, deposit: 135000, bhk: 3, baths: 3, sqft: 1290, floor: 6, floors: 11, lift: true, furnishing: "semi",
    am: "CTPBGUWK", life: "gtnofqm", rooms: "ba b a", metro: null, availIn: 21, by: "broker",
    desc: "Car-free internal roads, a big park and very safe. A long way from the west-side offices, gyms and family." },
  { id: "had-02", title: "Budget 3BHK in Hadapsar", area: "hadapsar", society: "Sai Siddhi", street: "Solapur Road",
    rent: 34000, deposit: 90000, bhk: 3, baths: 2, sqft: 1100, floor: 4, floors: 4, lift: false, furnishing: "unfurnished",
    am: "TK", life: "nm", rooms: "b - -", metro: null, availIn: 33, by: "owner",
    desc: "Very cheap, on the noisy Solapur Road. Fourth floor with no lift and no backup." },

  // ——— Wanowrie ———
  { id: "wan-01", title: "Green 3BHK near Wanowrie Bazaar", area: "wanowrie", society: "Clover Hills", street: "Jagtap Chowk",
    rent: 38000, deposit: 100000, bhk: 3, baths: 3, sqft: 1250, floor: 5, floors: 9, lift: true, furnishing: "semi",
    am: "CTPBGUK", life: "gtnfqm", rooms: "b b a", metro: null, availIn: 27, by: "owner",
    desc: "Leafy cantonment-side neighbourhood with a lovely weekly bazaar, and good value. Far from Aundh and Hinjewadi." },
  { id: "wan-02", title: "Furnished 3BHK near Salunke Vihar", area: "wanowrie", society: "Salunke Vihar Towers", street: "Salunke Vihar Road",
    rent: 42000, deposit: 120000, bhk: 3, baths: 3, sqft: 1270, floor: 8, floors: 12, lift: true, furnishing: "full",
    am: "CTBGUWK", life: "gtnofq", rooms: "ba b a", metro: null, availIn: 39, by: "broker",
    desc: "Fully furnished in a calm army-adjacent area. No pets, and it's the far side of the city from the west-side offices." },
];
