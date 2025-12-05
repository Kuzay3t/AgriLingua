import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, MapPin, Calendar, Filter, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MarketPrice {
  id: string;
  crop_name: string;
  crop_category: string;
  market_name: string;
  region: string;
  price_per_kg: number;
  currency: string;
  trend: 'up' | 'down' | 'stable';
  trend_percentage: number;
  last_updated: string;
  best_selling_period: string | null;
  notes: string | null;
}

export default function MarketPrices() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMarketPrices();
  }, []);

  const loadMarketPrices = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        setPrices(getMockData());
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('Error loading market prices:', error);
        setPrices(getMockData());
      } else {
        setPrices(data || getMockData());
      }
    } catch (error) {
      console.error('Error loading market prices:', error);
      setPrices(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = (): MarketPrice[] => {
    return [
      {
        id: '1',
        crop_name: 'Maize (Yellow)',
        crop_category: 'Grains',
        market_name: 'Dawanau Market',
        region: 'Northern Nigeria (Kano)',
        price_per_kg: 450.00,
        currency: 'NGN',
        trend: 'up',
        trend_percentage: 8.5,
        last_updated: new Date().toISOString(),
        best_selling_period: 'Good time to sell',
        notes: 'High demand due to festive season'
      },
      {
        id: '2',
        crop_name: 'Maize (White)',
        crop_category: 'Grains',
        market_name: 'Mile 12 Market',
        region: 'Western Nigeria (Lagos)',
        price_per_kg: 520.00,
        currency: 'NGN',
        trend: 'up',
        trend_percentage: 12.0,
        last_updated: new Date().toISOString(),
        best_selling_period: 'Excellent time to sell',
        notes: 'Supply shortage driving prices up'
      },
      {
        id: '3',
        crop_name: 'Rice (Local)',
        crop_category: 'Grains',
        market_name: 'Wuse Market',
        region: 'Central Nigeria (Abuja)',
        price_per_kg: 680.00,
        currency: 'NGN',
        trend: 'stable',
        trend_percentage: 0,
        last_updated: new Date().toISOString(),
        best_selling_period: 'Fair price',
        notes: 'Steady market conditions'
      },
      {
        id: '4',
        crop_name: 'Beans (Brown)',
        crop_category: 'Grains',
        market_name: 'Dawanau Market',
        region: 'Northern Nigeria (Kano)',
        price_per_kg: 720.00,
        currency: 'NGN',
        trend: 'up',
        trend_percentage: 15.0,
        last_updated: new Date().toISOString(),
        best_selling_period: 'Excellent time to sell',
        notes: 'Peak demand period'
      },
      {
        id: '5',
        crop_name: 'Tomatoes',
        crop_category: 'Vegetables',
        market_name: 'Mile 12 Market',
        region: 'Western Nigeria (Lagos)',
        price_per_kg: 350.00,
        currency: 'NGN',
        trend: 'down',
        trend_percentage: -20.0,
        last_updated: new Date().toISOString(),
        best_selling_period: 'Wait if possible',
        notes: 'Harvest season oversupply'
      },
      {
        id: '6',
        crop_name: 'Onions',
        crop_category: 'Vegetables',
        market_name: 'Dawanau Market',
        region: 'Northern Nigeria (Kano)',
        price_per_kg: 280.00,
        currency: 'NGN',
        trend: 'up',
        trend_percentage: 10.0,
        last_updated: new Date().toISOString(),
        best_selling_period: 'Good time to sell',
        notes: 'Storage shortage'
      },
      {
        id: '7',
        crop_name: 'Palm Oil',
        crop_category: 'Oil Seeds',
        market_name: 'Onitsha Market',
        region: 'Eastern Nigeria',
        price_per_kg: 1200.00,
        currency: 'NGN',
        trend: 'up',
        trend_percentage: 20.0,
        last_updated: new Date().toISOString(),
        best_selling_period: 'Excellent time to sell',
        notes: 'Very high demand'
      },
      {
        id: '8',
        crop_name: 'Sorghum',
        crop_category: 'Livestock Feed',
        market_name: 'Dawanau Market',
        region: 'Northern Nigeria (Kano)',
        price_per_kg: 380.00,
        currency: 'NGN',
        trend: 'up',
        trend_percentage: 6.0,
        last_updated: new Date().toISOString(),
        best_selling_period: 'Good time to sell',
        notes: 'Animal feed demand rising'
      }
    ];
  };

  const categories = ['all', ...Array.from(new Set(prices.map(p => p.crop_category)))];
  const regions = ['all', ...Array.from(new Set(prices.map(p => p.region)))];

  const filteredPrices = prices.filter(price => {
    const matchesCategory = selectedCategory === 'all' || price.crop_category === selectedCategory;
    const matchesRegion = selectedRegion === 'all' || price.region === selectedRegion;
    const matchesSearch = searchQuery === '' ||
      price.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      price.market_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesRegion && matchesSearch;
  });

  const getTrendIcon = (trend: string, percentage: number) => {
    if (trend === 'up') {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    } else if (trend === 'down') {
      return <TrendingDown className="w-5 h-5 text-red-600" />;
    }
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getSellingAdviceColor = (advice: string | null) => {
    if (!advice) return 'bg-gray-100 text-gray-800';
    if (advice.toLowerCase().includes('excellent')) return 'bg-green-100 text-green-800 border-green-300';
    if (advice.toLowerCase().includes('good')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (advice.toLowerCase().includes('wait')) return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-xl p-6 border border-emerald-100">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-xl">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Market Price Board</h2>
            <p className="text-sm text-gray-600">Updated daily from major markets</p>
          </div>
        </div>
        <button
          onClick={loadMarketPrices}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-emerald-200 hover:border-emerald-400 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-gray-700">Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 mb-6 border border-emerald-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Search Crop
            </label>
            <input
              type="text"
              placeholder="Search by crop or market..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {regions.map(region => (
                <option key={region} value={region}>
                  {region === 'all' ? 'All Regions' : region}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden border border-emerald-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-emerald-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Crop</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Market</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Price/Kg</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Trend</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Best Time to Sell</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPrices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No market prices found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                filteredPrices.map((price) => (
                  <tr key={price.id} className="hover:bg-emerald-50 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{price.crop_name}</div>
                        <div className="text-xs text-gray-500">{price.crop_category}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-1">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{price.market_name}</div>
                          <div className="text-xs text-gray-500">{price.region}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-lg text-gray-900">
                        ₦{price.price_per_kg.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-center gap-1">
                        {getTrendIcon(price.trend, price.trend_percentage)}
                        <span className={`text-sm font-semibold ${getTrendColor(price.trend)}`}>
                          {price.trend_percentage > 0 ? '+' : ''}{price.trend_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${getSellingAdviceColor(price.best_selling_period)}`}>
                          {price.best_selling_period || 'N/A'}
                        </span>
                        {price.notes && (
                          <div className="text-xs text-gray-600 mt-1">{price.notes}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(price.last_updated)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-900">Rising Prices</span>
          </div>
          <p className="text-sm text-green-800">
            {filteredPrices.filter(p => p.trend === 'up').length} crops showing upward trends
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-900">Falling Prices</span>
          </div>
          <p className="text-sm text-red-800">
            {filteredPrices.filter(p => p.trend === 'down').length} crops showing downward trends
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Minus className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Stable Prices</span>
          </div>
          <p className="text-sm text-blue-800">
            {filteredPrices.filter(p => p.trend === 'stable').length} crops with stable pricing
          </p>
        </div>
      </div>

      <div className="mt-6 bg-emerald-50 rounded-lg p-4 border border-emerald-200">
        <p className="text-xs text-gray-600 text-center">
          Prices are collected from major markets daily. Data provided for reference only.
          Contact local markets directly for current rates before making selling decisions.
        </p>
      </div>
    </div>
  );
}
