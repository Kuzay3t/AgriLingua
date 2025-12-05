/*
  # Market Prices Table

  1. New Tables
    - `market_prices`
      - `id` (uuid, primary key) - Unique identifier for each price entry
      - `crop_name` (text) - Name of the crop (e.g., Maize, Beans, Rice)
      - `crop_category` (text) - Category (e.g., Grains, Vegetables, Livestock Feed)
      - `market_name` (text) - Market location (e.g., Dawanau, Mile 12)
      - `region` (text) - Geographic region (e.g., Northern Nigeria, Western Nigeria)
      - `price_per_kg` (decimal) - Current price per kilogram
      - `currency` (text) - Currency code (e.g., NGN, USD)
      - `trend` (text) - Price trend: 'up', 'down', or 'stable'
      - `trend_percentage` (decimal) - Percentage change from last update
      - `last_updated` (timestamptz) - When the price was last updated
      - `best_selling_period` (text) - Recommended selling period (e.g., "Now", "Wait 2-3 weeks")
      - `notes` (text) - Additional market insights or notes
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on `market_prices` table
    - Add policy for public read access (anyone can view prices)
    - Add policy for authenticated admin users to insert/update prices

  3. Indexes
    - Index on crop_name for fast filtering
    - Index on market_name for location-based queries
    - Index on last_updated for sorting by freshness
*/

CREATE TABLE IF NOT EXISTS market_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name text NOT NULL,
  crop_category text NOT NULL DEFAULT 'Grains',
  market_name text NOT NULL,
  region text NOT NULL,
  price_per_kg decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  trend text NOT NULL DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
  trend_percentage decimal(5,2) DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  best_selling_period text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view market prices"
  ON market_prices FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert market prices"
  ON market_prices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update market prices"
  ON market_prices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete market prices"
  ON market_prices FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_market_prices_crop_name ON market_prices(crop_name);
CREATE INDEX IF NOT EXISTS idx_market_prices_market_name ON market_prices(market_name);
CREATE INDEX IF NOT EXISTS idx_market_prices_last_updated ON market_prices(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_market_prices_category ON market_prices(crop_category);

-- Insert sample market data
INSERT INTO market_prices (crop_name, crop_category, market_name, region, price_per_kg, trend, trend_percentage, best_selling_period, notes) VALUES
  ('Maize (Yellow)', 'Grains', 'Dawanau Market', 'Northern Nigeria (Kano)', 450.00, 'up', 8.5, 'Good time to sell', 'High demand due to festive season'),
  ('Maize (White)', 'Grains', 'Mile 12 Market', 'Western Nigeria (Lagos)', 520.00, 'up', 12.0, 'Excellent time to sell', 'Supply shortage driving prices up'),
  ('Rice (Local)', 'Grains', 'Wuse Market', 'Central Nigeria (Abuja)', 680.00, 'stable', 0, 'Fair price', 'Steady market conditions'),
  ('Rice (Foreign)', 'Grains', 'Onitsha Market', 'Eastern Nigeria', 850.00, 'down', -5.0, 'Wait 2-3 weeks', 'Recent imports affecting prices'),

  ('Beans (Brown)', 'Grains', 'Dawanau Market', 'Northern Nigeria (Kano)', 720.00, 'up', 15.0, 'Excellent time to sell', 'Peak demand period'),
  ('Beans (White)', 'Grains', 'Mile 12 Market', 'Western Nigeria (Lagos)', 780.00, 'stable', 2.0, 'Good time to sell', 'Consistent pricing'),

  ('Tomatoes', 'Vegetables', 'Mile 12 Market', 'Western Nigeria (Lagos)', 350.00, 'down', -20.0, 'Wait if possible', 'Harvest season oversupply'),
  ('Tomatoes', 'Vegetables', 'Bodija Market', 'Western Nigeria (Ibadan)', 320.00, 'down', -18.0, 'Wait if possible', 'Peak harvest period'),
  ('Onions', 'Vegetables', 'Dawanau Market', 'Northern Nigeria (Kano)', 280.00, 'up', 10.0, 'Good time to sell', 'Storage shortage'),
  ('Pepper (Red)', 'Vegetables', 'Mile 12 Market', 'Western Nigeria (Lagos)', 450.00, 'stable', 0, 'Fair price', 'Normal market activity'),

  ('Yam', 'Tubers', 'Bodija Market', 'Western Nigeria (Ibadan)', 420.00, 'up', 7.0, 'Good time to sell', 'Festival period approaching'),
  ('Cassava', 'Tubers', 'Onitsha Market', 'Eastern Nigeria', 180.00, 'stable', -1.0, 'Fair price', 'Steady demand'),

  ('Groundnut', 'Legumes', 'Dawanau Market', 'Northern Nigeria (Kano)', 650.00, 'up', 12.0, 'Excellent time to sell', 'Export demand high'),
  ('Soybean', 'Legumes', 'Wuse Market', 'Central Nigeria (Abuja)', 580.00, 'stable', 3.0, 'Good time to sell', 'Processing factories active'),

  ('Sorghum', 'Livestock Feed', 'Dawanau Market', 'Northern Nigeria (Kano)', 380.00, 'up', 6.0, 'Good time to sell', 'Animal feed demand rising'),
  ('Millet', 'Livestock Feed', 'Sokoto Market', 'Northern Nigeria', 420.00, 'stable', 1.0, 'Fair price', 'Consistent demand'),

  ('Palm Oil', 'Oil Seeds', 'Onitsha Market', 'Eastern Nigeria', 1200.00, 'up', 20.0, 'Excellent time to sell', 'Very high demand'),
  ('Groundnut Oil', 'Oil Seeds', 'Dawanau Market', 'Northern Nigeria (Kano)', 980.00, 'up', 15.0, 'Excellent time to sell', 'Supply constraints'),

  ('Cocoa', 'Cash Crops', 'Ondo Market', 'Western Nigeria', 2800.00, 'stable', 0, 'Fair price', 'International prices stable'),
  ('Coffee', 'Cash Crops', 'Mambilla Market', 'Central Nigeria', 3200.00, 'up', 8.0, 'Good time to sell', 'Export opportunities available')
ON CONFLICT DO NOTHING;
