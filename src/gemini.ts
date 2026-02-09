import { Type } from "@google/genai"
import { db } from "./db"
import { responders } from "./db/schema"
import { eq } from "drizzle-orm"

export async function useGemini(audioBuffer: ArrayBuffer) {
    return
}

export const findResponder = {
    name: 'find_closest_emergency_responder',
    description: 'Searches for the nearest emergency response unit (hospital, fire station, police) based on coordinates.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            latitude: { type: Type.STRING },
            longitude: { type: Type.STRING },
            category: {
                type: Type.STRING,
                enum: ["MEDICAL", "FIRE", "POLICE", "ACCIDENT", "TERRORIST_ATTACK", "OTHER"]
            },
        },
        required: ['latitude', 'longitude', 'category'],
    },
}

export const sendEmergencyAlert = {
    name: 'send_emergency_notification',
    description: 'Sends an emergency alert via SMS or Email to a specified contact.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            recipient: { type: Type.STRING, description: 'Phone number or email address' },
            message: { type: Type.STRING },
            method: { type: Type.STRING, enum: ["SMS", "EMAIL"] },
        },
        required: ['recipient', 'message', 'method'],
    },
}


export const findClosestResponder = async (args: any) => {
    console.log(`🔍 Querying database for ${args.category} near ${args.latitude}, ${args.longitude}...`)

    const results = await db.select()
        .from(responders)
        .where(eq(responders.category, args.category))
        .limit(1);

    if (results.length > 0) {
        const responder = results[0];
        console.log(`✅ Found responder: ${responder.name}`);
        return {
            name: responder.name,
            contact_info: responder.contactInfo,
            category: responder.category,
            distance: "1.2km", // Simulated distance
            eta: "5 mins"
        };
    }

    return {
        error: "No matching responder found in the database for this category.",
        fallback: "Defaulting to city-wide dispatch center."
    };
}

export const sendEmergencyNotification = async (args: any) => {
    console.log(`📲 Sending ${args.method} to ${args.recipient}: ${args.message}`)
    // TODO: Actual Twilio/SendGrid integration
    return { status: "sent", timestamp: new Date().toISOString() }
}