# Asli hai?

One tap before a parent pays. A voice agent calls the real family member, checks the family word, and tells the parent "safe, don't pay" while they wait on the line.

[![The parent presses the one button, and Saathi and her son are called at the same moment](media/asli-hai-teaser.gif)](media/asli-hai-demo.mp4)

**[Watch the demo film](media/asli-hai-demo.mp4)** (3 min 49 s, narrated). It shows the real screens, both calls side by side with what the backend does at each step, and every accessibility setting.

**Try the demo**

- Open [`web/index.html`](web/index.html) for the simulator, which plays a whole check in any of the 12 languages.
- Open [`web/tap.html?demo=1`](web/tap.html?demo=1) to try the parent's button without placing a call.
- To get real calls on your own phones, follow [Run it on your own Bolna account](#run-it-on-your-own-bolna-account). It takes about 15 minutes. On a Bolna trial account, verify both phone numbers first; see [Troubleshooting](#troubleshooting).

## The problem

Parents over 55 whose children live in another city get calls like "Papa, accident ho gaya, paise bhejo" or "CBI se bol raha hoon". The scam works in the two minutes between that call and the transfer. Asli hai? is built for those two minutes.

## How it works

Two Bolna graph agents and a small backend. One press starts two calls at once: Saathi calls the parent, and a rescue call goes to the first family contact. The parent doesn't have to hang up on the scammer first, and someone they trust hears about it straight away.

```mermaid
sequenceDiagram
    participant P as Parent
    participant S as Saathi (parent line)
    participant B as Backend
    participant C as Family check
    participant F as Family member
    P->>B: taps the button
    par two calls at once
        B->>S: call the parent
        S->>P: "Take your time and tell me, what happened?"
    and
        B->>C: rescue call to the first contact
        C->>F: "Sunita ji just pressed the button. Please stay on the line."
    end
    S->>B: start_verification (who, how much)
    B->>C: story event into the rescue call
    C->>F: "Did you just call asking for money?"
    F->>C: "No" (or "Yes" plus the family word)
    C->>B: report_verdict
    B->>S: verdict event into the live call
    S->>P: "Woh call nakli tha. Koi paisa mat dijiye."
    C->>F: "Please give them a call yourself too."
```

1. The parent taps `tap.html`. The backend calls them with Saathi, the parent-line agent. At the same moment it places a rescue call to the first family contact, who hears that the parent pressed the button and is asked to stay on the line.
2. Saathi lets the parent tell it in their own words. She acknowledges what she heard and asks one short question at a time, only about what's still missing: who called, what they asked for, how much, and whether anything went.
3. For a family claim, Saathi calls `start_verification`, and the backend pushes the story into the rescue call as a Bolna event.
   - If the caller claimed to be that contact, they're checked right there on the same call.
   - If the caller claimed to be someone else, the rescue contact hears what happened. Once that call ends, the claimed person gets the check call, so two family calls never overlap.
4. The family member is asked one yes/no question. "No" settles it. "Yes" unlocks money, so it also needs the family word.
5. The backend decides the verdict and fires it into the parent's live call as a Bolna event. A static node plays it in about 50 ms. The family member is asked to call the parent themselves too.
6. Police, CBI, TRAI, courier or bank claims get a fixed message: there is no such thing as a "digital arrest", hang up, don't pay. If money already went, Saathi reads out 1930, the cybercrime helpline. The rescue call tells the family either way, and it also tells them if the parent couldn't take Saathi's call or hung up early.
7. After the verdict Saathi keeps listening. She answers questions, can call the family once more if they couldn't be reached, and only says goodbye when the parent is done.
8. The family gets a WhatsApp summary of what happened.

## Safety by design

- **Fixed verdict wording.** Every line that must never vary is a static node, so the LLM never improvises a verdict.
- **Official-source web search.** When a caller claims to represent an authority, bank or service, Saathi can use Exa to search official Indian sources and share relevant context with a citation. Names, phone numbers and long numeric identifiers are removed before a query is sent. Search is informational only and cannot verify a caller or change the family-check verdict. Exa sponsors this project.
- **The stored family word never reaches an LLM.** It's kept only as a keyed hash (`WORD_KEY`, or `TOOL_SECRET` when that's unset), it isn't in any prompt or log line, and only `backend/verdict.py` compares it, in English letters or the family's own script, after lowercasing and stripping spaces and punctuation. The family member's spoken answer does go through speech-to-text and the check agent before it reaches the backend.
- **Three verdict rules:**
  - "No, I didn't call" → `child_safe`.
  - "Yes" plus the right family word → `child_confirmed`.
  - Anything else, every contact unreachable, or 75 seconds gone → `not_confirmed`, which tells the parent not to pay until they reach the family themselves.
