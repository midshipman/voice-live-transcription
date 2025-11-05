import { getWebSocketServer } from 'next-ws/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, _res: NextResponse) {
    const requestBody = await req.json();
    const wsServer = getWebSocketServer();
    const clients = wsServer.clients;
    console.log("voiceIntelligence Ready");
    console.log("voiceIntelligence payload:", JSON.stringify(requestBody));

    await Promise.all(
      Array.from(clients).map((client) =>
        client.send(
          JSON.stringify({
            event: "voiceIntelligenceSid",
            data: requestBody,
          })
        )
      )
    );
    return NextResponse.json({ success: true });
}

