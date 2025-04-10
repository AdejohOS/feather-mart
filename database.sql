
-- Create the products table for the poultry marketplace
CREATE TABLE products (
  -- System fields
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Relationship fields
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
  
  -- Basic Information
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  breed VARCHAR(50),
  age VARCHAR(50),
  weight VARCHAR(50),
  
  -- Pricing & Inventory
  price DECIMAL(10, 2) NOT NULL,
  discount_price DECIMAL(10, 2),
  stock INTEGER NOT NULL,
  unit VARCHAR(20) NOT NULL,
  minimum_order INTEGER,
  available_date DATE,
  sku VARCHAR(50),
  
  -- Product Attributes
  is_organic BOOLEAN NOT NULL DEFAULT FALSE,
  is_free_range BOOLEAN NOT NULL DEFAULT FALSE,
  is_antibiotic BOOLEAN NOT NULL DEFAULT FALSE,
  is_hormone BOOLEAN NOT NULL DEFAULT FALSE,
  is_vaccinated BOOLEAN NOT NULL DEFAULT FALSE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Tags (stored as an array)
  tags TEXT[],
  
  -- Additional Information
  nutritional_info TEXT,
  storage_instructions TEXT,
  origin VARCHAR(100),
  
  -- Constraints
  CONSTRAINT price_positive CHECK (price > 0),
  CONSTRAINT discount_price_nonnegative CHECK (discount_price IS NULL OR discount_price >= 0),
  CONSTRAINT stock_nonnegative CHECK (stock >= 0),
  CONSTRAINT minimum_order_nonnegative CHECK (minimum_order IS NULL OR minimum_order >= 0),
  CONSTRAINT minimum_order_less_than_stock CHECK (minimum_order IS NULL OR minimum_order <= stock)
);

-- Create indexes for faster queries
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_farm_id ON products(farm_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_tags ON products USING GIN (tags);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enforce discount_price < price dynamically
CREATE OR REPLACE FUNCTION validate_discount_price()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.discount_price IS NOT NULL AND NEW.discount_price >= NEW.price THEN
    RAISE EXCEPTION 'Discount price must be less than the original price';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_discount_price
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION validate_discount_price();

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies for access control
-- Allow buyers to view only available products
CREATE POLICY "Anyone can view available products" 
ON products FOR SELECT 
USING (is_available = TRUE);

-- Allow sellers to insert their own products
CREATE POLICY "Sellers can insert their own products" 
ON products FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = seller_id);

-- Allow sellers to update their own products
CREATE POLICY "Sellers can update their own products" 
ON products FOR UPDATE 
TO authenticated 
USING (auth.uid() = seller_id);

-- Allow sellers to delete their own products
CREATE POLICY "Sellers can delete their own products" 
ON products FOR DELETE 
TO authenticated 
USING (auth.uid() = seller_id);

-- Admin role can manage all products
CREATE POLICY "Admins can manage all products" 
ON products FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create the product_media table
-- Create the product_media table
CREATE TABLE product_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Ensure the URL is valid and points to an allowed file type
  url TEXT NOT NULL CHECK (
    url ~* '^https?://[^/]+/\S+\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|mkv|webm)$'
  ),

  -- Restrict type to either 'image' or 'video'
  type VARCHAR(10) NOT NULL CHECK (type IN ('image', 'video')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for optimized queries
CREATE INDEX idx_product_media_product_id ON product_media(product_id);
CREATE INDEX idx_product_media_type ON product_media(type);

-- Auto-update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_media_timestamp
BEFORE UPDATE ON product_media
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;

-- Policies for access control

-- Allow anyone to view media of available products
CREATE POLICY "Anyone can view media of available products" 
ON product_media FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM products WHERE products.id = product_media.product_id AND products.is_available = TRUE
  )
);

-- Allow sellers to insert media only for their own products
CREATE POLICY "Sellers can insert media for their own products" 
ON product_media FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products WHERE products.id = product_media.product_id AND products.seller_id = auth.uid()
  )
);

-- Allow sellers to update their own media
CREATE POLICY "Sellers can update their own media" 
ON product_media FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM products WHERE products.id = product_media.product_id AND products.seller_id = auth.uid()
  )
);

-- Allow sellers to delete their own media
CREATE POLICY "Sellers can delete their own media" 
ON product_media FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM products WHERE products.id = product_media.product_id AND products.seller_id = auth.uid()
  )
);

-- Allow admins to manage all product media
CREATE POLICY "Admins can manage all media" 
ON product_media FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);