- **No answer means the next contact.** Unanswered, busy or voicemail calls move on to the next registered contact.
- **One verdict per session.** Repeated tool calls are ignored. Webhooks are unsigned, so the backend re-reads each call's status from Bolna's API before acting on it.
- **Guardrails.** Both agents carry a short list of rules they never break:
  - no promise that money comes back;
  - never ask for an OTP, PIN, card or account number, or the family word;
  - never pose as police, a bank or an officer;
  - no legal advice beyond the official facts;
  - stay on the scam.

  Safety lines can't be talked over. A post-call audit, the `guardrail_breach` disposition, checks every transcript, and the backend logs any call it flags.
- **Several people, one setup.** A family member can protect a mother, a father and a sister from the same phone. Each gets their own button link, and the signup page lists everyone added in that visit.
- **Abuse limits.**
  - Names may hold only letters and spaces, because they're spoken aloud and put into agent prompts.
  - Each person gets at most 20 presses an hour.
  - Any one number gets at most 15 family calls an hour, across every family.
  - Wrong invite codes lock signup for 15 minutes after 30 tries.
  - Requests over 64 KB are refused.
  - The API docs pages are off.
  - Logs carry neither tap-link keys nor phone numbers from query strings.
  - Every page sends a strict content policy, no-referrer, and frame and sniffing protection.
- **Two calls at once.** The rescue call needs a Bolna account that allows at least 2 concurrent calls. Set `RESCUE_CALLS=off` to go back to one call at a time.

## Accessibility

The people using this are parents over 55, often in a panic.

- **Every page in 12 languages, plus Hinglish.** The home page, signup and the tap button come in every call language, plus Hinglish (Hindi in English letters). English pages are entirely English. There's a language picker on each page. Translations live in `web/i18n/<language>.json`, and a page loads only the language in use.
- **Readable scripts.** Each script gets a matching Noto font, loaded only when that language is picked, so Tamil, Odia and the rest don't fall back to whatever the phone has.
- **The parent's own setting.** The tap button opens in the language the family picked at signup and remembers its own setting, so a child browsing the site in English doesn't change it for the parent.
- **A demo in any language.** The simulator plays the call in any of the 12 languages, with subtitles in the page's language.
- **One question at a time.** Signup walks through nine short steps, with a progress bar, big inputs, tappable language tiles and a review screen before anything is saved.
- **Larger text** with one button on every page.
- **One huge button.** The parent's only control is a single, high-contrast button with a short vibration when pressed.
- **Screen readers and keyboards.** Every form field has a label, errors are tied to their fields and focus moves to the first one, status changes are announced, and there's a skip link on every page.
- **Calm motion.** Animation is off when the device asks for reduced motion, and the simulator can be paused or stepped one line at a time.
- **Checked automatically.** axe-core reports no WCAG 2.2 AA violations on any page, in either language.

## Languages

Saathi speaks 12 languages: Hindi, English, Bengali, Marathi, Telugu, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Odia and Assamese.

- **The language is chosen at signup.** Every call opens in it through `agent_language`, and Bolna's language switching follows the caller if they clearly move to another language mid-call.
- **One agent per role.** Each Sarvam agent carries a `multilingual_config` with a Sarvam transcriber and a female Sarvam voice per language.
- **Every fixed safety line comes in all 12 languages**, each with its own pre-rendered audio. So does the "calling your family now" message.
- **Greetings come from the backend.** They include the parent's and family member's names, so `backend/languages.py` builds them in the family's language for each call.
- **The comparison stack is Hindi-only.** Families in other languages always use the Sarvam stack.

The non-Hindi lines were written for this project and should be checked by a native speaker before real families rely on them.

## Voice stacks

The same graph can run on three stacks. Hindi drills alternate between Sarvam and the comparison stack; every session records its `stack`. Set `VOICE_STACK=cerebras` to opt into Cerebras for graph routing and response generation. The default remains Sarvam; see [the Cerebras setup guide](docs/cerebras.md).

