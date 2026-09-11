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
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Allocated" | "Picking" | "Packing" | "ReturnRequest" | "Returned" | "disputed" | "Completed";
  items: OrderItem[];
  totalCost: number;
  createdAt: string;
  expectedDelivery: string;
  deliveredAt?: string | null;
  disputeDeadlineAt?: string | null;
  deliveryAccepted?: boolean;
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

export interface Notification {
  id: number;
  user_id: string | null;
  is_admin: boolean;
  title: string;
  message: string;
  type: string;
  link: string | null;
  read: boolean;
  created_at: string;
}
