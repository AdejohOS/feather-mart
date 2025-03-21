-- ======================================
-- ✅ ENUM DEFINITIONS
-- ======================================
create type poultry_type as enum (
    'layers', 'broilers', 'breeders', 'dual-purpose'
);

create type housing_system as enum (
    'battery cages', 'deep litter', 'free-range', 'barn system'
);

-- ======================================
-- ✅ FARMS TABLE (WITH APPROVAL SYSTEM)
-- ======================================
create table farms (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references profiles(id) on delete cascade not null, -- Links to seller profile
  
  -- Farm Details
  name text not null, -- Farm name
  country text not null,
  state text,
  address text not null,
  phone_number text not null check (phone_number ~ '^\+\d{7,15}$'), -- Basic phone validation
  farm_email text not null check (farm_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  description text, -- Short farm description

  -- Geospatial Data
  latitude decimal(9,6), -- GPS latitude
  longitude decimal(9,6), -- GPS longitude
  location_geo geography(Point, 4326), -- Geolocation field for spatial queries
  
  -- Operational Details
  poultry_type poultry_type not null,
  capacity int not null check (capacity between 100 and 1000000),
  housing_system housing_system not null,

  -- Media & Certifications
  media jsonb default '[]'::jsonb, -- Stores images & videos as an array of URLs
  certifications text[], -- List of certifications (e.g., organic, free-range)
  
  -- Approval System
  is_approved boolean default false, -- Farm must be approved before being visible
  rejection_reason text, -- If rejected, store the reason

  -- Metadata
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- Constraints
  constraint media_is_array check (jsonb_typeof(media) = 'array'),
  constraint unique_farm_name unique (name, seller_id) -- Prevent duplicate farm names per seller
);

-- Indexes for Performance
create index idx_farms_location on farms(address);
create index idx_farms_seller on farms(seller_id);
create index idx_farms_location_geo on farms using gist(location_geo);
create index idx_farms_poultry_type on farms(poultry_type);
create index idx_farms_capacity on farms(capacity);
create index idx_farms_approval on farms(is_approved);

-- ======================================
-- ✅ TRIGGER: AUTO-UPDATE `updated_at`
-- ======================================
create function update_farm_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_farm_timestamp_trigger
before update on farms
for each row
execute function update_farm_timestamp();

-- ======================================
-- ✅ ENABLE ROW LEVEL SECURITY (RLS) FOR FARMS
-- ======================================
alter table farms enable row level security;

-- 🔹 Public can only see approved farms
create policy "Public can view only approved farms." 
on farms for select using (is_approved = true);

-- 🔹 Sellers can insert farms, Admins can insert any farm
create policy "Sellers can insert farms or Admins can insert any farm." 
on farms for insert with check (
  auth.uid() = seller_id 
  OR (select role from profiles where id = auth.uid()) = 'admin'
);

-- 🔹 Sellers can update their own farms, Admins can update any farm
create policy "Sellers can update their own farms or Admins can update any farm."
on farms for update using (
  auth.uid() = seller_id 
  OR (select role from profiles where id = auth.uid()) = 'admin'
);

-- 🔹 Sellers can delete their own farms, Admins can delete any farm
create policy "Sellers can delete their own farms or Admins can delete any farm."
on farms for delete using (
  auth.uid() = seller_id 
  OR (select role from profiles where id = auth.uid()) = 'admin'
);

-- 🔹 Admins can approve or reject farms
create policy "Admins can approve or reject farms."
on farms for update using (
  (select role from profiles where id = auth.uid()) = 'admin'
);

-- ======================================
-- ✅ FARM REVIEWS TABLE (WITH ADMIN CONTROL)
-- ======================================
create table farm_reviews (
  id uuid default gen_random_uuid() primary key,
  farm_id uuid references farms(id) on delete cascade not null,
  reviewer_id uuid references profiles(id) on delete cascade not null,
  rating int not null check (rating between 1 and 5), -- Rating from 1 to 5
  review text not null check (length(review) >= 10), -- Minimum 10 characters for review
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for better performance
create index idx_reviews_farm_id on farm_reviews(farm_id);
create index idx_reviews_reviewer_id on farm_reviews(reviewer_id);
create index idx_reviews_rating on farm_reviews(rating);

-- ======================================
-- ✅ TRIGGER: AUTO-UPDATE `updated_at`
-- ======================================
create function update_review_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_review_timestamp_trigger
before update on farm_reviews
for each row
execute function update_review_timestamp();

-- ======================================
-- ✅ ENABLE RLS FOR FARM REVIEWS
-- ======================================
alter table farm_reviews enable row level security;

-- 🔹 Public can view all reviews
create policy "Public reviews are viewable by everyone." 
on farm_reviews for select using (true);

-- 🔹 Buyers can review farms
create policy "Buyers can add reviews."
on farm_reviews for insert with check (
  auth.uid() = reviewer_id
);

-- 🔹 Reviewers can update their own reviews
create policy "Reviewers can update their own reviews."
on farm_reviews for update using (
  auth.uid() = reviewer_id
);

-- 🔹 Reviewers can delete their own reviews OR Admins can delete any review
create policy "Reviewers can delete their own reviews or Admins can delete any review."
on farm_reviews for delete using (
  auth.uid() = reviewer_id 
  OR (select role from profiles where id = auth.uid()) = 'admin'
);

);



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
  CONSTRAINT discount_price_less_than_price CHECK (discount_price IS NULL OR discount_price < price),
  CONSTRAINT stock_nonnegative CHECK (stock >= 0),
  CONSTRAINT minimum_order_nonnegative CHECK (minimum_order IS NULL OR minimum_order >= 0),
  CONSTRAINT minimum_order_less_than_stock CHECK (minimum_order IS NULL OR minimum_order <= stock)
);

-- Create indexes for faster queries
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_farm_id ON products(farm_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
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

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies for access control
-- Allow anyone to view products
CREATE POLICY "Anyone can view products" 
ON products FOR SELECT 
USING (true);

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
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Ensure the farms table exists
CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  website VARCHAR(255),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create index for faster queries on farms
CREATE INDEX idx_farms_seller_id ON farms(seller_id);

-- Trigger to update the updated_at timestamp for farms
CREATE TRIGGER update_farms_updated_at
BEFORE UPDATE ON farms
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();


CREATE TABLE product_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL CHECK (url ~* '^https?://[^/]+/\S+\.(jpg|jpeg|png|gif|webp|mp4)$'),
  type VARCHAR(5) NOT NULL CHECK (type IN ('image', 'video')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes separately
CREATE INDEX idx_product_media_product ON product_media(product_id);
CREATE INDEX idx_product_media_type ON product_media(type);
CREATE INDEX idx_product_media_url ON product_media(url);

-- Auto-update 'updated_at' on updates
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_timestamp
BEFORE UPDATE ON product_media
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Comments for documentation
COMMENT ON TABLE product_media IS 'Stores media assets (images/videos) for products';
COMMENT ON COLUMN product_media.url IS 'Full URL to the media file in storage';
COMMENT ON COLUMN product_media.type IS 'Media type: image or video';
COMMENT ON COLUMN product_media.created_at IS 'Timestamp when media was added';
COMMENT ON COLUMN product_media.updated_at IS 'Timestamp when media was last updated';




npx supabase gen types typescript --project-id vddbmhfthnptkrwwjhyy --schema public > types_db.ts

  