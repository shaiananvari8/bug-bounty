import fs from "node:fs";
import path from "node:path";

const rootInput = process.env.RUNX_INPUT_ARTIFACT_ROOT;

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(64);
}

if (!rootInput) {
  fail("artifact_root input is required");
}

const root = path.resolve(process.cwd(), rootInput);
const guidePath = path.join(root, "claim-verification.md");
const evidencePath = path.join(root, "evidence.json");
const reportPath = path.join(root, "report.md");

for (const filePath of [guidePath, evidencePath, reportPath]) {
  if (!fs.existsSync(filePath)) {
    fail(`missing artifact: ${filePath}`);
  }
}

const guide = fs.readFileSync(guidePath, "utf8");
const report = fs.readFileSync(reportPath, "utf8");
const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));

const requiredGuideSnippets = [
  "https://gofrantic.com/v1/bounties/39",
  "https://gofrantic.com/v1/claims",
  "https://gofrantic.com/v1/deliveries/preflight",
  "https://gofrantic.com/v1/deliveries",
  "docs/claim-verification.md",
  "public_url",
  "evidence_json",
  "receipt_ref",
  "report",
  "Correct delivery shape",
  "Common wrong delivery shape",
  "Machine verification does not decide everything"
];

const missingSnippets = requiredGuideSnippets.filter((snippet) => !guide.includes(snippet));
if (missingSnippets.length > 0) {
  fail(`guide is missing required snippets: ${missingSnippets.join(", ")}`);
}

if (evidence.runx?.version_output !== "runx-cli 0.6.8") {
  fail("evidence_json does not include the exact runx 0.6.8 version output");
}

if (!Array.isArray(evidence.observations) || evidence.observations.length < 6) {
  fail("evidence_json must include at least six observations");
}

const observationKinds = new Set(evidence.observations.map((observation) => observation.kind));
for (const kind of ["api_source", "lifecycle_steps", "artifact_binding", "review_boundary"]) {
  if (!observationKinds.has(kind)) {
    fail(`evidence_json missing observation kind: ${kind}`);
  }
}

const reportBullets = report.split(/\r?\n/).filter((line) => line.startsWith("- "));
if (reportBullets.length < 6) {
  fail("report must include at least six concrete bullet points");
}

const result = {
  status: "pass",
  bounty: 39,
  checked_files: [
    path.relative(process.cwd(), guidePath),
    path.relative(process.cwd(), evidencePath),
    path.relative(process.cwd(), reportPath)
  ],
  guide_required_snippets: requiredGuideSnippets.length,
  evidence_observations: evidence.observations.length,
  report_bullets: reportBullets.length,
  runx_version: evidence.runx.version_output
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
