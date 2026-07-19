// lib/types.ts — shared types for Customer Portal

export interface Supplier {
  id: number;
  name: string;
  description: string;
  logoUrl: string;
  categories: string[];
  rating: number;
  deliveryTime: string;
  location: string;
  productsCount?: number;
}

export interface Product {
  id: number;
  supplierId: number;
  supplierName?: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  imageUrl: string;
  category: string;
  inStock: boolean;
  minOrderQty: number;
  sku?: string;
  weightKg?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  poCode: string;
  supplierId: number;
  supplierName: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Allocated" | "Picking" | "Packing" | "ReturnRequest" | "Returned";
  items: OrderItem[];
  totalCost: number;
  createdAt: string;
  expectedDelivery: string;
  trackingNumber?: string;
  shippingAddress?: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CustomerProfile {
  id: number;
  portal_user_id: string;
  company_name: string;
  tax_number?: string;
  commercial_register?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  logo_url?: string;
  is_verified: boolean;
  created_at?: string;
}

export interface CustomerBranch {
  id: number;
  customer_id: number;
  branch_name: string;
  address: string;
  city: string;
  country: string;
  is_primary: boolean;
  contact_phone?: string;
}

export interface CustomerDocument {
  id: number;
  customer_id: number;
  document_type: 'CommercialRegistration' | 'TaxCertificate' | 'License' | 'Other';
  document_name: string;
  file_url: string;
  expiry_date?: string;
  is_verified: boolean;
}

export interface MembershipLevel {
  id: number;
  level_name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  min_spent_sar: number;
  discount_percentage: number;
  benefits: string[];
}

export interface CustomerMembership {
  id: number;
  customer_id: number;
  level_id: number;
  total_spent_sar: number;
  joined_at: string;
  expires_at?: string;
  level?: MembershipLevel;
}

export interface CustomerWallet {
  id: number;
  customer_id: number;
  balance: number;
  currency: string;
}

export interface CustomerWalletTransaction {
  id: number;
  wallet_id: number;
  amount: number;
  transaction_type: 'Deposit' | 'Payment' | 'Refund' | 'Bonus' | 'StorageCharge' | 'CREDIT' | 'CHARGE';
  reference_id?: string;
  description?: string;
  created_at: string;
}

export interface BankAccount {
  id: number;
  customer_id: number;
  bank_name: string;
  account_holder: string;
  account_number: string;
  iban?: string;
  swift_code?: string;
  currency: string;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface WalletWithdrawal {
  id: number;
  customer_id: number;
  bank_account_id?: number | null;
  amount: number;
  currency: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Rejected';
  notes?: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  requested_at: string;
}

export interface WarehouseStorage {
  id: number;
  customer_id: number;
  space_m3: number;
  start_date: string;
  end_date?: string;
  status: 'Pending' | 'Approved' | 'Expired' | 'Cancelled';
  cost_per_period: number;
  period: string;
  notes?: string;
}

export interface SearchHistory {
  id: number;
  portal_user_id: string;
  query_text: string;
  filters_applied: Record<string, any>;
  created_at: string;
}

export interface FormState {
  success: boolean;
  message: string;
}
