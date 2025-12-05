/**
 * Test script to verify RAG system is working
 *
 * This script tests the RAG query function to ensure documents are searchable
 */

import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Debug - URL:', SUPABASE_URL ? 'Found' : 'Missing');
console.log('Debug - Key:', SUPABASE_KEY ? 'Found' : 'Missing');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing environment variables");
  console.error("VITE_SUPABASE_URL:", SUPABASE_URL);
  console.error("VITE_SUPABASE_ANON_KEY:", SUPABASE_KEY ? "exists" : "missing");
  process.exit(1);
}

async function testRAG() {
  const testQueries = [
    "How do I test my soil drainage?",
    "What is the spacing for tomatoes?",
    "When should I water my crops?",
    "How do I improve soil health?",
  ];

  console.log("Testing RAG Query Function...\n");

  for (const query of testQueries) {
    console.log(`\n📝 Query: "${query}"`);
    console.log("─".repeat(60));

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/rag-query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ query, topK: 3 }),
      });

      if (!response.ok) {
        console.error(`❌ Error: ${response.status} ${response.statusText}`);
        const error = await response.text();
        console.error(error);
        continue;
      }

      const result = await response.json();

      if (result.results && result.results.length > 0) {
        console.log(`✅ Found ${result.results.length} relevant chunks:\n`);
        result.results.forEach((chunk: any, i: number) => {
          console.log(`  ${i + 1}. Document: ${chunk.document_name}`);
          console.log(`     Similarity: ${(chunk.similarity * 100).toFixed(1)}%`);
          console.log(`     Preview: ${chunk.content.substring(0, 100)}...`);
          console.log();
        });
      } else {
        console.log("⚠️  No relevant documents found");
      }
    } catch (error) {
      console.error(`❌ Error:`, error.message);
    }
  }
}

async function testChat() {
  console.log("\n\n" + "=".repeat(60));
  console.log("Testing Chat Function with RAG...\n");
  console.log("=".repeat(60));

  const testMessage = "How do I test if my soil drains well?";

  console.log(`\n💬 Message: "${testMessage}"`);
  console.log("─".repeat(60));

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/agrilingua-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({
        message: testMessage,
        language: "english",
        messageType: "text",
      }),
    });

    if (!response.ok) {
      console.error(`❌ Error: ${response.status} ${response.statusText}`);
      const error = await response.text();
      console.error(error);
      return;
    }

    const result = await response.json();
    console.log("\n🤖 Response:\n");
    console.log(result.response);
    console.log();
  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }
}

// Run tests
console.log("🚀 Starting RAG System Tests\n");
await testRAG();
await testChat();
console.log("\n✨ Tests complete!");
