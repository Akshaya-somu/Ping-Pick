// Shared mock data for the application

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  pharmacyId: string;
}

export interface PharmacyInfo {
  id: string;
  name: string;
  distance: string;
  address: string;
  phone: string;
}

// Mock pharmacy inventory database
export const mockPharmacyInventory: InventoryItem[] = [
  // HealthFirst Pharmacy (p1)
  { id: "inv1", name: "Paracetamol 500mg", quantity: 50, price: 45, pharmacyId: "p1" },
  { id: "inv2", name: "Cetrizine 10mg", quantity: 30, price: 25, pharmacyId: "p1" },
  { id: "inv3", name: "Omeprazole 20mg", quantity: 40, price: 65, pharmacyId: "p1" },
  { id: "inv4", name: "Vitamin C 500mg", quantity: 100, price: 35, pharmacyId: "p1" },
  
  // MedCare Plus (p2)
  { id: "inv5", name: "Paracetamol 500mg", quantity: 25, price: 52, pharmacyId: "p2" },
  { id: "inv6", name: "Ibuprofen 400mg", quantity: 45, price: 40, pharmacyId: "p2" },
  { id: "inv7", name: "Vitamin D3", quantity: 60, price: 120, pharmacyId: "p2" },
  
  // Community Drugs (p3)
  { id: "inv8", name: "Cetrizine 10mg", quantity: 20, price: 22, pharmacyId: "p3" },
  { id: "inv9", name: "Paracetamol 500mg", quantity: 35, price: 48, pharmacyId: "p3" },
  { id: "inv10", name: "Cough Syrup", quantity: 15, price: 85, pharmacyId: "p3" },
];

// Mock pharmacy database
export const mockPharmacies: PharmacyInfo[] = [
  {
    id: "p1",
    name: "HealthFirst Pharmacy",
    distance: "0.8 km",
    address: "123 Main Street, Downtown",
    phone: "+91 98765 43210",
  },
  {
    id: "p2",
    name: "MedCare Plus",
    distance: "1.2 km",
    address: "456 Park Avenue, Central",
    phone: "+91 98765 43211",
  },
  {
    id: "p3",
    name: "Community Drugs",
    distance: "2.1 km",
    address: "789 Oak Road, Westside",
    phone: "+91 98765 43212",
  },
];

// Search function to find medicines in inventory
export function searchMedicineInInventory(query: string): {
  pharmacyId: string;
  pharmacyName: string;
  distance: string;
  address: string;
  phone: string;
  medicine: string;
  price: number;
  quantity: number;
}[] {
  const queryLower = query.toLowerCase().trim();
  
  const results = mockPharmacyInventory
    .filter(item => item.name.toLowerCase().includes(queryLower))
    .map(item => {
      const pharmacy = mockPharmacies.find(p => p.id === item.pharmacyId);
      return {
        pharmacyId: item.pharmacyId,
        pharmacyName: pharmacy?.name || "Unknown Pharmacy",
        distance: pharmacy?.distance || "N/A",
        address: pharmacy?.address || "",
        phone: pharmacy?.phone || "",
        medicine: item.name,
        price: item.price,
        quantity: item.quantity,
      };
    });
  
  return results;
}
