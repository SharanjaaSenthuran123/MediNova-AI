/** Demo SOS triggers for hackathon presentations. */
export const emergencyScenarios = [
  {
    id: "standard",
    label: "Standard SOS",
    description: "5-second countdown, then full alert timeline",
    skipCountdown: false,
  },
  {
    id: "quick",
    label: "Quick demo",
    description: "Skip countdown — instant alert for judges",
    skipCountdown: true,
  },
] as const;
