# Portfolio assistant production architecture

The current website build uses a deterministic, client-side knowledge index. It contains no model call, secret, or production API route. This keeps the first interaction prototype safe and makes every answer directly reviewable.

## Proposed production stack

- Keep the existing portfolio on its current static hosting path.
- Add one small Cloudflare Worker endpoint for `POST /portfolio-agent`.
- Store the OpenAI API key only as a Worker secret.
- Bundle an approved portfolio knowledge document with the Worker deployment. Do not let the public request select arbitrary URLs or tools.
- Send a narrow system instruction, the approved excerpts, page context, and the visitor question to the model.
- Return a structured response containing `answer`, `sources`, `relatedProject`, and `insufficientEvidence`.
- Restrict CORS to the production portfolio origin and the local preview origin used during development.

This Worker is a proposal only. It is not implemented or deployed in this branch.

## Request and abuse controls

- Accept JSON only and cap the question at 500 characters.
- Reject unexpected fields and malformed content.
- Rate limit by a privacy-preserving IP hash, with a small burst allowance and a conservative daily limit.
- Cap model input and output tokens. A portfolio answer should usually fit within 150-250 output tokens.
- Set a short upstream timeout and return a plain grounded-error state when the model is unavailable.
- Keep tools disabled. The model does not need code execution, browsing, file access, or arbitrary retrieval.
- Treat user instructions as untrusted content. The system instruction must say that visitors cannot replace the grounding policy or request hidden instructions.
- Require every substantive claim to map to one of the supplied source identifiers.
- If evidence is missing or source validation fails, return `insufficientEvidence: true` instead of an unsupported answer.
- Log only operational metadata needed for reliability. Do not retain full visitor questions by default.

## Expected API and cost behavior

- One visitor submission creates one model request. There is no autonomous loop and no background generation.
- Cache normalized common questions such as education, tools, and project recommendations at the Worker edge.
- Keep the approved knowledge compact and retrieve only the most relevant excerpts before each request.
- Use a small text model that supports structured output. Select the exact model only after reviewing the current official pricing and quality tradeoffs.
- Enforce a hard daily request ceiling in the Worker so public traffic cannot create unbounded spend.
- Track request count, cache-hit rate, input tokens, output tokens, blocked requests, and insufficient-evidence responses.

The cost envelope is therefore controlled by four explicit limits: requests per visitor, total requests per day, retrieved context size, and output-token cap. Exact dollar estimates should be calculated from the current official model price immediately before the production route is approved.

## Suggested response contract

```json
{
  "answer": "Jason's Funfetti case study shows...",
  "sources": [
    {"id": "funfetti-insight", "label": "Funfetti case study", "href": "/funfetti-events-case-study.html#insight-title"}
  ],
  "relatedProject": {"label": "View Funfetti", "href": "/funfetti-events-case-study.html"},
  "insufficientEvidence": false
}
```

The Worker must validate this structure before returning it to the browser. The frontend should render strings through text nodes rather than injecting model-produced HTML.
