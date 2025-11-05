import { NextRequest, NextResponse } from 'next/server';
import { twiml, Twilio } from 'twilio';

const { VoiceResponse } = twiml;
const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// 统一处理逻辑，GET/POST 都走这里，保证 Twilio 请求方式兼容
async function handleTwiml(req: NextRequest) {
  try {
    const baseUrl = process.env.NODE_ENV === 'production' ? process.env.APP_URL! : process.env.BASE_URL!;
    const url = new URL(req.url!, baseUrl);

    const assistantId = (url.searchParams.get("assistant") || "") as string;
    let code = (url.searchParams.get("code") || "") as string;
    const scenario = (url.searchParams.get("scenario") || "retail") as string;
    const fallbackFirstName = url.searchParams.get("firstName") || "John";
    const fallbackEmail = url.searchParams.get("email") || "john@example.com";

    // 兜底处理 code，避免 Sync API 报错
    if (!code || code.trim().length === 0) {
      code = "0000";
    }

    // 拉取 Sync Map 项，失败时兜底使用查询参数
    let callInfo: any = { participant: { firstName: fallbackFirstName, email: fallbackEmail } };
    try {
      const syncServiceSid = process.env.TWILIO_SYNC_SERVICE_SID!;
      const mapSid = process.env.NEXT_PUBLIC_CALLS_MAP_SID!;
      const { data } = await client.sync.v1
        .services(syncServiceSid)
        .syncMaps(mapSid)
        .syncMapItems(code)
        .fetch();
      if (data) {
        callInfo = data;
      }
    } catch (err) {
      console.warn("Sync Map fetch failed, using fallback identity:", err);
    }

    const response = new VoiceResponse();

    // 启用实时转录
    const start = response.start();
    start.transcription({
      intelligenceService: process.env.VOICE_INTELLIGENCE_SERVICE_SID,
      inboundTrackLabel: 'Customer',
      outboundTrackLabel: 'Agent',
      languageCode: 'en-GB',
    });

    // 开场欢迎语，优先取 Sync Map，否则使用 fallback
    const openingMessage = `Hello ${callInfo?.participant?.firstName || fallbackFirstName}, This is hoot and drive, can I talk with you about your dream car?`;

    const connect = response.connect({});
    const assistant = connect.assistant({
      id: assistantId,
      welcomeGreeting: openingMessage,
      transcriptionProvider: 'deepgram',
      voice: process.env.VOICE_ID,
      ttsProvider: 'Elevenlabs',
      speechModel: 'nova-2-general',
    });

    // 助理参数，identity 兜底为 fallbackEmail；sessionId 为 code
    assistant.parameter({ name: 'identity', value: `email:${callInfo?.participant?.email || fallbackEmail}` });
    assistant.parameter({ name: 'sessionId', value: code });

    return new Response(response.toString(), { status: 200, headers: { 'content-type': 'text/xml' } });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error in /boothTwiml:', errorMessage);
    return new Response('Something went wrong', { status: 500 });
  }
}

// 支持 Twilio 的 GET/POST 访问方式
export async function GET(req: NextRequest, _res: NextResponse) {
  return handleTwiml(req);
}

export async function POST(req: NextRequest, _res: NextResponse) {
  return handleTwiml(req);
}

