import { Elysia, t } from "elysia"
import { cors } from "@elysiajs/cors"
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai"
import { findClosestResponder, findResponder, sendEmergencyAlert, sendEmergencyNotification } from "./gemini"


const app = new Elysia()
.use(cors())
.get('/', () => {
    return { status: "online", message: "🦊 resQ server is running" }
  })

  .post("/emergency", async ({ body }) => {
    const { audio, latitude, longitude } = body

    console.log("🚨 Received emergency signal")
    console.log("📍 Location:", latitude, longitude)
    console.log("🎤 Audio:", audio.name, audio.size, "bytes")
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" })
      const arrayBuffer = await audio.arrayBuffer()
      const base64Audio = Buffer.from(arrayBuffer).toString('base64')

      const prompt = `
        EMERGENCY ALERT SYSTEM

        Location Data: ${latitude}, ${longitude}
        Google Maps: https://www.google.com/maps?q=${latitude},${longitude}

        Analyze the attached audio recording from an emergency signal.

        1. Transcribe the user's speech.
        2. Identify the emergency category and risk level.
        3. IF it is a genuine emergency, you MUST:
           a. Search for the closest responder using find_closest_emergency_responder.
           b. Use the contact info found to send a notification via send_emergency_notification.
        4. Finally, provide your analysis in JSON format.

        JSON Output Schema:
        {
          "category": "MEDICAL" | "FIRE" | "POLICE" | "ACCIDENT" | "TERRORIST_ATTACK" | "OTHER",
          "risk_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
          "transcript": "exact transcription of speech",
          "dispatch_message": "concise message used for dispatch",
          "recommended_action": "specific action for responders",
          "action_taken": "summary of who was contacted"
        }
      `

      let contents: any[] = [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: audio.type || "audio/m4a",
                data: base64Audio
              }
            }
          ]
        }
      ]

      const tools = [{
        functionDeclarations: [findResponder, sendEmergencyAlert]
      }]

      // Call Gemini
      let response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
            includeThoughts: true
          },
          tools: tools
        }
      })

      while (response.functionCalls && response.functionCalls.length > 0) {
        const functionResponses = []

        for (const call of response.functionCalls) {
          let result
          if (call.name === 'find_closest_emergency_responder') {
            result = await findClosestResponder(call.args)
          } else if (call.name === 'send_emergency_notification') {
            result = await sendEmergencyNotification(call.args)
          }

          functionResponses.push({
            functionResponse: {
              name: call.name,
              response: { result }
            }
          })
        }

        // Add history
        if (!response.candidates?.[0]?.content) {
          throw new Error("Gemini returned tool calls but no valid content parts to resume conversation.")
        }
        contents.push({ role: 'model', parts: response.candidates[0].content.parts })
        contents.push({ role: 'user', parts: functionResponses })

        // Get final answer
        response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: contents,
          config: {
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
              includeThoughts: true
            },
            tools: tools
          }
        })
      }

      const analysisText = response.text
      console.log("🤖 Gemini raw response:", analysisText)

      if (!analysisText) {
        throw new Error("No final analysis text received from Gemini after tool calls")
      }

      const jsonString = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const analysis = JSON.parse(jsonString)

      console.log("✅ Emergency Cycle Complete:", analysis)

      return {
        status: "success",
        received: { audio: true, location: true },
        analysis,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error("❌ Error processing emergency signal:", error)
      return {
        status: "error",
        message: "Failed to process emergency signal",
        error: String(error),
        timestamp: new Date().toISOString()
      }
    }
  }, {
    body: t.Object({
      audio: t.File({
        description: "The emergency voice note audio file"
      }),
      latitude: t.String(),
      longitude: t.String()
    })
  })
  .listen(3000)

console.log(`🦊 resQ server running at ${app.server?.hostname}:${app.server?.port}`)

export default app
