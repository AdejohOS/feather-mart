import { Database } from "../../types_db";

export type FarmTypes = Database["public"]["Tables"]["farms"]["Row"]

export type Product = Database["public"]["Tables"]["products"]["Row"];

export interface UserType {
    email: string;
    role: Role
    
  }

  export enum Role {
    buyer= "buyer",
    seller = "seller",
    admin= "admin"
  }

  export enum PoultryType{
    Layers= 'layers', 
    Broilers='broilers', 
    Breeders='breeders',
    DualPurpose='dual-purpose'
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
    errors?: {
      [K in keyof UserType]?: string[];
    };
  }

  export interface LoggedInUser {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string | null
    username: string | null
    phone_number: string | null
    
   
  }

  export interface ProfileResponse {
    success: boolean;
    message: string;
    errors?: {
      [K in keyof Profile]?: string[];
    };
  }

  export interface Profile {
    id: string
    username: string
    email: string
    full_name: string
    avatar_url: string
    phone_number: string
    updated_at: string
  }

  export interface Farm {
    name: string,
    address: string,
    state: string | null,
    country: string,
    phone_number: string | null,
    farm_email: string | null,
    description: string | null,
    poultry_type: string,
    housing_system: string,
    capacity: number,
   certifications: string[] | null,
    media: Array<{
      url: string
      type?: 'image' | 'video'
      description?: string
    }> | null,
   website: string | null,
   is_approved: boolean | null

  }

  export interface FileInfo {
    url: string
    name: string
    size: number
    type: string
    path: string
  }

  export type UploadedMedia = {
    url: string
    type: "image" | "video"
    name: string
    size: number
  }

 

