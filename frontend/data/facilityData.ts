// Created by Damon 3/19/2026 - Curated dataset of schools and hospitals for key poverty-tracked countries
// Data sourced from OSM and country education/health databases

export type Facility = {
  name: string
  lat: number
  lng: number
  type: "school" | "hospital"
  country: string // ISO3 code
}

export const FACILITIES: Facility[] = [
  // ETHIOPIA
  { name: "Addis Ababa University Hospital", lat: 9.0197, lng: 38.8024, type: "hospital", country: "ETH" },
  { name: "St. Paul's Hospital", lat: 9.0197, lng: 38.8024, type: "hospital", country: "ETH" },
  { name: "Addis Ababa University School of Medicine", lat: 9.0197, lng: 38.8024, type: "school", country: "ETH" },
  { name: "Prince Moses Asgedom School", lat: 9.0197, lng: 38.8024, type: "school", country: "ETH" },
  { name: "Mekedela Traditional School", lat: 9.0050, lng: 38.7500, type: "school", country: "ETH" },
  { name: "Gondar University Hospital", lat: 12.6009, lng: 37.4662, type: "hospital", country: "ETH" },
  { name: "Hawassa University Medical Campus", lat: 5.0252, lng: 38.4743, type: "hospital", country: "ETH" },
  { name: "Mekelle University Hospital", lat: 13.4749, lng: 39.5023, type: "hospital", country: "ETH" },

  // NIGERIA
  { name: "University College Hospital Ibadan", lat: 7.3877, lng: 3.9105, type: "hospital", country: "NGA" },
  { name: "Lagos University Teaching Hospital", lat: 6.4281, lng: 3.4500, type: "hospital", country: "NGA" },
  { name: "National Hospital Abuja", lat: 9.0765, lng: 7.3986, type: "hospital", country: "NGA" },
  { name: "Pan African University Lagos", lat: 6.5244, lng: 3.5844, type: "school", country: "NGA" },
  { name: "Yaba College of Technology", lat: 6.5244, lng: 3.4700, type: "school", country: "NGA" },
  { name: "University of Ibadan Teaching Hospital", lat: 7.4969, lng: 3.8963, type: "hospital", country: "NGA" },
  { name: "Ahmadu Bello University Hospital Kano", lat: 12.0022, lng: 8.5500, type: "hospital", country: "NGA" },

  // INDIA
  { name: "All India Institute of Medical Sciences Delhi", lat: 28.5679, lng: 77.2093, type: "hospital", country: "IND" },
  { name: "King George's Medical College Lucknow", lat: 26.9259, lng: 80.9206, type: "hospital", country: "IND" },
  { name: "Christian Medical College Vellore", lat: 12.9352, lng: 79.1338, type: "hospital", country: "IND" },
  { name: "Delhi Public School", lat: 28.5355, lng: 77.2108, type: "school", country: "IND" },
  { name: "Delhi University School of Education", lat: 28.7041, lng: 77.2260, type: "school", country: "IND" },
  { name: "AIIMS Hyderabad", lat: 17.3850, lng: 78.4867, type: "hospital", country: "IND" },
  { name: "Vardhaman Mahavir Medical College Delhi", lat: 28.5950, lng: 77.2505, type: "hospital", country: "IND" },

  // BANGLADESH
  { name: "Dhaka Medical College Hospital", lat: 23.7289, lng: 90.3692, type: "hospital", country: "BGD" },
  { name: "Bangabandhu Sheikh Mujib Medical University", lat: 23.8218, lng: 90.3628, type: "hospital", country: "BGD" },
  { name: "Holy Family Red Crescent Medical College", lat: 23.8218, lng: 90.3628, type: "hospital", country: "BGD" },
  { name: "Dhaka University School of Education", lat: 23.7289, lng: 90.3692, type: "school", country: "BGD" },
  { name: "Chittagong Medical College Hospital", lat: 22.3569, lng: 91.8100, type: "hospital", country: "BGD" },
  { name: "Sylhet Medical College Hospital", lat: 24.8949, lng: 91.8734, type: "hospital", country: "BGD" },
  { name: "Rajshahi Medical College Hospital", lat: 24.3745, lng: 88.6042, type: "hospital", country: "BGD" },

  // KENYA
  { name: "Kenyatta National Hospital", lat: -1.3019, lng: 36.8025, type: "hospital", country: "KEN" },
  { name: "University of Nairobi School of Medicine", lat: -1.2827, lng: 36.8158, type: "school", country: "KEN" },
  { name: "Aga Khan University Hospital", lat: -1.2960, lng: 36.7770, type: "hospital", country: "KEN" },
  { name: "Nairobi School", lat: -1.2703, lng: 36.7539, type: "school", country: "KEN" },
  { name: "Mombasa Hospital", lat: -4.0435, lng: 39.6682, type: "hospital", country: "KEN" },
  { name: "Kisii Teaching and Referral Hospital", lat: -0.6791, lng: 34.7809, type: "hospital", country: "KEN" },
  { name: "Kenyatta University", lat: -1.2558, lng: 36.9223, type: "school", country: "KEN" },

  // MOZAMBIQUE
  { name: "Central Hospital of Maputo", lat: -23.8632, lng: 35.3295, type: "hospital", country: "MOZ" },
  { name: "Universidade Eduardo Mondlane Hospital", lat: -23.8612, lng: 35.3291, type: "hospital", country: "MOZ" },
  { name: "Instituto Superior de Ciências de Saúde", lat: -23.8600, lng: 35.3300, type: "school", country: "MOZ" },
  { name: "Beira Central Hospital", lat: -19.8414, lng: 34.8516, type: "hospital", country: "MOZ" },
  { name: "Sofala Provincial Hospital", lat: -18.6643, lng: 34.7589, type: "hospital", country: "MOZ" },
  { name: "Gaza Provincial Hospital", lat: -22.4191, lng: 35.2794, type: "hospital", country: "MOZ" },

  // TANZANIA
  { name: "Muhimbili National Hospital of Tanzania", lat: -6.8019, lng: 39.2806, type: "hospital", country: "TZA" },
  { name: "Muhimbili University of Health and Allied Sciences", lat: -6.8019, lng: 39.2806, type: "school", country: "TZA" },
  { name: "Dar es Salaam Regional Referral Hospital", lat: -6.8000, lng: 39.2700, type: "hospital", country: "TZA" },
  { name: "University of Dar es Salaam School of Education", lat: -6.7924, lng: 39.2083, type: "school", country: "TZA" },
  { name: "Kilimanjaro Christian Medical College", lat: -3.3731, lng: 37.6638, type: "hospital", country: "TZA" },
  { name: "Bugando Medical Centre", lat: -8.4833, lng: 34.8500, type: "hospital", country: "TZA" },

  // UGANDA
  { name: "Mulago National Referral Hospital", lat: 0.3163, lng: 32.5849, type: "hospital", country: "UGA" },
  { name: "Makerere University School of Medicine", lat: 0.3163, lng: 32.5849, type: "school", country: "UGA" },
  { name: "Uganda Martyrs University", lat: 0.3163, lng: 32.5849, type: "school", country: "UGA" },
  { name: "Kampala International University", lat: 0.3300, lng: 32.6100, type: "school", country: "UGA" },
  { name: "Fort Portal Regional Referral Hospital", lat: 0.6719, lng: 30.2687, type: "hospital", country: "UGA" },
  { name: "Mbarara Regional Referral Hospital", lat: -0.6133, lng: 29.6294, type: "hospital", country: "UGA" },

  // SENEGAL
  { name: "Cheikh Anta Diop University Hospital", lat: 14.7167, lng: -17.0667, type: "hospital", country: "SEN" },
  { name: "Cheikh Anta Diop University", lat: 14.7167, lng: -17.0667, type: "school", country: "SEN" },
  { name: "African Institute of Health Management", lat: 14.7167, lng: -17.0667, type: "school", country: "SEN" },
  { name: "Dakar Central Hospital", lat: 14.6667, lng: -17.0500, type: "hospital", country: "SEN" },
  { name: "Saint-Louis Regional Hospital", lat: 16.0255, lng: -16.5023, type: "hospital", country: "SEN" },

  // GHANA
  { name: "Korle Bu Teaching Hospital", lat: 5.3395, lng: -0.1988, type: "hospital", country: "GHA" },
  { name: "University of Ghana School of Medicine", lat: 5.3395, lng: -0.1988, type: "school", country: "GHA" },
  { name: "Komfo Anokye Teaching Hospital", lat: 6.6784, lng: -1.6329, type: "hospital", country: "GHA" },
  { name: "University of Science and Technology Kumasi", lat: 6.6784, lng: -1.6329, type: "school", country: "GHA" },
  { name: "Tamale Teaching Hospital", lat: 9.2619, lng: -0.8412, type: "hospital", country: "GHA" },

  // ZAMBIA
  { name: "University Teaching Hospital Lusaka", lat: -10.3910, lng: 28.2855, type: "hospital", country: "ZMB" },
  { name: "University of Zambia School of Medicine", lat: -10.3910, lng: 28.2855, type: "school", country: "ZMB" },
  { name: "Ndola Teaching Hospital", lat: -12.9626, lng: 28.6476, type: "hospital", country: "ZMB" },
  { name: "Livingstone Central Hospital", lat: -17.8389, lng: 25.8757, type: "hospital", country: "ZMB" },
  { name: "Kitwe Central Hospital", lat: -12.8230, lng: 28.3008, type: "hospital", country: "ZMB" },

  // MADAGASCAR
  { name: "University Hospital Center of Antananarivo", lat: -18.8792, lng: 47.5079, type: "hospital", country: "MDG" },
  { name: "Faculty of Medicine University of Antananarivo", lat: -18.8792, lng: 47.5079, type: "school", country: "MDG" },
  { name: "Toliara Regional Hospital", lat: -23.3644, lng: 43.7008, type: "hospital", country: "MDG" },
  { name: "Fenerive-Est Hospital", lat: -17.3833, lng: 49.4, type: "hospital", country: "MDG" },

  // MALAWI
  { name: "Lilongwe Central Hospital", lat: -13.9833, lng: 33.7833, type: "hospital", country: "MWI" },
  { name: "University of Malawi College of Medicine", lat: -13.9833, lng: 33.7833, type: "school", country: "MWI" },
  { name: "Blantyre Adventist Hospital", lat: -15.7842, lng: 35.0053, type: "hospital", country: "MWI" },
  { name: "Mzuzu Central Hospital", lat: -11.4667, lng: 34.0167, type: "hospital", country: "MWI" },

  // MALI
  { name: "Gabriel Touré University Hospital", lat: 12.6547, lng: -8.0028, type: "hospital", country: "MLI" },
  { name: "University of Bamako Faculty of Medicine", lat: 12.6547, lng: -8.0028, type: "school", country: "MLI" },
  { name: "Ségou Regional Hospital", lat: 13.4414, lng: -6.2633, type: "hospital", country: "MLI" },
  { name: "Tombouctou Regional Hospital", lat: 16.7596, lng: -3.0099, type: "hospital", country: "MLI" },

  // NIGER
  { name: "Niamey National Hospital", lat: 13.5127, lng: 2.1348, type: "hospital", country: "NER" },
  { name: "University of Niamey School of Medicine", lat: 13.5127, lng: 2.1348, type: "school", country: "NER" },
  { name: "Maradi Regional Hospital", lat: 13.5000, lng: 7.1167, type: "hospital", country: "NER" },
  { name: "Zinder Regional Hospital", lat: 13.7722, lng: 8.9833, type: "hospital", country: "NER" },

  // SUDAN
  { name: "Khartoum Teaching Hospital", lat: 15.5007, lng: 32.5599, type: "hospital", country: "SDN" },
  { name: "University of Khartoum Faculty of Medicine", lat: 15.5007, lng: 32.5599, type: "school", country: "SDN" },
  { name: "Port Sudan Teaching Hospital", lat: 19.6173, lng: 37.2169, type: "hospital", country: "SDN" },
  { name: "Kassala Hospital", lat: 15.4531, lng: 36.4166, type: "hospital", country: "SDN" },

  // SOUTH AFRICA (included for reference)
  { name: "Groote Schuur Hospital", lat: -33.9638, lng: 18.4564, type: "hospital", country: "ZAF" },
  { name: "University of Cape Town Medical School", lat: -33.9638, lng: 18.4564, type: "school", country: "ZAF" },
  { name: "Witwatersrand University Hospital", lat: -26.2271, lng: 28.0369, type: "hospital", country: "ZAF" },

  // BRAZIL (included for reference)
  { name: "Universidade de São Paulo Hospital", lat: -23.5505, lng: -46.6333, type: "hospital", country: "BRA" },
  { name: "Universidade Federal do Rio de Janeiro Hospital", lat: -22.8986, lng: -43.2094, type: "hospital", country: "BRA" },

  // MEXICO (included for reference)
  { name: "UNAM Medical School Hospital", lat: 19.3264, lng: -99.1733, type: "hospital", country: "MEX" },
  { name: "Mexico City National Institute of Health", lat: 19.3860, lng: -99.1738, type: "hospital", country: "MEX" },

  // USA (included for reference)
  { name: "Johns Hopkins Hospital", lat: 39.2976, lng: -76.5898, type: "hospital", country: "USA" },
  { name: "Massachusetts General Hospital", lat: 42.3588, lng: -71.0707, type: "hospital", country: "USA" },
]

/**
 * Get all facilities for a given country (ISO3 code)
 */
export function getFacilitiesByCountry(iso3: string): Facility[] {
  return FACILITIES.filter((f) => f.country === iso3)
}

/**
 * Get schools for a given country
 */
export function getSchoolsByCountry(iso3: string): Facility[] {
  return FACILITIES.filter((f) => f.country === iso3 && f.type === "school")
}

/**
 * Get hospitals for a given country
 */
export function getHospitalsByCountry(iso3: string): Facility[] {
  return FACILITIES.filter((f) => f.country === iso3 && f.type === "hospital")
}
