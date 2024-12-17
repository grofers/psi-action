const core = require("@actions/core");
const psi = require("psi");

const requiredMetrics = ["first-contentful-paint", "speed-index", "largest-contentful-paint", "interactive", "total-blocking-time", "cumulative-layout-shift"];
const run = async () => {
  try {
    const url = core.getInput("url") || "https://blinkit.com";
    if (!url) {
      core.setFailed("Url is required to run Page Speed Insights.");
      return;
    }

    const key = core.getInput('key');

    const threshold = Number(core.getInput("threshold")) || 70;
    const strategy = core.getInput("strategy") || "mobile";
    // Output a formatted report to the terminal
    console.log(`Running Page Speed Insights for ${url}`);
    const { data } = await psi(url, {
      ...(key ? {key} : undefined),
      ...(key ? undefined : {nokey: "true"}),
      strategy,
      format: "cli",
      threshold
    });
    core.setOutput("performance_metrics", data.lighthouseResult.categories.performance.auditRefs.filter(audit => requiredMetrics.includes(audit.id))?.map(audit => ({[audit.id]: audit.weight})));
    core.setOutput("performance_score", data.lighthouseResult.categories.performance.score);
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();
