import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DocumentChunk {
  document_name: string;
  content: string;
  metadata?: Record<string, any>;
}

interface StoreRequest {
  chunks: DocumentChunk[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { chunks }: StoreRequest = await req.json();

    if (!chunks || !Array.isArray(chunks) || chunks.length === 0) {
      return new Response(
        JSON.stringify({ error: "Chunks array is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize embedding model
    const model = new Supabase.ai.Session("gte-small");

    // Process chunks in batches
    const processedChunks = [];
    for (const chunk of chunks) {
      try {
        // Generate embedding for the content
        const embedding = await model.run(chunk.content, {
          mean_pool: true,
          normalize: true,
        });

        processedChunks.push({
          document_name: chunk.document_name,
          content: chunk.content,
          metadata: chunk.metadata || {},
          embedding: embedding,
        });
      } catch (error) {
        console.error(`Error processing chunk from ${chunk.document_name}:`, error);
      }
    }

    // Insert chunks into database
    const { data, error } = await supabase
      .from("document_chunks")
      .insert(processedChunks)
      .select();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        inserted: data?.length || 0,
        message: `Successfully stored ${data?.length || 0} document chunks`,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error storing documents:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred storing documents",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
