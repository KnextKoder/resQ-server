import { db } from "./src/db";
import { responders } from "./src/db/schema";

async function seed() {
    console.log("🌱 Seeding responders...");

    await db.insert(responders).values([
        {
            name: "City Central Hospital",
            category: "MEDICAL",
            latitude: "7.5221675",
            longitude: "4.5371415",
            contactInfo: "emergency-medical@city.gov",
        },
        {
            name: "Main Fire Station",
            category: "FIRE",
            latitude: "7.5214925",
            longitude: "4.5371415",
            contactInfo: "+15550199",
        },
        {
            name: "Downtown Police Department",
            category: "POLICE",
            latitude: "7.5220000",
            longitude: "4.3000000",
            contactInfo: "911-dispatch@city.gov",
        }
    ]);

    console.log("✅ Seeding complete.");
}

seed().catch(console.error);
