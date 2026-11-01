# Optional Cerebras LLM stack

The project can run its two Bolna graph agents with Cerebras for both response generation and graph routing. The default remains `sarvam`. This is a deployment-level choice through `VOICE_STACK`, not a choice exposed to callers.

## Architecture

```text
Phone call → Bolna Graph Agent → Sarvam speech recognition → Cerebras LLM → Sarvam speech synthesis
                                      │
                                      └── tools → Asli hai? backend → deterministic family verdict
```

The Cerebras stack keeps Bolna, telephony, Sarvam's multilingual STT/TTS, and the backend safety rules. Only the LLM changes. The backend continues to decide `child_safe`, `child_confirmed`, or `not_confirmed`; Cerebras cannot set or override a verdict except by requesting the existing tool, whose input the backend validates.

Bolna currently integrates Cerebras as a registered custom OpenAI-compatible LLM. Its custom-model setup stores the provider key encrypted in Bolna. The repository therefore contains the endpoint, model ID, and family only; **do not put a Cerebras API key in `.env`, agent JSON, or source control**. See [Bolna's custom LLM guide](https://www.bolna.ai/docs/custom-llm-inference) and [Cerebras integration notes](https://www.bolna.ai/integrations/cerebras).

Enabling this option sends call transcripts and tool context to the Cerebras endpoint through Bolna. In particular, the family member's spoken verification word is part of the check agent's conversation, even though the backend stores only its keyed hash. Review the provider's data handling and your consent requirements before enabling this stack for live families.

## Enable it

1. In Cerebras Cloud, create an API key and confirm the model is available for your account. The configured shared-inference model is `gpt-oss-120b`.
2. In Bolna, open **Settings → Integrations → LLM → Custom LLM → Add model** (or add a custom model from an agent). Choose the Cerebras preset and configure:

   | Field | Value |
   | --- | --- |
   | Model name | `gpt-oss-120b` |
   | Endpoint URL | `https://api.cerebras.ai/v1` |
   | API key | Your Cerebras key, entered only in Bolna |
   | Family | `gpt-oss` |

3. Create only the two Cerebras agents:

   ```bash
   python scripts/push_agents.py parent.cerebras check.cerebras
   ```

   The generated agent definitions use Bolna's `custom` provider and `gpt-oss-120b` for both graph routing and conversation turns. Agent IDs are written to `.env` as `AGENT_ID_PARENT_CEREBRAS` and `AGENT_ID_CHECK_CEREBRAS`.
4. Set these values in the backend environment and restart/redeploy it:

   ```dotenv
   VOICE_STACK=cerebras
   AGENT_ID_PARENT_CEREBRAS=<id from Bolna>
   AGENT_ID_CHECK_CEREBRAS=<id from Bolna>
   ```

   For Render, set the same variables in the service environment. `VOICE_STACK=sarvam` remains the default for existing deployments.

## Validation before live calls

Bolna's custom model path needs streaming chat completions and, for these graph agents, streamed tool calls. Bolna notes that tool-call support varies by model and provider. Before using real families, test both agents with Bolna's web-call/test tools, including a complete family-verification call that invokes `report_verdict`. Confirm a caller receives a reply, graph routing works, streamed tool calls complete, and the backend produces the same deterministic verdicts as with Sarvam. Measure first-token latency and check Cerebras request/token limits against concurrent parent and family calls.

There is no automatic provider failover: if Cerebras is unavailable or rate-limited, its agent may not reply. Keep the Sarvam agent IDs configured so the operator can switch `VOICE_STACK` back to `sarvam` and redeploy. Never make LLM availability or output a condition for returning a safe verdict; timeouts and incomplete checks must continue to resolve to `not_confirmed` under the existing backend rules.

Bolna setup references: [custom LLM API and configuration](https://www.bolna.ai/docs/custom-llm-inference), [Cerebras provider preset and endpoint](https://www.bolna.ai/integrations/cerebras). Cerebras confirms streaming Chat Completions and tool calls in its [inference documentation](https://inference-docs.cerebras.ai/).
