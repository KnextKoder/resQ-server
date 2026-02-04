import { Elysia, t } from "elysia"
import { cors } from "@elysiajs/cors"

const app = new Elysia()
  .use(cors())
  .get('/', () => {
    console.log('hello babeee')
  })

  .post("/emergency", async ({ body }) => {
    const { audio } = body

    console.log("Received a request on /emergency route")

    if (audio) {
      console.log("Audio file received:")
      console.log("- Name:", audio.name)
      console.log("- Size:", audio.size, "bytes")
      console.log("- Type:", audio.type)

      // Here you can process the audio with Gemini
      const buffer = await audio.arrayBuffer()
      console.log("Audio buffer:", buffer.slice(0, 17))
      // await useGemini(buffer)
    } else {
      console.log("No audio file found in the request body")
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
      })
    })
  })
  .listen(3000)

console.log("🦊 Elysia is running baby")

export default app
