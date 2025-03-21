-- enum definitions
create type poultry_type as enum (
    'layers', 'broilers', 'breeders', 'dual-purpose'
);

create type housing_system as enum (
    'battery cages', 'deep litter', 'free-range', 'barn system'
);

-- Create the farms table
create table farms (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references profiles(id) on delete cascade not null, -- Links to seller profile
  name text not null, -- Farm name
  country text,
  state text,
  address text,
 
  phone_number text,
  farm_email text,
  description text, -- Short farm description

   -- geospatial data
    address text,
  latitude decimal(9,6), -- GPS latitude
  longitude decimal(9,6), -- GPS longitude
  location_geo geography(Point, 4326), -- Geolocation field for spatial queries
  
  -- operational details
  poultry_type poultry_type,
  capacity int not null check (capacity between 100 and 1000000),
  housing_system housing_system

  -- media & certifications
  media jsonb, -- Stores images & videos as an array of URLs
  certifications text[], -- List of certifications (e.g., organic, free-range)
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- Constraints
  constraint media_is_array check (jsonb_typeof(media) = 'array'),
  constraint unique_farm_na
  me unique (name, seller_id) -- Prevent duplicate farm names per seller
);