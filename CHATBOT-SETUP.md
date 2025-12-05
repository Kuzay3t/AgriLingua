# AgriLingua Chatbot Setup Guide

## Overview

The chatbot now has three levels of intelligence:

1. **RAG System** (Best) - Uses your agricultural PDFs for expert responses
2. **OpenAI Integration** (Good) - Uses GPT-4 with specialized agricultural knowledge
3. **Enhanced Fallbacks** (Basic) - Region-specific responses for Nigerian agriculture

## Current Status

✅ Enhanced fallback responses with Nigerian regional crop knowledge
✅ OpenAI integration configured
⚠️ RAG system pending (database JWT expired)

## Setup Instructions

### Option 1: Use OpenAI for Comprehensive Responses (Recommended Now)

1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Add it to your `.env` file:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Redeploy the edge function (it's already updated)
4. The chatbot will now give detailed, region-specific advice

**Cost:** ~$0.002 per message using GPT-4o-mini

### Option 2: Use Enhanced Fallbacks (Free, Available Now)

The chatbot already has improved fallback responses including:

**For Kaduna/Northern Nigeria questions:**
- Recommends: Sorghum, millet, maize, groundnuts, cotton, tomatoes, onions
- Provides planting times: May-June (start of rainy season)
- Includes soil and irrigation guidance

**For general farming questions:**
- Comprehensive soil health guidance
- Water management specifics (25-50mm per week)
- Pest control strategies
- Fertilizer application schedules
- Region-specific planting calendars

### Option 3: RAG System with PDFs (Best, but requires database fix)

Wait for Bolt to refresh the Supabase database credentials, then:
1. Run database migration
2. Process and upload PDF documents
3. Deploy RAG edge function

## Testing the Improvements

Try these questions:
- "What is the best crop to plant in Kaduna?"
- "When should I plant maize in northern Nigeria?"
- "How do I improve my soil health?"
- "What crops grow well in Lagos?"

## Response Quality Comparison

### Before (Generic):
> "That's a great question about farming! Based on your inquiry, I recommend focusing on soil health and proper irrigation timing."

### After with Enhanced Fallback:
> **Northern Nigeria (Kaduna, Kano, Sokoto):**
> Best crops: Sorghum, millet, maize, groundnuts, cotton, tomatoes, onions, pepper
> - Plant at start of rainy season (May-June)
> - Requires good drainage and moderate irrigation
> - Consider soil testing before planting
> [+ Middle Belt and Southern recommendations]

### With OpenAI (Even Better):
> For Kaduna specifically, you should focus on these high-performing crops:
>
> **Primary Recommendations:**
> 1. **Sorghum** - Extremely drought-tolerant, matures in 90-120 days...
> 2. **Groundnuts** - High market value, nitrogen-fixing...
> [+ specific planting instructions, soil requirements, market advice]

### With RAG (Best):
> Uses your actual agricultural documents to provide citations and technical details from research papers and manuals.
