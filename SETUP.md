# AgriLingua Setup Guide

AgriLingua is a multilingual agricultural advisory platform that helps farmers get expert advice through an AI-powered chatbot.

## Features

### Multilingual Chat
- **Multilingual Support**: Chat in English, Hausa, Yoruba, or Igbo
- **Text Input**: Type your questions about farming, crops, and agriculture
- **Voice Recording**: Record voice messages for hands-free communication
- **Image Analysis**: Upload crop photos for disease detection and treatment advice
- **Real-time Chat**: Get instant responses to your agricultural questions

### Smart Farming Tools
- **Crop Planner**: Get personalized crop recommendations based on location, soil, and rainfall
- **Crop Analyzer**: Upload crop photos for health analysis and treatment recommendations
- **Pest & Disease Identifier**: Identify pests/diseases with treatment suggestions
- **Fertilizer Planner**: Get NPK recommendations with application schedules
- **Soil Health Checker**: Analyze soil characteristics and get crop suitability ratings
- **Water Optimizer**: Smart irrigation schedules and water-saving tips

### Weather & Climate Center
- **Local Weather Hub**: Real-time 7-day forecast with rainfall predictions
- **Farming Advice**: Actionable recommendations based on current weather
- **Planting Windows**: Ideal planting conditions based on weather patterns
- **Weather Alerts**: Notifications for heatwaves, storms, frost, and heavy rain
- **Location Support**: Auto-detect location or select from major African cities

### Market Intelligence
- **Market Price Board**: Daily updated prices for crops across major Nigerian markets
- **Price Trends**: Visual indicators showing up/down/stable trends with percentages
- **Selling Recommendations**: Best time to sell based on market conditions
- **Market Filtering**: Search and filter by crop category, region, or market name
- **Multi-Market Coverage**: Prices from Dawanau, Mile 12, Wuse, Onitsha, and more
- **Crop Categories**: Grains, Vegetables, Tubers, Legumes, Livestock Feed, Oil Seeds, Cash Crops

## Database Setup

The application uses Supabase for data storage. To set up the database:

1. Navigate to your Supabase project dashboard
2. Go to the SQL Editor
3. Run the migration script from `database-migration.sql`
4. Run the market prices migration from `market-prices-migration.sql`

This will create:
- `chat_sessions` table: Stores user chat sessions
- `messages` table: Stores all chat messages
- `market_prices` table: Stores crop prices from various markets
- Row Level Security policies for data protection
- Indexes for optimal query performance

The `market_prices` table includes sample data for 20+ crops across major Nigerian markets including:
- Grains: Maize, Rice, Beans, Sorghum, Millet
- Vegetables: Tomatoes, Onions, Pepper
- Tubers: Yam, Cassava
- Legumes: Groundnut, Soybean
- Livestock Feed: Sorghum, Millet
- Oil Seeds: Palm Oil, Groundnut Oil
- Cash Crops: Cocoa, Coffee

## Edge Function Setup

AgriLingua uses a Supabase Edge Function to process chat requests. To deploy:

1. The edge function code is located in `supabase/functions/agrilingua-chat/`
2. Deploy it using the Supabase CLI or dashboard

The edge function handles:
- Text message processing
- Image analysis requests
- Multilingual response generation

## AI Integration

The current implementation includes demo responses in all supported languages. To integrate with actual AI models:

### For Text Processing (NCAIR1/N-ATLaS)
1. Update the `generateTextResponse` function in `supabase/functions/agrilingua-chat/index.ts`
2. Add your NCAIR1/N-ATLaS API credentials as Supabase secrets
3. Replace demo responses with actual API calls

### For Image Analysis
1. Update the `analyzeImage` function in the edge function
2. Integrate with your vision model (e.g., MobileNet trained on PlantVillage)
3. Add image processing and classification logic

## Environment Variables

The following environment variables are already configured in `.env`:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_OPENWEATHER_API_KEY`: Your OpenWeatherMap API key (optional)

### Weather Dashboard Setup

The weather dashboard requires an OpenWeatherMap API key to fetch real weather data:

1. Sign up for a free account at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your API key from the dashboard
3. Add it to `.env` as `VITE_OPENWEATHER_API_KEY=your_api_key_here`

**Note**: The weather dashboard will use mock data if no API key is provided, so the application will work without it.

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Application Structure

```
src/
├── components/
│   ├── LandingPage.tsx      # Welcome page with feature highlights
│   ├── ChatBot.tsx           # Main chat interface
│   ├── MessageList.tsx       # Message display component
│   ├── ChatInput.tsx         # Input with text, voice, and image support
│   └── LanguageSelector.tsx  # Language selection dropdown
├── App.tsx                   # Main application component
└── main.tsx                  # Application entry point

supabase/
└── functions/
    └── agrilingua-chat/
        └── index.ts          # Edge function for AI processing
```

## User Flow

1. **Landing Page**: Users see feature highlights and click "Start Chatting"
2. **Chat Interface**: Users can:
   - Select their preferred language (English, Hausa, Yoruba, Igbo)
   - Type text messages
   - Record voice messages
   - Upload crop images for analysis
3. **AI Responses**: The system responds in the user's selected language

## Future Enhancements

- User authentication for saving chat history
- Offline support with service workers
- Push notifications for important agricultural alerts
- Integration with weather APIs for location-specific advice
- Community forum for farmers to share experiences
- Expert consultation booking system

## Support

For technical support or feature requests, please contact the development team.
