import { ChromaClient } from "chromadb";
import OpenAI from "openai";

/** * 1. INITIALIZATION & CONFIGURATION
 * We connect to a local instance of ChromaDB and prepare the OpenAI client.
 */
const chroma = new ChromaClient({
  host: "localhost",
  port: 8000,
  ssl: false,
});

const COLLECTION1 = "user_memory"; // The "table" name inside ChromaDB
const COLLECTION2="user_feedback"
let openaiClient = null; // Singleton pattern to reuse the OpenAI instance

/**
 * Helper function to ensure the OpenAI client is only initialized when needed
 * and that the API key is correctly configured in the environment.
 */
const getOpenAIClient = () => {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error("OpenAI API key not found. Please set OPENAI_API_KEY environment variable.");
      // Helpful debug: shows which keys ARE available if the main one is missing
      console.error("Current environment keys:", Object.keys(process.env).filter(k => k.includes('OPENAI')));
      throw new Error("Missing OpenAI API key.");
    }

    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
};

/**
 * 2. CORE LOGIC: saveToVectorDB
 * This function handles the pipeline: Text -> Vector -> Database Storage.
 */
export const saveToVectorDB = async ({ text, userId, mongoDocId }) => {
  // Guard clause: Prevent errors if data is missing
  if (!text || !userId || !mongoDocId) {
    console.log("Missing required parameters for saveToVectorDB");
    return;
  }

  try {
    const openai = getOpenAIClient();

    /**
     * STEP A: Generate the Embedding
     * Convert the human-readable text into a vector (array of numbers).
     * Using 'text-embedding-3-small' is cost-effective and highly performant.
     */
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    const embedding = embeddingResponse.data[0].embedding;

    /**
     * STEP B: Prepare the Collection
     * 'getOrCreateCollection' ensures the code doesn't crash if the 
     * collection doesn't exist yet.
     */
    const collection = await chroma.getOrCreateCollection({
      name: COLLECTION1,
    });

    /**
     * STEP C: Store the Data
     * - ids: Unique identifier (mapped from your MongoDB ID).
     * - embeddings: The numerical vector for math-based searching.
     * - documents: The original text (so you can read it back).
     * - metadatas: Extra info to filter results later (e.g., searching only for a specific user).
     */
    await collection.add({
      ids: [mongoDocId.toString()],
      embeddings: [embedding],
      documents: [text],
      metadatas: [
        {
          userId: userId.toString(),
          mongoDocId: mongoDocId.toString(),
        },
      ],
    });

    console.log("Saved to Vector DB:", mongoDocId.toString());
  } catch (error) {
    // Catching network errors, API limits, or database connection issues
    console.error("Error saving to Vector DB:", error.message);
  }
};







export const saveToVectorDB2 = async ({
  text,
  userId,
  mongoDocId,
}) => {
  // Guard clause: Ensure all data is present
  if (!text || !userId || !mongoDocId) {
    console.log("Missing required parameters ");
    return;
  }

  try {
    // 1. Generate embedding using OpenAI
    const openai = getOpenAIClient();

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // 2. Get or create the SECOND collection
    const collection = await chroma.getOrCreateCollection({
      name: COLLECTION2, // Points to the new collection
    });

    // 3. Store vector + metadata in COLLECTION 2
    await collection.add({
      ids: [mongoDocId.toString()],
      embeddings: [embedding],
      documents: [text],
      metadatas: [
        {
          userId: userId.toString(),
          mongoDocId: mongoDocId.toString(),
        },
      ],
    });

    console.log(`Saved to ${COLLECTION2}:`, mongoDocId.toString());
  } catch (error) {
    console.error(`Error saving to ${COLLECTION2}:`, error.message);
  }
};