| Stack | Listen | Speak | Think |
| --- | --- | --- | --- |
| `sarvam` (default) | Sarvam `saaras:v4` | Sarvam `bulbul:v4-flash` | `gpt-5.4-mini` |
| `compare` | Deepgram `nova-3` | Cartesia `sonic-3.6` | `gpt-5.4-mini` |
| `cerebras` (optional) | Sarvam `saaras:v4` | Sarvam `bulbul:v4-flash` | Cerebras `gpt-oss-120b` |

## Layout

| Path | What |
| --- | --- |
| `agents/` | The four Bolna graph agents: parent line and family check, one of each per stack |
| `backend/` | FastAPI and SQLite. Places the calls, decides the verdict, fires it into the live call, sends the summary |
| `web/` | `index.html` is the home page with a check simulator; `signup.html` registers a family through a one-question-per-screen questionnaire; `tap.html` is the parent's one-tap button (`?demo=1` shows it without placing a call) |
| `scripts/` | `push_agents.py` creates or updates the agents, `summary_workflow.py` builds the WhatsApp workflow, `new_session.py` runs a timed test session |
| `video/` | The demo film, made with Remotion from the product's own screens and wording. See [`video/README.md`](video/README.md) |
| `media/` | The rendered film and the teaser GIF |

### Backend endpoints

| Endpoint | Called by | Does |
| --- | --- | --- |
| `POST /families` | Signup page | Registers a parent, 1–2 contacts and the family word |
| `POST /trigger` | Tap page | Starts a session and calls the parent |
| `POST /tools/start_verification` | Parent agent | Calls the family member and starts the 75-second timer |
| `POST /tools/search_web` | Parent agent | Searches official Indian sources through Exa for claim context |
| `POST /tools/report_verdict` | Family-check agent | Applies the verdict rules and fires the event |
| `POST /webhooks/bolna` | Bolna | Moves to the next contact on no answer; sends the summary when the call ends |
| `GET /lookup` | Bolna inbound | Identifies a parent calling in, once there is an inbound number |

## Run it on your own Bolna account

Real calls need a Bolna account and two phones. Nothing in the repo is tied to the author's account: your key and your agents are used throughout.

