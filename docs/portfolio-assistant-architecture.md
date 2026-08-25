# Portfolio assistant production architecture

The assistant now uses a hybrid design. The browser keeps the existing deterministic knowledge index as a zero-cost fallback, while `POST /api/portfolio-assistant` can use OpenAI to understand flexible questions and write a natural answer from the same approved material.

## Implemented stack

- `portfolio-assistant.js` calls the server endpoint without receiving or exposing an API key.
- `api/portfolio-assistant.js` is a Vercel-compatible Node serverless function. It can also be adapted to another server runtime without changing the response contract.
- `OPENAI_API_KEY` remains server-side. Local development stores it in the ignored `.env.local` file; production must use the hosting provider's encrypted environment settings.
- The server bundles `data/portfolio-assistant-knowledge.json`. Visitors cannot select arbitrary URLs, upload files, enable tools, or provide new source material.
- The OpenAI request uses Structured Outputs and returns approved source identifiers. The server resolves those identifiers back to its own labels, links, and project metadata before responding to the browser.
- The model response is not rendered as HTML. The frontend uses text nodes and server-validated portfolio links.
- CORS defaults to `jasontello.com`, `www.jasontello.com`, and the documented local preview origin. Additional exact origins can be supplied through `PORTFOLIO_ALLOWED_ORIGINS`.
- If the server is missing, unavailable, blocked, or rate-limited, the frontend quietly returns the existing local answer instead.

The default browser endpoint is `/api/portfolio-assistant`. If the static portfolio and API are hosted separately, define `window.PORTFOLIO_ASSISTANT_API_URL` before loading `portfolio-assistant.js`, or add a `portfolio-assistant-endpoint` meta tag containing the HTTPS endpoint.

## Request and abuse controls

- Accept JSON only and cap the question at 500 characters.
- Reject unexpected fields and malformed content.
- Rate limit by privacy-preserving IP and session hashes: five requests per visitor per hour, twenty per IP per day, and one hundred total per server instance per day.
- Cap questions at 500 characters, request bodies at 4 KB, upstream time at 12 seconds, and model output at 350 tokens.
- Set a short upstream timeout and return a plain grounded-error state when the model is unavailable.
- Keep tools disabled. The model does not need code execution, browsing, file access, or arbitrary retrieval.
- Treat user instructions as untrusted content. The system instruction must say that visitors cannot replace the grounding policy or request hidden instructions.
- Require every grounded answer to map to one to three approved knowledge-entry identifiers.
- If evidence is missing or source validation fails, return `insufficientEvidence: true` instead of an unsupported answer.
- Log only operational metadata needed for reliability. Do not retain full visitor questions by default.

## Expected API and cost behavior

- One visitor submission creates one model request. There is no autonomous loop and no background generation.
- Cache normalized questions for one hour inside a warm server instance.
- Use `gpt-5.4-mini` by default, with `OPENAI_MODEL` available as a deployment override.
- Keep `store: false`, omit all tools, and send a privacy-preserving `safety_identifier`.
- Enforce conservative application request ceilings. Because in-memory counters are per server instance, production should also enable a hosting-level rate limit if the site receives meaningful traffic.
- Use a dedicated OpenAI project with a $2 monthly hard spend limit and a $0.50 alert. Those account controls must be configured in OpenAI Platform; they are intentionally not stored in repository code.

The cost envelope is therefore controlled by four explicit limits: requests per visitor, total requests per day, retrieved context size, and output-token cap. Exact dollar estimates should be calculated from the current official model price immediately before the production route is approved.

## Suggested response contract

```json
{
  "answer": "I treated the Funfetti homepage like a decision path...",
  "sources": [
    {"label": "Funfetti case study", "href": "./funfetti-events-case-study.html#insight-title"}
  ],
  "project": {"label": "View Funfetti", "href": "./funfetti-events-case-study.html"},
  "insufficientEvidence": false
}
```

The server validates the model's structured result, resolves sources from the local allowlist, and returns only the browser-facing fields above. The browser never accepts model-produced HTML or arbitrary source URLs.
