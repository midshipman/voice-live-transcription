import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH_TOKEN as string;
const client = twilio(accountSid, authToken);

export async function POST(req: NextRequest) {
  try {
    const { code, to: overrideTo, scenario: overrideScenario } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    const syncServiceSid = process.env.TWILIO_SYNC_SERVICE_SID!;
    const syncMapSid = process.env.NEXT_PUBLIC_CALLS_MAP_SID!;

    // Read call info from Sync Map using code
    let to: string | undefined = overrideTo;
    let scenario: string | undefined = overrideScenario;

    if (!to || !scenario) {
      try {
        const { data: callInfo } = await client.sync.v1
          .services(syncServiceSid)
          .syncMaps(syncMapSid)
          .syncMapItems(code)
          .fetch();
        to = to || (callInfo?.participant?.number as string);
        scenario = scenario || (callInfo?.scenario as string);
      } catch (err) {
        // If Sync Map read fails, continue only if overrideTo provided
        if (!overrideTo) {
          throw err;
        }
      }
    }

    const from = process.env.TWILIO_PHONE_NUMBER as string;
    if (!to) {
      return NextResponse.json({ error: "Missing destination number" }, { status: 400 });
    }

    // Map scenario to Assistant ID
    const retailAssistantId = process.env.RETAIL_ASSISTANT_ID as string;
    const estatesAssistantId = process.env.ESTATES_ASSISTANT_ID as string;
    const healthcareAssistantId = process.env.HEALTHCARE_ASSISTANT_ID as string;

    let assistantId = retailAssistantId;
    switch ((scenario || "retail").toLowerCase()) {
      case "retail":
        assistantId = retailAssistantId;
        break;
      case "estates":
        assistantId = estatesAssistantId;
        break;
      case "health":
      case "healthcare":
        assistantId = healthcareAssistantId;
        break;
    }

    const baseUrl = process.env.NODE_ENV === "production" ? process.env.APP_URL! : process.env.BASE_URL!;
    const url = `${baseUrl}/api/boothTwiml?code=${code}&assistant=${assistantId}&scenario=${(scenario || "retail").toLowerCase()}`;

    await client.calls.create({ to, from, url });

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error in POST /startCodeCall:", errorMessage);
    return new Response(errorMessage, { status: 500 });
  }
}