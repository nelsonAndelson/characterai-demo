// Simulated Statsig experiments and feature flags
interface Experiment {
  name: string;
  variants: string[];
  weights: number[];
}

interface FeatureFlag {
  name: string;
  enabled: boolean;
  rules?: Record<string, any>;
}

// Demo experiments
const EXPERIMENTS: Experiment[] = [
  {
    name: "response_time_threshold",
    variants: ["control", "aggressive", "relaxed"],
    weights: [0.33, 0.33, 0.34],
  },
  {
    name: "error_handling_strategy",
    variants: ["default", "retry", "fallback"],
    weights: [0.4, 0.3, 0.3],
  },
];

// Demo feature flags
const FEATURE_FLAGS: FeatureFlag[] = [
  {
    name: "advanced_analytics",
    enabled: true,
  },
  {
    name: "error_tracking",
    enabled: true,
  },
];

// Get experiment variant for a user
export function getExperiment(experimentName: string, userId: string = 'demo-user') {
  const experiment = EXPERIMENTS.find(e => e.name === experimentName);
  if (!experiment) return { variant: 'control' };

  // Deterministic random selection based on userId and experiment
  const hash = hashCode(`${userId}-${experimentName}`);
  const normalizedHash = (hash % 100) / 100;

  let cumSum = 0;
  for (let i = 0; i < experiment.variants.length; i++) {
    cumSum += experiment.weights[i];
    if (normalizedHash < cumSum) {
      return { variant: experiment.variants[i] };
    }
  }

  return { variant: experiment.variants[0] };
}

// Check if feature flag is enabled
export function checkFeatureFlag(flagName: string): boolean {
  const flag = FEATURE_FLAGS.find(f => f.name === flagName);
  return flag?.enabled ?? false;
}

// Log event for experiment tracking
export function logEvent(eventName: string, value: number, metadata: Record<string, any> = {}) {
  console.log('Statsig Event:', {
    event: eventName,
    value,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
    },
  });
}

// Helper function to generate deterministic hash
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
} 