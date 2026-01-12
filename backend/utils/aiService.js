import OpenAI from "openai";
import Form from "../models/formModel.js";
import PastPost from "../models/PastPostModel.js";
import { getTopRelevantMemories,getRelevantFeedback } from "./retrieval.js";
import genPost from "../models/genPostModel.js";

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


/**
 * Builds a highly structured LinkedIn prompt that blends:
 * - User intent (Form)
 * - User style (Past posts + memories)
 * - Structural inspiration (Liked post)
 */
const buildLinkedInPrompt = ({
  form,
  currentPastPost,
  currentLikedPost,
  retrievedMemories,
  retrievedFeedbacks,
}) => {
  return `
# ROLE
You are a world-class LinkedIn Ghostwriter. Your goal is to write a post for a ${form.role} that sounds exactly like them, but is structured as effectively as a viral post.

# 1. USER'S WRITING DNA (The Style Reference)
Analyze these texts to understand the user's "voice." Look at their use of white space, emoji frequency, sentence length, and how they handle professional topics.
- Recent Example: "${currentPastPost || "No recent example provided"}"
- Historical Memories (Increasingly relevant): 
${retrievedMemories.length > 0 ? retrievedMemories.map((m, i) => `Entry ${i + 1}: ${m}`).join("\n") : "No historical memories available"}
-user past feedbacks on generated posts:
${retrievedFeedbacks.length > 0 ? retrievedFeedbacks.map((f, i) => `Feedback ${i + 1}: ${f}`).join("\n") : "No feedbacks available"}
# 2. CURRENT MISSION (The "What")
- Update Type: ${form.updatetype}
- Topic: ${form.content}
- Specific Challenges: ${form.challenges || "None"}
- People to Mention/Tag: ${form.tag || "None"} 
- Relevant Links: ${form.links || "None"}
- Extra Context: ${form.other || "None"}
- Call to Action: ${form.CTA || "Invite engagement in comments"}

# 3. STRUCTURAL TEMPLATE (The "Inspiration")
The user liked the organization of this post. Use its "Logical Flow" (e.g., if it starts with a controversy and ends with a list, do that).
**CRITICAL: Do not use its words. Only use its skeleton.**
- Structure to Mimic: "${currentLikedPost || "No structure template provided"}"

# 4. WRITING CONSTRAINTS
- NO AI WORDS: Never use "delve," "leverage," "tapestry," "vibrant," or "shaping the future."
- FORMAT: Use short paragraphs and clear line breaks.
- TAGGING: If a person is mentioned in "People to Mention," integrate them naturally.
- HASHTAGS: Include these: ${form.hashtags || "2-3 relevant tags"}.

# FINAL TASK
Write the post now. It must be indistinguishable from a post written by the user themselves.
`.trim();
};

/**
 * Main function: Generates a LinkedIn post using OpenAI,
 * enhanced by semantic memory retrieval.
 */
export const generateLinkedInPost = async ({
  userId,
  formId,
  currentPastPost,
  currentLikedPost,
}) => {
  // 1. Fetch form
  const form = await Form.findById(formId);
  if (!form) {
    throw new Error("Form not found");
  }

  // 2. Retrieve top 3 relevant memories (after 5-post threshold)
  let retrievedMemories = [];
  let retrievedFeedbacks = [];

  const memoryIds = await getTopRelevantMemories({
    userId,
    formId,
    topK: 3,
  });

  if (memoryIds.length > 0) {
    const pastPosts = await PastPost.find({ _id: { $in: memoryIds } });

    retrievedMemories = [
      ...pastPosts.map(p => p.pastPost),
    ];
  }

  const feedbackIds = await getRelevantFeedback({
    userId,
    formId,
    topK: 3,
  });
  if (feedbackIds.length > 0) {
    const feedbacks = await genPost.find({ _id: { $in: feedbackIds } });
    retrievedFeedbacks = [
      ...feedbacks.map(f => f.feedback),
    ];
  }

  // 3. Build prompt
  const prompt = buildLinkedInPrompt({
    form,
    currentPastPost,
    currentLikedPost,
    retrievedMemories,
    retrievedFeedbacks
  });

  // 4. Call OpenAI
  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // fast + high quality for content
      messages: [
        {
          role: "system",
          content: "You are an expert LinkedIn ghostwriter.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error("Empty response from OpenAI API");
    }

    return response;
  } catch (error) {
    console.error("Error generating LinkedIn post:", error);
    throw new Error(`Failed to generate post: ${error.message}`);
  }
};
