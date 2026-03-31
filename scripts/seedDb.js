const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'kanban.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database at:', dbPath);
});

const sampleCards = [
  {
    id: 'card_urgent_1',
    sender_name: 'john.smith@company.com',
    subject: 'URGENT: Q2 Budget Review - Deadline Today',
    category: 'Urgent',
    next_action: 'Call John immediately to discuss revised budget figures',
    deadline: '2026-03-28',
    ai_draft: 'Hi John,\n\nThank you for sending over the Q2 budget proposal. I\'ve reviewed the figures and have a few questions about the marketing allocation. Can we schedule a quick call this afternoon to discuss?\n\nBest regards',
    summary_bullets: null,
    read_time: null,
    board_section: 'todo'
  },
  {
    id: 'card_urgent_2',
    sender_name: 'sarah.davis@client.io',
    subject: 'Project Milestone Review - Feedback Needed by Friday',
    category: 'Urgent',
    next_action: 'Review attached documents and provide feedback on design mockups',
    deadline: '2026-04-01',
    ai_draft: 'Hi Sarah,\n\nThank you for sharing the design mockups for review. The overall direction looks great. I\'ve reviewed the documents and will send detailed feedback within 24 hours.\n\nBest regards',
    summary_bullets: null,
    read_time: null,
    board_section: 'todo'
  },
  {
    id: 'card_urgent_3',
    sender_name: 'mike.johnson@company.com',
    subject: 'Critical Bug Fix - Production Issue',
    category: 'Urgent',
    next_action: 'Deploy hotfix to production and notify stakeholders',
    deadline: '2026-03-28',
    ai_draft: 'Hi Mike,\n\nI acknowledge receipt of the production issue report. We\'re treating this as critical and will deploy a hotfix within the next 2 hours. I\'ll send you an update as soon as it\'s live.\n\nBest regards',
    summary_bullets: null,
    read_time: null,
    board_section: 'in_progress'
  },
  {
    id: 'card_info_1',
    sender_name: 'news@techcrunch.com',
    subject: 'Weekly Tech Digest: AI Trends & Market Updates',
    category: 'Information',
    next_action: null,
    deadline: null,
    ai_draft: null,
    summary_bullets: JSON.stringify({
      bullets: [
        'New OpenAI model outperforms competitors on benchmarks',
        'Enterprise adoption of AI tools surged 45% YoY',
        'Regulatory framework for AI in EU expected Q3 2026'
      ]
    }),
    read_time: '5 min',
    board_section: 'todo'
  },
  {
    id: 'card_info_2',
    sender_name: 'updates@notion.so',
    subject: 'Notion Updates: New Database Templates & Features',
    category: 'Information',
    next_action: null,
    deadline: null,
    ai_draft: null,
    summary_bullets: JSON.stringify({
      bullets: [
        'Added 50+ new database templates for businesses',
        'Improved API rate limits and response times',
        'New rollup and formula functions for better workflows'
      ]
    }),
    read_time: '3 min',
    board_section: 'todo'
  },
  {
    id: 'card_info_3',
    sender_name: 'newsletter@productHunt.com',
    subject: 'Product Hunt Daily: Top Apps & Startups',
    category: 'Information',
    next_action: null,
    deadline: null,
    ai_draft: null,
    summary_bullets: JSON.stringify({
      bullets: [
        '#1 Product: AI Code Review Assistant with 2.5k upvotes',
        'Trending: Low-code platforms gain investor interest',
        'On the radar: Web3 tools showing signs of rebound'
      ]
    }),
    read_time: '4 min',
    board_section: 'in_progress'
  },
  {
    id: 'card_promo_1',
    sender_name: 'marketing@amazon.com',
    subject: '🎉 Special Offer: 40% Off AWS Credits - Limited Time!',
    category: 'Promotional',
    next_action: null,
    deadline: null,
    ai_draft: null,
    summary_bullets: null,
    read_time: null,
    board_section: 'todo'
  },
  {
    id: 'card_promo_2',
    sender_name: 'sales@slack.com',
    subject: 'Exclusive Deal: Enterprise Plan + Custom Integrations Free',
    category: 'Promotional',
    next_action: null,
    deadline: null,
    ai_draft: null,
    summary_bullets: null,
    read_time: null,
    board_section: 'todo'
  },
  {
    id: 'card_promo_3',
    sender_name: 'offers@coursera.org',
    subject: 'Flash Sale: Premium Courses 60% OFF - 24 Hours Only',
    category: 'Promotional',
    next_action: null,
    deadline: null,
    ai_draft: null,
    summary_bullets: null,
    read_time: null,
    board_section: 'todo'
  },
  {
    id: 'card_done_1',
    sender_name: 'alex.chen@company.com',
    subject: 'Monthly Report - March Performance Summary',
    category: 'Information',
    next_action: null,
    deadline: null,
    ai_draft: null,
    summary_bullets: JSON.stringify({
      bullets: [
        'Revenue increased 15% compared to February',
        'Customer retention rate hit all-time high of 94%',
        'Team productivity metrics improved across all departments'
      ]
    }),
    read_time: '6 min',
    board_section: 'done'
  },
  {
    id: 'card_done_2',
    sender_name: 'support@company.com',
    subject: 'Ticket #4521: Feature Request - Implemented & Deployed',
    category: 'Urgent',
    next_action: 'Notify customer of completion',
    deadline: '2026-03-27',
    ai_draft: 'Hi,\n\nWe\'re pleased to inform you that the requested feature has been implemented and is now live on the platform. Please test it out and let us know if you have any feedback.\n\nThank you for your patience!\n\nBest regards',
    summary_bullets: null,
    read_time: null,
    board_section: 'done'
  }
];

db.serialize(() => {
  // Clear existing data (optional - comment out to preserve existing data)
  db.run(`DELETE FROM kanban_cards`, (err) => {
    if (err) console.log('Note: Could not clear existing cards');
  });

  // Insert sample data
  const insertStmt = db.prepare(`
    INSERT INTO kanban_cards (
      id, sender_name, subject, category, next_action, deadline, 
      ai_draft, summary_bullets, read_time, board_section, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let inserted = 0;
  const now = new Date().toISOString();

  sampleCards.forEach((card) => {
    insertStmt.run(
      [
        card.id,
        card.sender_name,
        card.subject,
        card.category,
        card.next_action,
        card.deadline,
        card.ai_draft,
        card.summary_bullets,
        card.read_time,
        card.board_section,
        now,
        now,
      ],
      (err) => {
        if (err) {
          console.error(`Error inserting card ${card.id}:`, err);
        } else {
          inserted++;
        }
      }
    );
  });

  insertStmt.finalize((err) => {
    if (err) {
      console.error('Error finalizing insert:', err);
    } else {
      console.log(`✅ Successfully seeded ${inserted} sample cards!`);
      console.log('\nSample data includes:');
      console.log('  🔴 3 Urgent cards (Red) - with next actions and deadlines');
      console.log('  🔵 3 Information cards (Blue) - with bullet points and read time');
      console.log('  ⚫ 3 Promotional cards (Grey) - minimal info');
      console.log('  ✅ 2 Completed cards in Done column');
      console.log('\nYour database is ready! Run: npm run dev');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
    process.exit(1);
  }
});
