
/**
 * This service handles Gemini API integrations for strategic analysis and viewer sentiment.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Recommendation, Video } from '../types';

// Fix: Initializing the Gemini AI client with the correct pattern
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const dashboardGenerateRecommendations = async (channelData?: any, videos?: Video[]): Promise<Recommendation[]> => {
    // Fix: Using @google/genai to generate content with a defined response schema
    try {
        let prompt = "Act as a world-class YouTube strategist. Provide 3 actionable START, STOP, or CONTINUE recommendations. Ensure recommendations are specific and data-driven.";
        if (channelData) {
            prompt = `Act as a world-class YouTube strategist for the channel '${channelData.title}' which has ${channelData.subscriberCount || 'multiple'} subscribers and an aggregate of ${channelData.totalViews || 'lots of'} views. Provide 3 actionable START, STOP, or CONTINUE recommendations tailored to this exact channel size and inferred niche. Ensure recommendations are specific and data-driven.`;
        }

        if (videos && videos.length > 0) {
            const videoDataStr = videos.slice(0, 10).map(v => `- Title: "${v.title}" | Views: ${v.views} | Outlier Score: ${v.outlier_score}x`).join('\n');
            prompt += `\n\nHere is data from their recent uploads:\n${videoDataStr}\n\nUse this specific upload data to give incredibly tailored advice regarding titles, current performance, and what topics or formats they should double down on or stop.`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            recommendation_id: { type: Type.STRING },
                            category: { type: Type.STRING, description: "Must be exactly 'START', 'STOP', or 'CONTINUE'" },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            confidence_score: { type: Type.NUMBER },
                            supporting_data: { type: Type.STRING }
                        },
                        required: ["recommendation_id", "category", "title", "description", "confidence_score"]
                    }
                }
            }
        });

        const jsonStr = response.text?.trim();
        if (!jsonStr) return [];
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating strategic insights:", error);
        return [];
    }
};

export const generateToolOutput = async (toolType: string, input: string): Promise<string> => {
    try {
        let prompt = "";
        if (toolType === 'tag_generator') {
            prompt = `I am going to provide you with a YouTube video title or topic. I want you to generate an exhaustive list of at least 40 highly targeted SEO tags for this video. They should be comma separated. Only return the tags, no other text. Input: "${input}"`;
        } else if (toolType === 'idea_generator') {
             prompt = `Brainstorm exactly 5 compelling and viral-style YouTube video titles based on the keyword/topic: "${input}". They must sound natural but highly clickable. Do not just slap the keyword into a preset. Make them creative. Format them as a simple list with double line breaks between each.`;
        } else if (toolType === 'title_analyzer') {
             prompt = `Analyze the YouTube video title: "${input}". Score its potential CTR hook out of 100%. Then provide 3 bullet points of strict feedback on why it might fail or succeed, and give 1 alternative improvement.`;
        } else if (toolType === 'description_writer') {
             prompt = `Write a highly engaging, SEO-optimized YouTube description (~150 words) for a video about: "${input}". Include a hook in the first two lines, and weave in relevant keywords naturally. Do not include timestamps.`;
        } else if (toolType === 'community_post') {
             prompt = `Write a highly engaging YouTube community post to interact with subscribers about this topic: "${input}". Include a question to drive comments, use emojis naturally, and keep it under 100 words.`;
        } else if (toolType === 'script_outline') {
             prompt = `Create a high-retention 4-part video script outline for a YouTube video about: "${input}". Break it into: 1. The Hook (first 30s), 2. The Setup/Context, 3. The Meat (Main points), 4. The Payoff/Call to Action. Make it snappy and outline what visual elements should be on screen.`;
        } else if (toolType === 'thumbnail_brainstormer') {
             prompt = `Give me 3 highly distinct, high-CTR visual thumbnail concepts for a video titled/about: "${input}". For each concept describe: 1. The main focal subject. 2. The background. 3. Short, punchy (max 4 words) thumbnail text. 4. Why it works psychologically.`;
        } else if (toolType === 'sponsor_pitch') {
             prompt = `Write a professional outreach email pitch to a sponsor for my YouTube channel. The video is going to be about: "${input}". The email should be concise, value-driven, and end with a soft call to action. Include placeholders like [Brand Name] and [Channel Name].`;
        } else if (toolType === 'faq_generator') {
             prompt = `Generate a list of the 5 most burning, frequently asked questions audiences have regarding the topic: "${input}". For each question, provide a punchy 2-sentence answer that I can speak directly to the camera to build authority.`;
        } else if (toolType === 'missing_topics') {
             prompt = `I track competitors in the niche/topic of: "${input}". Identify 3 specific sub-topics or angles related to this that are currently heavily trending in search/culture but that competitors have likely ignored or not covered in the last 6 months. Explain why each is an untapped opportunity.`;
        } else {
             return "Unknown tool type.";
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt
        });

        return response.text?.trim() || "Generation failed.";
    } catch (error) {
        console.error("Error generating tool output:", error);
        return "An error occurred while generating the output. Please try again.";
    }
};
export const analyzeSentiment = async (videoId: string) => {
    // Fix: Using @google/genai to analyze viewer sentiment
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze viewer comments and sentiment for YouTube video ID: ${videoId}. Provide a high-level summary, common themes, and a sentiment score between 0 and 1.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        themes: { type: Type.ARRAY, items: { type: Type.STRING } },
                        sentiment_score: { type: Type.NUMBER }
                    },
                    required: ["summary", "themes", "sentiment_score"]
                }
            }
        });

        const jsonStr = response.text?.trim();
        if (!jsonStr) return null;
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error analyzing sentiment:", error);
        return {
            summary: "Sentiment analysis unavailable.",
            themes: [],
            sentiment_score: 0.5
        };
    }
};
