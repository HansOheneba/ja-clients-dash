import { NextResponse } from "next/server";

import { searchMarketSymbols } from "@/lib/market/finnhub";
import {
  filterTrackableAssets,
  mergeTrackableAssets,
  type TrackableAsset,
} from "@/lib/market/trackable-assets";
import { getAdvisorApiSession } from "@/lib/wealth/session";

export async function GET(request: Request) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const listed = filterTrackableAssets(query);

  if (query.length < 2) {
    return NextResponse.json({ assets: listed satisfies TrackableAsset[] });
  }

  try {
    const found = await searchMarketSymbols(query);
    return NextResponse.json({ assets: mergeTrackableAssets(listed, found) });
  } catch {
    return NextResponse.json({
      assets: listed,
      warning: "Live symbol search is unavailable. Showing the trackable list only.",
    });
  }
}