pnpx supabase gen types typescript --project-id gvbpmhxsnejrbraprbys --schema public > types_db.ts


--updates

--Profile

-- Create ENUM type for user roles
CREATE TYPE user_role AS ENUM ('admin', 'buyer', 'seller');

-- Create profiles table with security constraints
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT NULL,
  phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Security constraints
  CONSTRAINT username_length CHECK (char_length(username) BETWEEN 3 AND 50),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'),
  CONSTRAINT valid_phone CHECK (phone_number ~ '^\+?[1-9]\d{1,14}$')
);

-- Enable Row-Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Security definer function for admin checks
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- RLS Policies
CREATE POLICY "Public profile view" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Self-profile creation" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Role update via path" ON profiles
FOR UPDATE USING (
  auth.uid() = id AND role IS NULL
) WITH CHECK (
  role IN ('buyer', 'seller')
);

CREATE POLICY "Admin management" ON profiles
FOR ALL USING (is_admin());

-- Automatically create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (
    id, email, username, full_name, avatar_url, phone_number
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'username', ''), split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone_number', ''), NEW.phone)
  ) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- Attach the trigger to auth.users table
CREATE TRIGGER create_profile_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF row(NEW.*) IS DISTINCT FROM row(OLD.*) THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_timestamps
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_timestamps();

-- Indexes for performance
CREATE INDEX profiles_role_idx ON profiles(role);
CREATE INDEX profiles_email_idx ON profiles(email);


--farm media

-- Create the farm_media table linked to farms
CREATE TABLE farm_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  url TEXT NOT NULL CHECK (url ~* '^https?://[^/]+/\S+\.(jpg|jpeg|png|gif|webp|mp4)$'),
  type VARCHAR(5) NOT NULL CHECK (type IN ('image', 'video')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_farm_media_farm ON farm_media(farm_id);
CREATE INDEX idx_farm_media_type ON farm_media(type);
CREATE INDEX idx_farm_media_url ON farm_media(url);

-- Auto-update 'updated_at' on row updates
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_timestamp
BEFORE UPDATE ON farm_media
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Comments for documentation
COMMENT ON TABLE farm_media IS 'Stores media assets (images/videos) for farms';
COMMENT ON COLUMN farm_media.url IS 'Full URL to the media file in storage';
COMMENT ON COLUMN farm_media.type IS 'Media type: image or video';
COMMENT ON COLUMN farm_media.created_at IS 'Timestamp when media was added';
COMMENT ON COLUMN farm_media.updated_at IS 'Timestamp when media was last updated';




-- Create profiles table with role field

-- Create ENUM type for roles
CREATE TYPE user_role AS ENUM ('admin', 'buyer', 'seller');

-- Create the profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT NULL, -- Role starts as NULL, updated later
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure username length
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Enable Row-Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ✅ Policy: Allow authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles"
ON profiles
FOR SELECT USING (auth.uid() IS NOT NULL);

-- ✅ Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- ✅ Policy: Users can update their profile only if role is NULL
CREATE POLICY "Users can update their role once"
ON profiles
FOR UPDATE
USING (auth.uid() = id AND role IS NULL)
WITH CHECK (auth.uid() = id);

-- ✅ Policy: Admins can manage all profiles
CREATE POLICY "Admins can manage all profiles"
ON profiles
FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ✅ Policy: Users can delete their own profile
CREATE POLICY "Users can delete their own profile"
ON profiles
FOR DELETE USING (auth.uid() = id);

-- ✅ Automatically create a profile when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY INVOKER -- Prevents infinite recursion
AS $$ 
BEGIN 
  INSERT INTO public.profiles (
    id, 
    username, 
    full_name, 
    email, 
    avatar_url, 
    phone_number
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)), -- Default username
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'phone_number', NEW.phone)
  ) ON CONFLICT (id) DO NOTHING; -- Prevent duplicate insert

  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- ✅ Trigger: Insert new profile entry when a user is created
CREATE TRIGGER on_auth_user_created 
  AFTER INSERT ON auth.users 
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ✅ Automatically update `updated_at` on any profile update
CREATE OR REPLACE FUNCTION update_timestamp() 
RETURNS TRIGGER AS $$ 
BEGIN 
  NEW.updated_at = NOW(); 
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_update_timestamp 
BEFORE UPDATE ON profiles 
FOR EACH ROW EXECUTE FUNCTION update_timestamp();



