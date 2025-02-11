import { getExperiment, checkFeatureFlag } from "@/lib/statsig-simulation";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const experimentName = searchParams.get("experiment");
  const flagName = searchParams.get("flag");
  const userId = searchParams.get("userId") || "demo-user";

  try {
    if (experimentName) {
      const variant = getExperiment(experimentName, userId);
      return NextResponse.json({ experiment: variant });
    }

    if (flagName) {
      const isEnabled = checkFeatureFlag(flagName);
      return NextResponse.json({
        flag: { name: flagName, enabled: isEnabled },
      });
    }

    // Return all active experiments and flags
    const experiments = [
      getExperiment("response_time_threshold", userId),
      getExperiment("error_handling_strategy", userId),
    ];

    const flags = [
      {
        name: "advanced_analytics",
        enabled: checkFeatureFlag("advanced_analytics"),
      },
      { name: "error_tracking", enabled: checkFeatureFlag("error_tracking") },
    ];

    return NextResponse.json({ experiments, flags });
  } catch (error) {
    console.error("Statsig simulation error:", error);
    return NextResponse.json(
      { error: "Failed to fetch experiments" },
      { status: 500 }
    );
  }
}
