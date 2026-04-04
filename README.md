# AI-Driven Kanban Inbox

An intelligent email classification system that automatically triages, categorizes, and prioritizes emails into a Kanban board using AI (Google Gemini), n8n automation, and RAG (Retrieval-Augmented Generation) with company knowledge base integration.

## Project Features

- **Automated Email Classification**: AI-powered email triage into 3 categories (Urgent, Information, Promotional)
- **Intelligent Response Drafting**: Generate contextual response drafts in your brand voice
- **RAG-Enhanced Context**: Retrieve company knowledge base documents for context-aware classification
- **Per-Sender Memory**: Maintain conversation history per sender for consistent interactions
- **Kanban Board Interface**: Visual inbox management with drag-and-drop organization
- **Duplicate Detection**: Prevent processing the same email twice
- **Gmail Integration**: Direct Gmail polling with OAuth2 authentication
- **Gemini API**: State-of-the-art LLM for email analysis (gemini-2.5-flash-lite)


API Endpoints:                                                       │
│  • POST /api/cards - Create kanban card                              │
│  • GET /api/cards - Fetch all cards                                  │
│  • PATCH /api/cards/[id] - Update card                               │
│  • POST /api/cards/[id]/move - Move card between sections            │
│  • POST /api/cards/[id]/draft - Generate response draft              │
│  • POST /api/cards/[id]/send - Send draft response via Gmail         │
│  • GET /api/processed-emails/check - Duplicate detection             │
│  • POST /api/processed-emails/record - Audit logging                 │
│                                                                       │
│  Database: SQLite (data/kanban.db)                                   │
└──────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   React Kanban Board (Port 3000)                     │
├──────────────────────────────────────────────────────────────────────┤
│  • 3-column board (TODO → IN_PROGRESS → DONE)                        │
│  • Drag-and-drop cards                                               │
│  • Edit AI draft responses                                           │
│  • Send emails directly from UI                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Email Classification System

### RED (URGENT) - Highest Priority
**Indicators:**
- Forecast pressure or revenue impact
- Operational failures or system downtime
- C-suite/executive involvement (CEO, CTO, COO, CFO, etc.)
- Time-sensitive decisions needed
- Budget or resource constraints

**Output Fields Populated:**
- `next_action`: Specific first action to take
- `extracted_deadline`: Decision or action deadline
- `draft_response`: Professional response in company's brand voice

### BLUE (INFORMATION) - Standard Priority
**Indicators:**
- Client inquiries or feedback
- Team updates and announcements
- Standard business communications
- Process or documentation requests
- Regular check-ins

**Output Fields Populated:**
- `summary_bullets`: 3 key takeaways
- `read_time`: Estimated reading time (1-5 min)
- `next_action`: null

### GREY (IGNORE) - Low Priority
**Indicators:**
- Marketing or promotional content
- Newsletters or subscriptions
- Automated notifications
- Spam or irrelevant messages

## Prerequisites

### System Requirements
- **Node.js** 18.x or higher
- **npm** or **yarn**
- **n8n** (version 1.x or higher) - installed locally or via Docker
- **SQLite3** (included with Node.js)

### Google Cloud Setup Required
You'll need active Google Cloud Projects with these APIs enabled:
1. **Gmail API** (for email polling)
2. **Google Drive API** (for knowledge base document retrieval)
3. **Google Generative AI API** (for Gemini LLM access)

### Google Accounts Needed
- **Gmail Account** (for email triggering)
- **Google Drive Account** (for knowledge base storage)
- **Google Cloud Console Access** (for API credentials)

---

## Step 1: Google API Setup

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Create Project** (top-left)
3. Enter project name: `AI-Kanban-Inbox`
4. Click **Create**
5. Wait for the project to be created, then select it

### 1.2 Enable Required APIs

#### Enable Gmail API
1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for `Gmail API`
3. Click **Gmail API** from results
4. Click **Enable**
5. Click **Create Credentials** → **Service Account** (or OAuth 2.0 for user account)

#### Enable Google Drive API
1. Go to **APIs & Services** → **Library**
2. Search for `Google Drive API`
3. Click **Google Drive API**
4. Click **Enable**

