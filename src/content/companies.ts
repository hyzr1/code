import type { Lesson, Problem } from "../types";

export type PreparationLevel = 1 | 2 | 3 | 4 | 5;

export interface CompanyTarget {
  id: string;
  name: string;
  domain: string;
  level: PreparationLevel;
}

export interface PreparationBand {
  level: PreparationLevel;
  label: string;
  shortLabel: string;
  detail: string;
  interviewTarget: string;
  systemsDepth: string;
  estimatedHours: number;
  accent: string;
}

export const PREPARATION_BANDS: PreparationBand[] = [
  {
    level: 5,
    label: "Frontier bar",
    shortLabel: "Frontier",
    detail: "Maximum interview depth, harder variants, and the strongest systems expectations.",
    interviewTarget: "180–220 carefully reviewed problems",
    systemsDepth: "Deep systems reasoning",
    estimatedHours: 180,
    accent: "#ef8ed2",
  },
  {
    level: 4,
    label: "Elite bar",
    shortLabel: "Elite",
    detail: "The full interview pattern set with strong speed, communication, and systems practice.",
    interviewTarget: "130–170 carefully reviewed problems",
    systemsDepth: "Full systems foundations",
    estimatedHours: 140,
    accent: "#aa8cff",
  },
  {
    level: 3,
    label: "Highly competitive",
    shortLabel: "Competitive",
    detail: "Broad data structures, common graph and DP patterns, and practical systems judgment.",
    interviewTarget: "90–120 carefully reviewed problems",
    systemsDepth: "Practical systems foundations",
    estimatedHours: 105,
    accent: "#6ca8ff",
  },
  {
    level: 2,
    label: "Strong general preparation",
    shortLabel: "Strong",
    detail: "The common interview structures and the production ideas most interns actually use.",
    interviewTarget: "55–80 carefully reviewed problems",
    systemsDepth: "Essential production reasoning",
    estimatedHours: 80,
    accent: "#55c8a5",
  },
  {
    level: 1,
    label: "Focused preparation",
    shortLabel: "Focused",
    detail: "A shorter route through high-frequency interview topics without weakening the Python core.",
    interviewTarget: "30–50 carefully reviewed problems",
    systemsDepth: "Core API boundaries",
    estimatedHours: 60,
    accent: "#e0ad5b",
  },
];

const company = (
  id: string,
  name: string,
  domain: string,
  level: PreparationLevel,
): CompanyTarget => ({ id, name, domain, level });

/**
 * Preparation bands are study defaults, not a judgment of employer quality or
 * a promise about one interview. Role, team, location, and year can move the
 * real bar substantially. Learners can switch targets without losing progress.
 */