-- Create the farms table
CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    established_date DATE,
    size VARCHAR(100),

    -- Address fields
    address VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),

    -- Precise location fields
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    formatted_address TEXT,
    place_id VARCHAR(255),

    -- Contact information
    contact_name VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website VARCHAR(255),

    -- Farm specifics
    farm_type TEXT[] NOT NULL,
    certifications TEXT[],
    production_capacity TEXT,
    breeds TEXT[],
    farming_practices TEXT,

    -- Facilities
    housing_types TEXT[],
    has_processing_facility BOOLEAN NOT NULL DEFAULT FALSE,
    processing_details TEXT,
    storage_capabilities TEXT,
    biosecurity_measures TEXT,

    -- Business information
    business_hours TEXT,
    delivery_options TEXT[],
    delivery_details TEXT,
    pickup_available BOOLEAN NOT NULL DEFAULT FALSE,
    pickup_details TEXT,
    payment_methods TEXT[],
    wholesale_available BOOLEAN NOT NULL DEFAULT FALSE,
    wholesale_details TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX farms_seller_id_idx ON farms(seller_id);
CREATE INDEX farms_location_idx ON farms(latitude, longitude);

-- Enable Row Level Security on the farms table
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;

-- ✅ Policy: Public read access - Everyone can view all farms
CREATE POLICY "Public can view farms"
ON farms
FOR SELECT
USING (true);

-- ✅ Policy: Only authenticated users can create farms
CREATE POLICY "Only authenticated users can create farms"
ON farms
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- ✅ Policy: Farm owners can update their own farms
CREATE POLICY "Farm owners can update their own farms"
ON farms
FOR UPDATE
USING (auth.uid() = seller_id);

-- ✅ Policy: Farm owners can delete their own farms
CREATE POLICY "Farm owners can delete their own farms"
ON farms
FOR DELETE
USING (auth.uid() = seller_id);

-- ✅ Policy: Only sellers can create farms
CREATE POLICY "Only sellers can create farms"
ON farms
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'seller'
    )
);

-- ✅ Policy: Admins can manage all farms
CREATE POLICY "Admins can manage all farms"
ON farms
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);


--farm-media
CREATE TABLE farm_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  url TEXT NOT NULL CHECK (url ~* '^https?://.+\.(jpg|jpeg|png|gif|webp|mp4)(\?.*)?$'),
  type VARCHAR(5) NOT NULL CHECK (type IN ('image', 'video')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_farm_media_farm ON farm_media(farm_id);
CREATE INDEX idx_farm_media_type ON farm_media(type);
CREATE INDEX idx_farm_media_url ON farm_media(url);

-- Auto-update 'updated_at' on row updates
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_timestamp
BEFORE UPDATE ON farm_media
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Comments for documentation
COMMENT ON TABLE farm_media IS 'Stores media assets (images/videos) for farms';
COMMENT ON COLUMN farm_media.url IS 'Full URL to the media file in storage';
COMMENT ON COLUMN farm_media.type IS 'Media type: image or video';
COMMENT ON COLUMN farm_media.created_at IS 'Timestamp when media was added';
COMMENT ON COLUMN farm_media.updated_at IS 'Timestamp when media was last updated';

-- ✅ Enable Row Level Security (RLS)
ALTER TABLE farm_media ENABLE ROW LEVEL SECURITY;

-- ✅ RLS Policies
-- Allow all users to view farm media
CREATE POLICY "Anyone can view farm media"
ON farm_media
FOR SELECT USING (true);

-- Allow only farm owners to insert media
CREATE POLICY "Farm owners can insert media"
ON farm_media
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM farms WHERE farms.id = farm_media.farm_id AND farms.seller_id = auth.uid()
  )
);

-- Allow only farm owners to update media
CREATE POLICY "Farm owners can update media"
ON farm_media
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM farms WHERE farms.id = farm_media.farm_id AND farms.seller_id = auth.uid()
  )
);

-- Allow only farm owners to delete media
CREATE POLICY "Farm owners can delete media"
ON farm_media
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM farms WHERE farms.id = farm_media.farm_id AND farms.seller_id = auth.uid()
  )
);


-- Create cart_items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Ensure a user can only have one cart item per product
  CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Create index for faster queries
CREATE INDEX cart_items_user_id_idx ON cart_items(user_id);

-- Enable Row Level Security
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users can only view their own cart items
CREATE POLICY "Users can view their own cart items"
ON cart_items
FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own cart items
CREATE POLICY "Users can add items to their own cart"
ON cart_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own cart items
CREATE POLICY "Users can update their own cart items"
ON cart_items
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can only delete their own cart items
CREATE POLICY "Users can delete their own cart items"
ON cart_items
FOR DELETE
USING (auth.uid() = user_id);