#### Enable Google Generative AI (Gemini) API
1. Go to **APIs & Services** → **Library**
2. Search for `Generative Language API`
3. Click **Generative Language API**
4. Click **Enable**

### 1.3 Create OAuth 2.0 Credentials for Gmail

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** (or **Internal** if using Google Workspace)
   - Fill in app name: `AI-Kanban-Inbox`
   - Add your email as user support contact
   - Click **Save and Continue**
   - Add scopes: 
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.modify`
   - Click **Save and Continue**
4. Back to credentials, click **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: Add both:
   - `http://localhost:5678/rest/oauth2/callback` (for n8n local)
   - `http://localhost:3000/oauth/callback` (for Next.js, if needed)
7. Click **Create**
8. **Download JSON** and save as `gmail_credentials.json`

### 1.4 Create API Key for Gemini

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy the API key (you'll use this in n8n)
4. Restrict the key: Click the key → **Restrict key**
   - Restrict to: **Generative Language API**
   - Click **Save**

### 1.5 Create Service Account for Google Drive (Optional but Recommended)

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Service account name: `ai-kanban-service`
4. Click **Create and Continue**
5. Grant role: **Basic** → **Editor** (for Drive access)
6. Click **Continue** → **Done**
7. Click the service account email you created
8. Go to **Keys** tab → **Add Key** → **Create new key**
9. Key type: **JSON**
10. Click **Create** (downloads JSON file, save it)

---

## Step 2: n8n Installation & Setup

### 2.1 Install n8n

**Option A: Local Installation (Recommended for Development)**
```bash
npm install -g n8n
```

### 2.2 Start n8n

```bash
n8n start
```

Access n8n at: `http://localhost:5678`

### 2.3 Import the Workflow

1. Open n8n dashboard
2. Click **+ New** → **Import Workflow**
3. Select the `n8n workflow/RAG-kanban-gmail.json` file from this repository
4. Click **Import**

The workflow `RAG-kanban-gmail` will be imported with all nodes and connections intact.

### 2.4 Configure Google Credentials in n8n

#### Gmail OAuth2 Credentials

1. In the imported workflow, double-click the **Gmail Trigger** node
2. In the **Credentials** field, click **Create New Credential** (if not already set)
3. Credential type: **Gmail OAuth2**
4. Fill in with values from your `gmail_credentials.json`:
   - **Client ID**: From OAuth credentials
   - **Client Secret**: From OAuth credentials
   - Click **Connect my account** to authorize
5. Save the credential

#### Google Drive OAuth2 Credentials

1. Double-click **Search files and folders** node
2. Click **Create New Credential** in the credentials field
3. Credential type: **Google Drive OAuth2**
4. Fill in OAuth credentials
5. Click **Connect my account** to authorize
6. Save the credential

#### Google Gemini API Key

1. Double-click **Google Gemini Chat Model** node
2. In **Credentials**, click **Create New Credential**
3. Credential type: **Google Generative AI API**
4. Paste your API Key from Step 1.4
5. Save the credential

### 2.5 Configure n8n Nodes

#### Gmail Trigger
- **Polling interval**: Every Minute (default)
- **Labels**: INBOX, UNREAD
- This polls your Gmail every minute for new unread emails

#### Simple Vector Store (Knowledge Base)
- **Session key**: `company info`
- This stores embeddings of your knowledge base files

#### Simple Memory (Per-Sender Context)
- **Session ID type**: Custom Key
- **Session key**: `{{ $json.sender_email }}`
- Maintains 5-email conversation history per sender

#### AI Agent (Classification)
- **Model**: `models/gemini-2.5-flash-lite`
- **Temperature**: 0 (deterministic)
- **Top P**: 1
- System prompt includes few-shot examples and GBNF schema

---

## Step 3: Database Setup

### 3.1 Initialize the Database

```bash
# From project root
npm run db:init
```

This creates the SQLite database at `data/kanban.db` with the `kanban_cards` schema.


---

## Step 4: Environment Configuration

### 4.1 Set Up .env.local

The `.env.local` file is already included with webhook configuration. If you need to customize:

```bash
# n8n webhook for sending responses from UI
N8N_WEBHOOK_URL=[]
NEXT_PUBLIC_N8N_WEBHOOK_URL=[]


```

---

## Step 5: Install Dependencies & Run

### 5.1 Install Node Packages

```bash
npm install
```

### 5.2 Start the Development Server

```bash
npm run dev
```

Access the Kanban board at: `http://localhost:3000`

### 5.3 Verify Everything Works

1. **n8n Running**: Open `http://localhost:5678`
2. **Next.js App Running**: Open `http://localhost:3000`
3. **Check Workflow**: In n8n, click the workflow → **Execute** to do a test run
4. **Send Test Email**: Send an email to your Gmail account
5. **Monitor n8n**: You should see the email processed in n8n's execution logs
6. **Check Kanban Board**: Go to `http://localhost:3000` - new card should appear

---

## API Endpoints

### Cards Management

#### Create Card (from n8n)
```
POST /api/cards
Content-Type: application/json

{
  "sender_name": "John Doe",
  "sender_email": "john@example.com",
  "subject": "Q2 Forecast Review",
  "category": "Urgent",
  "next_action": "Schedule meeting with finance team",
  "deadline": "2026-04-08",
  "ai_draft": "Based on your targets...",
  "summary_bullets": null,
  "read_time": null
}
```

#### Get All Cards
```
GET /api/cards
```

#### Get Card by ID
```
GET /api/cards/[id]
```

#### Update Card
```
PATCH /api/cards/[id]
Content-Type: application/json

{
  "ai_draft": "Updated response draft"
}
```

#### Move Card Between Sections
```
POST /api/cards/[id]/move
Content-Type: application/json

{
  "board_section": "in_progress"  // or "done"
}
```

#### Generate Draft Response
```
POST /api/cards/[id]/draft
```

#### Send Draft Response (via Gmail)
```
POST /api/cards/[id]/send
Content-Type: application/json

{
  "draft": "Your response text here"
}
```

### Email Processing

#### Check if Email Already Processed
```
GET /api/processed-emails/check?messageId=xxx
```

#### Record Processed Email (Audit Log)
```
POST /api/processed-emails/record
Content-Type: application/json

{
  "messageId": "xxx",
  "senderEmail": "sender@example.com",
  "subject": "Email Subject"
}
```

---

## Data Schema

### kanban_cards Table

```sql
CREATE TABLE kanban_cards (
  id TEXT PRIMARY KEY,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('Urgent', 'Information', 'Promotional')),
  next_action TEXT,
  deadline TEXT,
  ai_draft TEXT,
  summary_bullets TEXT,        -- JSON stringified array
  read_time TEXT,
  board_section TEXT NOT NULL DEFAULT 'todo' CHECK(board_section IN ('todo', 'in_progress', 'done')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
```

---

## n8n Workflow Detailed Configuration

### Complete Workflow JSON

The workflow file `n8n workflow/RAG-kanban-gmail.json` contains:

**25+ Nodes:**
- **Gmail Trigger**: Polls INBOX for UNREAD emails every minute
- **Code in JavaScript** (5 instances): Email parsing, field extraction, data transformation
- **Text Classifier**: Early spam filtering before AI processing
- **Check Duplicate**: Prevents reprocessing same email
- **Simple Memory**: Per-sender conversation history (key = sender email)
- **Simple Vector Store**: Stores embeddings of knowledge base files
- **AI Agent**: Gemini 2.5 Flash Lite classification + response drafting
- **HTTP Request Nodes**: API calls to Next.js backend
- **Gmail Send**: Send response drafts back to senders
- **Google Drive Integration**: Fetch and embed knowledge base documents
- **Schedule Trigger**: Daily sync of knowledge base updates

### Key Features in Workflow

**1. Email Parsing**
- Extracts: sender_name, sender_email, subject, body, message_id, date
- Handles RFC2047 encoded subjects (UTF-8 Base64)
- Truncates body to 2000 chars to optimize tokens

**2. AI Classification**
- Uses **GBNF Grammar Constraints** for strict JSON output validation
- **Few-shot examples**: 3 concrete examples (RED, BLUE, GREY)
- **Output fields**: classification, reasoning, summary_bullets, draft_response, next_action, extracted_deadline, read_time, confidence_score, vector_store_used

**3. RAG Enhancement**
- Retrieves company knowledge base from Google Drive
- Embeds documents using Gemini Embeddings (384-dim vectors)
- Vector Store provides context to AI Agent
- Files stored in Drive folder: `company_knowledge_base`

**4. Duplicate Prevention**
- Checks `http://localhost:3000/api/processed-emails/check?messageId=xxx`
- Early exit if email already processed
- Maintains audit log in database

**5. Memory Management**
- Per-sender memory using email address as session key
- Maintains 5-email context window (configurable)
- Tracks patterns per sender for consistent responses

---

## Running the Full System

### Terminal 1: n8n
```bash
n8n start
# Accessible at http://localhost:5678
```

### Terminal 2: Next.js Application
```bash
npm run dev
# Accessible at http://localhost:3000
```

### Terminal 3: Monitor Logs (Optional)
```bash
# In n8n, check execution logs for workflow runs
# In Next.js, server logs appear in Terminal 2
```

### Testing the System

1. **Send a test email** to your Gmail address (from another account or use Gmail's "Send test email")
   
2. **Watch n8n execute**:
   - Go to n8n dashboard
   - Click the workflow
   - Monitor execution in real-time
   
3. **Open Kanban board**:
   - Go to `http://localhost:3000`
   - New card should appear in TODO column within 1-2 minutes
   
4. **Interact with card**:
   - Click card to view AI draft response
   - Drag to IN_PROGRESS or DONE
   - Edit draft if needed
   - Send response directly from UI

---

## Troubleshooting

### n8n Workflow Not Executing
**Problem**: Email arrives but workflow doesn't run

**Solutions**:
1. Check n8n is running: `http://localhost:5678`
2. Check Gmail credentials are valid: Click Gmail Trigger → Click **Test trigger**
3. Check email has INBOX + UNREAD labels
4. Look at n8n execution logs for errors

### "Duplicate" Emails Not Being Processed
**Problem**: Same email processed multiple times

**Check**:
- `/api/processed-emails/check` endpoint is being called
- Database `data/kanban.db` exists and has `kanban_cards` table
- Message IDs are being extracted correctly

### AI Classification Not Working
**Problem**: Blank or error in AI Agent node

**Solutions**:
1. Verify Gemini API key is valid: Try API in Google Cloud Console
2. Check temperature=0, topP=1 settings (for deterministic output)
3. View AI Agent node execution logs in n8n
4. Test with a simple email subject first

### Knowledge Base Not Being Retrieved
**Problem**: RAG context not enhancing responses

**Check**:
1. Knowledge base folder exists in Google Drive
2. Files are in a folder
3. Google Drive credentials are valid
4. Vector Store is properly configured (session key = "company info")

### Next.js App Won't Start
**Problem**: Port 3000 already in use

**Solutions**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3000   # Windows

# Or use different port
npm run dev -- -p 3001
```

### Database Locked Error
**Problem**: SQLite database is locked

**Solutions**:
1. Ensure only one instance of Next.js is running
2. Delete `data/kanban.db` and re-run `npm run db:init`
3. Check no other process has database file open

---

## Project Structure

```
gmail-rag/
├── n8n workflow/
│   └── RAG-kanban-gmail.json          # Complete n8n workflow (25+ nodes)
├── pages/
│   ├── index.tsx                       # Kanban board home page
│   ├── _app.tsx                        # Next.js app wrapper
│   └── api/
│       ├── cards/
│       │   ├── index.ts               # POST (create), GET (list)
│       │   └── [id]/
│       │       ├── index.ts           # PATCH (update), GET (detail)
│       │       ├── move.ts            # POST (change section)
│       │       ├── send.ts            # POST (send email via Gmail)
│       │       └── draft.ts           # POST (generate draft)
│       └── processed-emails/
│           ├── check.ts               # GET (duplicate detection)
│           └── record.ts              # POST (audit log)
├── components/
│   ├── KanbanBoard.tsx                # Main board layout
│   ├── KanbanColumn.tsx               # Column (TODO/IN_PROGRESS/DONE)
│   ├── KanbanCardVariants.tsx         # Card display variants
│   └── Modals.tsx                     # Edit/send modals
├── lib/
│   └── db.ts                          # Database operations
├── scripts/
│   ├── initDb.js                      # Create schema
│   └── seedDb.js                      # Sample data
├── types/
│   └── kanban.ts                      # TypeScript interfaces
├── styles/
│   └── globals.css                    # Styling
├── data/
│   └── kanban.db                      # SQLite database (created at runtime)
├── knowledge_base/             
# Company knowledge base files
│  //////
├── package.json
├── tsconfig.json
├── next.config.js
├── .gitignore
├── .env.local                         # Environment variables
└── README.md                          # This file
```

---

## Technologies Used

| Technology | Version | Purpose |
|-----------|---------|---------|
| **n8n** | 1.x+ | Workflow automation & email processing |
| **Next.js** | 14.x | Backend API & Kanban UI |
| **React** | 18.x | Frontend components |
| **TypeScript** | 5.x | Type safety |
| **SQLite3** | 5.x | Database for card storage |
| **Google Gemini** | 2.5 Flash Lite | LLM for email classification |
| **Google Gmail API** | v1 | Email polling & sending |
| **Google Drive API** | v3 | Knowledge base retrieval |
| **NodeJS** | 18.x+ | Runtime |

---

## Environment Details

### Gmail Setup
- **Account**: Your personal/business Gmail account
- **Polling**: Every 1 minute (configurable in n8n trigger)
- **Labels**: Monitors INBOX + UNREAD only
- **OAuth Scopes**: gmail.readonly, gmail.modify

### Google Gemini Configuration
- **Model**: `models/gemini-2.5-flash-lite`
- **Temperature**: 0 (deterministic for consistent classification)
- **Top P**: 1 (nucleus sampling)
- **Max Tokens**: Default
- **Cost**: Gemini models are free tier with rate limiting

### Database
- **Type**: SQLite (file-based, no server needed)
- **Location**: `data/kanban.db`
- **Tables**: 1 (kanban_cards with indexed queries)
- **Backup**: Copy `data/kanban.db` to backup

---

## Support & Maintenance

### Regular Maintenance Tasks

1. **Update Knowledge Base**:
   - Add/edit files in Google Drive folder
   - n8n updates vector store daily (via Schedule Trigger)

2. **Monitor Accuracy**:
   - Review how many emails fall into each category
   - Adjust classification rules in AI Agent prompt if needed

3. **Cleanup Old Data**:
   - Archive processed emails periodically
   - This keeps database size manageable

4. **API Quotas**:
   - Monitor Gmail API quota in Google Cloud Console
   - Monitor Gemini API usage (free tier has daily limits)
   - Monitor Google Drive API usage

---

## Next Steps

After setup:

1. ✅ Configure all Google APIs
2. ✅ Import n8n workflow
3. ✅ Set up credentials in n8n
4. ✅ Initialize database
5. ✅ Run both services (n8n + Next.js)
6. 📧 Send test emails to validate
7. 📊 View results in Kanban board
8. 🎯 Customize AI prompts for your use case
9. 📁 Add company documents to Google Drive knowledge base
10. 🚀 Deploy to production (Vercel for Next.js, n8n cloud for workflows)

---

## License

This project is provided as-is for internal use.

---

## Questions & Debugging

### Common Questions

**Q: Can I change the email classification categories?**
A: Yes. Modify the AI Agent prompt in n8n and update the `CardCategory` type in `types/kanban.ts`.

**Q: Can I add more context to responses?**
A: Yes. Upload more files to the Google Drive folder. n8n will automatically embed and retrieve them.

**Q: Can I run this without Google APIs?**
A: The system is built on Google APIs. You could swap Gemini for a local LLM (e.g., Ollama) but would need to modify the n8n workflow.

**Q: What's the cost?**
A: Google Gemini API is free tier (with rate limits). Gmail & Drive APIs are free. n8n self-hosted is free.

### Debugging Checklist

- [ ] n8n is running on port 5678
- [ ] Next.js is running on port 3000
- [ ] All Google API credentials are valid
- [ ] Database initialized: `npm run db:init`
- [ ] Node modules installed: `npm install`
- [ ] Gmail trigger test passes in n8n
- [ ] AI Agent can connect to Gemini API
- [ ] Google Drive credentials can access knowledge base folder

---

## Version History

- **v1.0.0** (April 2026): Initial release with GBNF grammar constraints and few-shot prompting

---

For detailed n8n workflow logic, see the commented sections in `RAG-kanban-gmail.json`.
