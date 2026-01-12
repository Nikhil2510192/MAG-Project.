import { ChromaClient } from "chromadb";
import OpenAI from "openai"; // Import OpenAI SDK
import Form from "../models/formModel.js";

// Initialize the Chroma client to connect to your local Vector Database
const chroma = new ChromaClient({
  path: "http://localhost:8000",
});

// Initialize OpenAI with your API Key
let openaiClient = null;

const getOpenAIClient = () => {
  if (!openaiClient) {
    // Check for API key in multiple places
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error("OpenAI API key not found. Please set OPENAI_API_KEY environment variable.");
      console.error("Current environment keys:", Object.keys(process.env).filter(k => k.includes('OPENAI')));
      throw new Error("Missing OpenAI API key. Please set OPENAI_API_KEY environment variable.");
    }

    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
  }
  return openaiClient;
};


const COLLECTION1 = "user_memory";
const COLLECTION2 = "user_feedback";

/**
 * Helper function: Converts the Form object into a structured string.
 * This "human-readable" block is what the AI uses to understand the 'vibe' of the request.
 */
const buildFormQueryText = (form) => {
  return `
Role: ${form.role}
Update Type: ${form.updatetype}
Main Content: ${form.content}
Challenges: ${form.challenges || ""}
Call To Action: ${form.CTA || ""}
`.trim();
};

/**
 * Main function: Finds the most similar past posts to help the AI write better current ones.
 */
export const getTopRelevantMemories = async ({
  formId, // The ID of the form the user just filled out
  userId, // The logged-in user's ID (for security filtering)
  topK = 3, 
}) => {
  
  // 1. Fetch the actual form data from MongoDB using the provided ID
  const form = await Form.findById(formId);
  if (!form) {
    throw new Error("Form not found");
  }

  // 2. Convert that form data into the structured text block we defined above
  const queryText = buildFormQueryText(form);

  // 3. GENERATE EMBEDDING: Use OpenAI to turn the current form's text into a math vector
  const openai = getOpenAIClient();
  let queryEmbedding;
  try {
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: queryText,
    });

    if (
      !embeddingResponse.data ||
      !embeddingResponse.data[0] ||
      !embeddingResponse.data[0].embedding
    ) {
      throw new Error("Invalid embedding response from OpenAI API");
    }

    queryEmbedding = embeddingResponse.data[0].embedding; // This is our 'Search Vector'
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }

  // 4. Connect to the 'user_memory' collection in your Vector DB
  let collection;

  try {
    collection = await chroma.getOrCreateCollection({
      name: COLLECTION1,
    });
  } catch (error) {
    console.error("Error accessing Chroma collection:", error);
    throw new Error(`Failed to access vector database: ${error.message}`);
  }

  // 5. SEMANTIC SEARCH: Ask Chroma to find vectors similar to our current queryEmbedding
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding], // Our current form's vector
    nResults: topK, // How many similar items to return
    where: {
      userId: userId.toString(), // CRITICAL: Only search memories belonging to THIS user
    },
  });

  // 6. EXTRACT DATA: The search returns 'metadata'. We pull out the MongoDB IDs we saved earlier.
  // This allows us to link the 'similar' vector back to the original database record.
  const mongoDocIds = (results.metadatas?.[0] || [])
    .map((meta) => meta.mongoDocId)
    .filter(Boolean);

  // Returns an array of MongoDB IDs (e.g., ["65a...", "65b..."])
  return mongoDocIds; 
};










export const getRelevantFeedback = async ({
  formId, // The ID of the form to compare against feedback
  userId, // Security filter
  topK = 3,
}) => {
  
  // 1. Fetch the actual form data from MongoDB
  const form = await Form.findById(formId);
  if (!form) {
    throw new Error("Form not found");
  }

  // 2. Convert form data into query text
  const queryText = buildFormQueryText(form);

  // 3. GENERATE EMBEDDING: Turn current form text into a vector for searching
  const openai = getOpenAIClient();
  let queryEmbedding;
  try {
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: queryText,
    });

    if (
      !embeddingResponse.data ||
      !embeddingResponse.data[0] ||
      !embeddingResponse.data[0].embedding
    ) {
      throw new Error("Invalid embedding response from OpenAI API");
    }

    queryEmbedding = embeddingResponse.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }

  // 4. Connect specifically to the 'user_feedback' collection
  let collection;
  try {
    collection = await chroma.getOrCreateCollection({
      name: COLLECTION2,
    });
  } catch (error) {
    console.error("Error accessing Chroma collection:", error);
    throw new Error(`Failed to access vector database: ${error.message}`);
  }

  // 5. SEMANTIC SEARCH: Query COLLECTION 2 for similar feedback
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
    where: {
      userId: userId.toString(), // Ensure user only sees their own feedback
    },
  });

  // 6. EXTRACT DATA: Map the results back to MongoDB IDs
  const mongoDocIds = (results.metadatas?.[0] || [])
    .map((meta) => meta.mongoDocId)
    .filter(Boolean);

  // Returns the top 3 relevant MongoDB IDs from the feedback collection
  return mongoDocIds;
};