1. **Set up Bolna.**
   - Sign up at [platform.bolna.ai](https://platform.bolna.ai), copy your API key, and add some credit.
   - A trial account only rings verified numbers, so verify both phones you'll use, the parent's and the family member's, in the Bolna dashboard.
   - The rescue call needs 2 calls at once. If your account allows only 1, set `RESCUE_CALLS=off` in `.env`.
2. **Install.**

   ```bash
   git clone https://github.com/Deveshu04/OpenAI-DevDay-Asli-Hai-.git
   cd OpenAI-DevDay-Asli-Hai-
   pip install -r requirements.txt
   cp .env.example .env
   ```

3. **Fill in `.env`.**
   - Put your key in `BOLNA_API_KEY`.
   - Put your Exa key in `EXA_API_KEY` to enable official-source web search. Search remains unavailable when this is blank; call safety and family verification still work.
   - `TOOL_SECRET` is any long random string. The agents send it with every tool call, so only they can reach the tool endpoints. You can generate one with:

     ```bash
     python -c "import secrets; print(secrets.token_urlsafe(32))"
     ```

4. **Start the backend.**

   ```bash
   python -m uvicorn backend.app:app --port 8000
   ```

5. **Give it a public HTTPS address.** Bolna's agents reach the backend from the internet. A free Cloudflare quick tunnel needs no account:

   ```bash
   cloudflared tunnel --url http://localhost:8000
   ```

   Put the `https://….trycloudflare.com` address it prints into `PUBLIC_BASE_URL`. The address changes each time the tunnel restarts; when it does, repeat step 6. To keep one address, [deploy on Render](#deploy-on-render) instead.
6. **Create the agents in your account.**

   ```bash
   python scripts/push_agents.py
   ```

   This creates the four agents, points them at your `PUBLIC_BASE_URL`, and writes their ids into `.env`. Restart the backend so it reads them.
7. **Register a family.** Open `<PUBLIC_BASE_URL>/web/signup.html` and use your two verified phones. The parent and the first family member must be on different handsets: a second SIM in the phone you're talking on shows up as busy.
8. **Press the button.** Open the parent's link from the last signup screen, press it, and answer both phones. Things to try:
   - **A family claim:** "Rahul called, he's had an accident and needs ₹15,000", using your family member's name. The family member is checked on the rescue call, and the verdict reaches the parent's call.
   - **An official claim:** "Someone from CBI says I'm under digital arrest." Saathi gives the fixed warning, and the family member hears what happened.
   - **A parent who drops out:** hang up on Saathi early, or don't answer her. The family member is told to call the parent.
   - **A retry:** after "couldn't confirm", ask Saathi to call the family again.

**Optional extras:**

- `SIGNUP_CODE` locks signup to people you give the code to.
- The [family summary](#family-summary) on WhatsApp.
- The guardrail audit: add the disposition in `agents/extractions/guardrail_breach.json` to your agents in the Bolna dashboard, and every transcript is checked against Saathi's rules after the call.

## Troubleshooting

| What you see | Why | What to do |
| --- | --- | --- |
| No phone rings, and the call shows as failed in Bolna's Call History | A Bolna **trial account only calls verified numbers** | Before the first press, verify every number you'll use (the parent and each family member) in the Bolna dashboard. Do this first, even if you plan to add credit later. |
| The family member's phone comes back as busy | The parent and family member are on the same handset (two SIMs) | Use two separate phones. |
| Saathi calls the parent but the family member never rings | Your account allows only one call at a time | Ask Bolna to raise concurrency to 2, or set `RESCUE_CALLS=off` so the family is called only after Saathi hears the story. |
| The tap page says the call didn't go through | The backend can't place calls | Check `BOLNA_API_KEY` and the `AGENT_ID_*` values in `.env`, and restart the backend after `push_agents.py`. |
| Saathi talks, but the family is never called and no verdict arrives | Bolna can't reach your tools | `PUBLIC_BASE_URL` must be the backend's current HTTPS address. Quick tunnels change on restart; re-run `python scripts/push_agents.py` after each change. |
| Signup says the invite code isn't valid | `SIGNUP_CODE` is set in `.env` | Enter that code on the signup page, or leave `SIGNUP_CODE` empty. |
| The live site takes a while to open | The free server sleeps when idle | Wait up to a minute for the first load. |

## Deploy on Render

`render.yaml` is a Render Blueprint: a Starter web service in Singapore with a 1 GB disk for the SQLite database.

1. In Render, choose **New → Blueprint** and pick this repo. The Blueprint creates a separate `asli-hai-devday` service and `asli-devday-data` disk.
2. Set `BOLNA_API_KEY`, `EXA_API_KEY`, `TOOL_SECRET`, and a `SIGNUP_CODE` in the new service's environment. Do not reuse agent IDs from another deployment.
3. Once the service is live, copy its URL into `PUBLIC_BASE_URL` in your local `.env`. Keep the four `AGENT_ID_*` values empty, then run `python scripts/push_agents.py` to create fresh agents that point to the new service.
4. Copy the four newly generated `AGENT_ID_*` values from `.env` into the new Render service's environment, then redeploy it.

## Agents

```bash
python scripts/push_agents.py    # creates the agents, or updates them when AGENT_ID_* is already in .env
```

The JSON in `agents/` keeps `https://YOUR-BACKEND` and `YOUR_TOOL_SECRET` as placeholders. They are filled in at push time, so no secret is ever stored in the repo. Re-run the script whenever `agents/*.json` or `PUBLIC_BASE_URL` changes.

## Family summary

After each session the backend sends a short WhatsApp summary to every family contact. It runs a published Bolna workflow whose `aisensy_whatsapp` node sends an approved AiSensy template.

1. In AiSensy, submit the template body from `python scripts/summary_workflow.py --template-text` as a Utility template (language `en`). Launch it as an API campaign once it's approved.
2. In Bolna, link the AiSensy project under Integrations.
3. Put the template and campaign names in `.env` as `AISENSY_TEMPLATE_NAME` and `AISENSY_CAMPAIGN_NAME`.
4. `python scripts/summary_workflow.py --publish` creates the workflow and prints the `SUMMARY_WORKFLOW_ID` for `.env`.

Sending runs in the background, so a slow provider never delays the verdict. Each message carries a `reference_id` of `<session>-<priority>`, so a contact can't be messaged twice for the same session.

## Measuring

```bash
python scripts/new_session.py <family_id> --expect child_safe    # places a real call; shows the numbers and asks first
```

Each run is appended to `test_runs.csv` with the outcome, the seconds from tap to verdict, and the current passing streak.