export const COMPANY_TARGETS: CompanyTarget[] = [
  company("openai", "OpenAI", "openai.com", 5),
  company("anthropic", "Anthropic", "anthropic.com", 5),
  company("xai", "xAI", "x.ai", 5),
  company("deepmind", "Google DeepMind", "deepmind.google", 5),
  company("jane-street", "Jane Street", "janestreet.com", 5),
  company("hrt", "Hudson River Trading", "hudsonrivertrading.com", 5),
  company("citadel", "Citadel", "citadel.com", 5),
  company("citadel-securities", "Citadel Securities", "citadelsecurities.com", 5),
  company("two-sigma", "Two Sigma", "twosigma.com", 5),
  company("jump-trading", "Jump Trading", "jumptrading.com", 5),
  company("deshaw", "D. E. Shaw", "deshaw.com", 5),
  company("optiver", "Optiver", "optiver.com", 5),
  company("imc", "IMC Trading", "imc.com", 5),
  company("databricks", "Databricks", "databricks.com", 5),
  company("scale-ai", "Scale AI", "scale.com", 5),
  company("nvidia", "NVIDIA", "nvidia.com", 5),
  company("mistral", "Mistral AI", "mistral.ai", 5),
  company("perplexity", "Perplexity", "perplexity.ai", 5),
  company("waymo", "Waymo", "waymo.com", 5),
  company("anduril", "Anduril", "anduril.com", 5),
  company("cohere", "Cohere", "cohere.com", 5),
  company("hugging-face", "Hugging Face", "huggingface.co", 5),
  company("coreweave", "CoreWeave", "coreweave.com", 5),
  company("cerebras", "Cerebras", "cerebras.ai", 5),
  company("groq", "Groq", "groq.com", 5),
  company("together-ai", "Together AI", "together.ai", 5),
  company("lambda", "Lambda", "lambda.ai", 5),
  company("applied-intuition", "Applied Intuition", "applied.co", 5),
  company("mercor", "Mercor", "mercor.com", 5),
  company("thinking-machines", "Thinking Machines Lab", "thinkingmachines.ai", 5),
  company("spacex", "SpaceX", "spacex.com", 5),
  company("neuralink", "Neuralink", "neuralink.com", 5),
  company("zoox", "Zoox", "zoox.com", 5),
  company("nuro", "Nuro", "nuro.ai", 5),
  company("aurora", "Aurora", "aurora.tech", 5),
  company("tower-research", "Tower Research", "tower-research.com", 5),
  company("five-rings", "Five Rings", "fiverings.com", 5),
  company("sig", "Susquehanna International Group", "sig.com", 5),
  company("drw", "DRW", "drw.com", 5),
  company("akuna-capital", "Akuna Capital", "akunacapital.com", 5),

  company("google", "Google", "google.com", 4),
  company("meta", "Meta", "meta.com", 4),
  company("netflix", "Netflix", "netflix.com", 4),
  company("stripe", "Stripe", "stripe.com", 4),
  company("palantir", "Palantir", "palantir.com", 4),
  company("figma", "Figma", "figma.com", 4),
  company("airbnb", "Airbnb", "airbnb.com", 4),
  company("uber", "Uber", "uber.com", 4),
  company("snowflake", "Snowflake", "snowflake.com", 4),
  company("roblox", "Roblox", "roblox.com", 4),
  company("rippling", "Rippling", "rippling.com", 4),
  company("ramp", "Ramp", "ramp.com", 4),
  company("plaid", "Plaid", "plaid.com", 4),
  company("brex", "Brex", "brex.com", 4),
  company("cloudflare", "Cloudflare", "cloudflare.com", 4),
  company("discord", "Discord", "discord.com", 4),
  company("pinterest", "Pinterest", "pinterest.com", 4),
  company("dropbox", "Dropbox", "dropbox.com", 4),
  company("datadog", "Datadog", "datadoghq.com", 4),
  company("samsara", "Samsara", "samsara.com", 4),
  company("bytedance", "ByteDance", "bytedance.com", 4),
  company("tiktok", "TikTok", "tiktok.com", 4),
  company("amazon", "Amazon", "amazon.com", 4),
  company("spotify", "Spotify", "spotify.com", 4),
  company("bloomberg", "Bloomberg", "bloomberg.com", 4),
  company("robinhood", "Robinhood", "robinhood.com", 4),
  company("instacart", "Instacart", "instacart.com", 4),
  company("chime", "Chime", "chime.com", 4),
  company("cursor", "Cursor", "cursor.com", 4),
  company("vercel", "Vercel", "vercel.com", 4),
  company("linear", "Linear", "linear.app", 4),
  company("airtable", "Airtable", "airtable.com", 4),
  company("canva", "Canva", "canva.com", 4),
  company("duolingo", "Duolingo", "duolingo.com", 4),
  company("riot-games", "Riot Games", "riotgames.com", 4),
  company("epic-games", "Epic Games", "epicgames.com", 4),
  company("valve", "Valve", "valvesoftware.com", 4),
  company("cockroach-labs", "Cockroach Labs", "cockroachlabs.com", 4),
  company("hashicorp", "HashiCorp", "hashicorp.com", 4),
  company("gitlab", "GitLab", "gitlab.com", 4),

  company("apple", "Apple", "apple.com", 3),
  company("microsoft", "Microsoft", "microsoft.com", 3),
  company("linkedin", "LinkedIn", "linkedin.com", 3),
  company("doordash", "DoorDash", "doordash.com", 3),
  company("coinbase", "Coinbase", "coinbase.com", 3),
  company("reddit", "Reddit", "reddit.com", 3),
  company("snap", "Snap", "snap.com", 2),
  company("lyft", "Lyft", "lyft.com", 2),
  company("asana", "Asana", "asana.com", 2),
  company("notion", "Notion", "notion.so", 2),
  company("mongodb", "MongoDB", "mongodb.com", 3),
  company("confluent", "Confluent", "confluent.io", 3),
  company("elastic", "Elastic", "elastic.co", 3),
  company("twilio", "Twilio", "twilio.com", 3),
  company("github", "GitHub", "github.com", 3),
  company("atlassian", "Atlassian", "atlassian.com", 3),
  company("shopify", "Shopify", "shopify.com", 3),
  company("hubspot", "HubSpot", "hubspot.com", 3),
  company("okta", "Okta", "okta.com", 3),
  company("zoom", "Zoom", "zoom.us", 3),
  company("paypal", "PayPal", "paypal.com", 3),
  company("servicenow", "ServiceNow", "servicenow.com", 3),
  company("splunk", "Splunk", "splunk.com", 3),
  company("workday", "Workday", "workday.com", 3),
  company("twitch", "Twitch", "twitch.tv", 3),
  company("slack", "Slack", "slack.com", 3),
  company("electronic-arts", "Electronic Arts", "ea.com", 3),
  company("unity", "Unity", "unity.com", 3),
  company("zapier", "Zapier", "zapier.com", 3),
  company("automattic", "Automattic", "automattic.com", 3),
  company("webflow", "Webflow", "webflow.com", 3),
  company("replit", "Replit", "replit.com", 3),
  company("grammarly", "Grammarly", "grammarly.com", 3),
  company("postman", "Postman", "postman.com", 3),
  company("sentry", "Sentry", "sentry.io", 3),
  company("pagerduty", "PagerDuty", "pagerduty.com", 3),
  company("digitalocean", "DigitalOcean", "digitalocean.com", 3),
  company("new-relic", "New Relic", "newrelic.com", 3),
  company("fastly", "Fastly", "fastly.com", 3),
  company("akamai", "Akamai", "akamai.com", 3),
  company("crowdstrike", "CrowdStrike", "crowdstrike.com", 3),
  company("palo-alto-networks", "Palo Alto Networks", "paloaltonetworks.com", 3),
  company("wiz", "Wiz", "wiz.io", 3),
  company("sentinelone", "SentinelOne", "sentinelone.com", 3),

  company("salesforce", "Salesforce", "salesforce.com", 2),
  company("adobe", "Adobe", "adobe.com", 2),
  company("block", "Block", "block.xyz", 2),
  company("intuit", "Intuit", "intuit.com", 2),
  company("oracle", "Oracle", "oracle.com", 2),
  company("ibm", "IBM", "ibm.com", 2),
  company("cisco", "Cisco", "cisco.com", 2),
  company("dell", "Dell", "dell.com", 2),
  company("hp", "HP", "hp.com", 2),
  company("ebay", "eBay", "ebay.com", 2),
  company("expedia", "Expedia", "expediagroup.com", 2),
  company("zillow", "Zillow", "zillow.com", 2),
  company("autodesk", "Autodesk", "autodesk.com", 2),
  company("docusign", "DocuSign", "docusign.com", 2),
  company("box", "Box", "box.com", 2),
  company("yelp", "Yelp", "yelp.com", 2),
  company("toast", "Toast", "toasttab.com", 2),
  company("klaviyo", "Klaviyo", "klaviyo.com", 2),
  company("smartsheet", "Smartsheet", "smartsheet.com", 2),
  company("qualtrics", "Qualtrics", "qualtrics.com", 2),
  company("uipath", "UiPath", "uipath.com", 2),
  company("squarespace", "Squarespace", "squarespace.com", 2),
  company("wix", "Wix", "wix.com", 2),
  company("godaddy", "GoDaddy", "godaddy.com", 2),
  company("zendesk", "Zendesk", "zendesk.com", 2),
  company("surveymonkey", "SurveyMonkey", "surveymonkey.com", 2),
  company("chewy", "Chewy", "chewy.com", 2),
  company("wayfair", "Wayfair", "wayfair.com", 2),
  company("etsy", "Etsy", "etsy.com", 2),
  company("groupon", "Groupon", "groupon.com", 2),
  company("indeed", "Indeed", "indeed.com", 2),
  company("glassdoor", "Glassdoor", "glassdoor.com", 2),
  company("roku", "Roku", "roku.com", 2),
  company("sonos", "Sonos", "sonos.com", 2),
  company("peloton", "Peloton", "onepeloton.com", 2),
  company("carvana", "Carvana", "carvana.com", 2),

  company("capital-one", "Capital One", "capitalone.com", 1),
  company("jpmorgan", "JPMorgan Chase", "jpmorganchase.com", 1),
  company("goldman-sachs", "Goldman Sachs", "goldmansachs.com", 1),
  company("morgan-stanley", "Morgan Stanley", "morganstanley.com", 1),
  company("amex", "American Express", "americanexpress.com", 1),
  company("walmart", "Walmart Global Tech", "tech.walmart.com", 1),
  company("target", "Target", "target.com", 1),
  company("home-depot", "Home Depot", "homedepot.com", 1),
  company("lowes", "Lowe's", "lowes.com", 1),
  company("gm", "General Motors", "gm.com", 1),
  company("ford", "Ford", "ford.com", 1),
  company("boeing", "Boeing", "boeing.com", 1),
  company("lockheed", "Lockheed Martin", "lockheedmartin.com", 1),
  company("northrop", "Northrop Grumman", "northropgrumman.com", 1),
  company("accenture", "Accenture", "accenture.com", 1),
  company("deloitte", "Deloitte", "deloitte.com", 1),
  company("pwc", "PwC", "pwc.com", 1),
  company("ey", "EY", "ey.com", 1),
  company("kpmg", "KPMG", "kpmg.com", 1),
  company("epic", "Epic Systems", "epic.com", 1),
  company("visa", "Visa", "visa.com", 1),
  company("mastercard", "Mastercard", "mastercard.com", 1),
  company("bank-of-america", "Bank of America", "bankofamerica.com", 1),
  company("wells-fargo", "Wells Fargo", "wellsfargo.com", 1),
  company("citi", "Citi", "citi.com", 1),
  company("fidelity", "Fidelity", "fidelity.com", 1),
  company("charles-schwab", "Charles Schwab", "schwab.com", 1),
  company("vanguard", "Vanguard", "vanguard.com", 1),
  company("state-farm", "State Farm", "statefarm.com", 1),
  company("progressive", "Progressive", "progressive.com", 1),
  company("geico", "GEICO", "geico.com", 1),
  company("liberty-mutual", "Liberty Mutual", "libertymutual.com", 1),
  company("nationwide", "Nationwide", "nationwide.com", 1),
  company("cvs-health", "CVS Health", "cvshealth.com", 1),
  company("unitedhealth", "UnitedHealth Group", "unitedhealthgroup.com", 1),
  company("costco", "Costco", "costco.com", 1),
  company("kroger", "Kroger", "kroger.com", 1),
  company("fedex", "FedEx", "fedex.com", 1),
  company("ups", "UPS", "ups.com", 1),
  company("delta", "Delta Air Lines", "delta.com", 1),
];

