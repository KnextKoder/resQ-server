import { Elysia, t } from "elysia"
import { cors } from "@elysiajs/cors"

const app = new Elysia()
  .use(cors())
  .get('/', () => {
    console.log("🦊 Elysia is running baby")
  })

  .post("/emergency", async ({ body }) => {
    const { audio, latitude, longitude } = body

    console.log("Received a request on /emergency route")

    if (audio) {
      console.log("Audio file received:")
      console.log("- Name:", audio.name)
      console.log("- Size:", audio.size, "bytes")
      console.log("- Type:", audio.type)
    }
    
    if (latitude && longitude) {
      console.log("Location received:")
      console.log("- Latitude:", latitude)
      console.log("- Longitude:", longitude)
      console.log("- Google Maps Link: https://www.google.com/maps?q=" + latitude + "," + longitude)
      
      // Here you can process the audio with Gemini
      const buffer = await audio.arrayBuffer()
      // await useGemini(buffer)
    } else {
      console.log("No location data received")
    }

    return {
      status: "success",
      received: !!audio,
      timestamp: new Date().toISOString()
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

console.log("🦊 Elysia is running baby")

export default app
