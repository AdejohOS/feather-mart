import { Database } from "../../types_db";

export type FarmTypes = Database["public"]["Tables"]["farms"]["Row"];

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Farm = Database["public"]["Tables"]["farms"]["Row"];

export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItems = Database["public"]["Tables"]["orders"]["Row"];

export interface SignUpType {
  name?: string;
  email: string;
  password: string;
  role: "buyer" | "seller";
}

export enum Role {
  buyer = "buyer",
  seller = "seller",
}

export enum PoultryType {
  Layers = "layers",
  Broilers = "broilers",
  Breeders = "breeders",
  DualPurpose = "dual-purpose",
}

export enum HousingSystem {
  BatteryCages = "battery cages",
  DeepLitter = "deep litter",
  FreeRange = "free-range",
  BarnSystem = "barn system",
}

export interface ActionResponse {
  success: boolean;
  message: string;
  inputs?: SignUpType;
  errors?: {
    [K in keyof SignUpType]?: string[];
  };
}

export interface LoggedInUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  username: string | null;
  phone_number: string | null;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof ProfileType]?: string[];
  };
}

export interface ProfileType {
  id: string;
  username: string;
  email: string;
  full_name: string;
  avatar_url: string;
  phone_number: string;
  updated_at: string;
}

export interface FarmType {
  name: string;
  address: string;
  state: string | null;
  country: string;
  phone_number: string | null;
  farm_email: string | null;
  description: string | null;
  poultry_type: string;
  housing_system: string;
  capacity: number;
  certifications: string[] | null;
  media: Array<{
    url: string;
    type?: "image" | "video";
    description?: string;
  }> | null;
  website: string | null;
  is_approved: boolean | null;
}

export interface FileInfo {
  url: string;
  name: string;
  size: number;
  type: string;
  path: string;
}

type FarmMedia = {
  id: string;
  farm_id: string;
  url: string;
  type: "image" | "video";
  created_at: string;
  updated_at: string;
};

export type FarmMediaType = {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  // Add other farm fields here...
  media: FarmMedia[]; // Include media property
};

export interface CartItemType {
  id: number;
  productId: string;
  name: string;
  price: number;
  media?: { url: string }[];
  quantity: number;
  stock?: number;
  seller: string;
}
// currently using
export interface CartItem {
  id?: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  stock?: number;
  media?: Array<{ url: string }>;
  seller?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  email: string;
  phone: string;
}
export interface OrderType {
  id: number;
  user_id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string | null;
  updated_at: string | null;
  total_amount: number;
  shipping_address: ShippingAddress | null;
  order_items: OrderItem[];
}

export interface WishlistItem {
  id?: number;
  productId: string;
  name: string;
  category: string;
  price: number;
  stock?: number;
  description?: string;
  media?: Array<{ url: string }>;
  farm?: { name: string };
}

export interface Wishlist {
  items: WishlistItem[];
}