export const COMPANY_BY_ID = new Map(COMPANY_TARGETS.map((item) => [item.id, item]));
export const BAND_BY_LEVEL = new Map(PREPARATION_BANDS.map((item) => [item.level, item]));

const LEVEL_BY_LESSON: Record<string, PreparationLevel> = {
  "py.lesson.prefix-sums": 2,
  "py.lesson.monotonic-stack": 3,
  "py.lesson.heap": 2,
  "py.lesson.trees": 2,
  "py.lesson.graphs": 2,
  "py.lesson.topological-sort": 3,
  "py.lesson.union-find": 4,
  "py.lesson.shortest-paths": 3,
  "py.lesson.dynamic-programming": 3,
  "py.lesson.grid-dp": 4,
  "py.lesson.backtracking": 4,
  "py.lesson.idempotency": 2,
  "py.lesson.cache-reasoning": 3,
  "py.lesson.capacity-estimation": 4,
};

/** Every practical Python lesson stays in every path. Only interview and
 * systems depth changes with the target. */
export function minimumPreparationLevel(lesson: Lesson): PreparationLevel {
  if (/^py\.m(?:[0-7])$/.test(lesson.moduleId)) return 1;
  return LEVEL_BY_LESSON[lesson.id] ?? 1;
}

export function targetFor(id: string | undefined): CompanyTarget {
  return COMPANY_BY_ID.get(id ?? "") ?? COMPANY_BY_ID.get("google")!;
}

export function bandForTarget(id: string | undefined): PreparationBand {
  return BAND_BY_LEVEL.get(targetFor(id).level)!;
}

const MAX_PROBLEM_DIFFICULTY: Record<PreparationLevel, number> = {
  1: 2.6,
  2: 3.2,
  3: 3.8,
  4: 4.5,
  5: 5,
};

/** A company target changes the practice pool as well as the lecture path.
 * Difficulty is averaged across concept, implementation, and cold recall. */
export function problemFitsPreparation(problem: Problem, level: PreparationLevel): boolean {
  const average = (
    problem.difficulty.concept +
    problem.difficulty.implementation +
    problem.difficulty.recall
  ) / 3;
  if (level < 4 && problem.tier === "challenge") return false;
  return average <= MAX_PROBLEM_DIFFICULTY[level];
}
