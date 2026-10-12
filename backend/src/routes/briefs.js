const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readDb, updateCollection } = require('../utils/store');
const { requireAdmin, requireBriefsAccess, requireWriteAccess } = require('../middleware/auth');

const router = express.Router();

const CAMPAIGN_OBJECTIVES = [
  'Build a New Brand',
  'Launch a New Product',
  'National B2B Blitz',
  'TV Commercial Production',
  'Full-Funnel Digital Performance',
  'Brand & Press Events',
  'Mega Experimental Activation',
];

const INDUSTRY_SECTORS = [
  'Real Estate',
  'FMCG / F&B',
  'Healthcare',
  'Automotive',
  'Retail & Luxury',
  'Banking & Fintech',
  'Telecom & Technology',
];

router.get('/meta', (_req, res) => {
  res.json({ objectives: CAMPAIGN_OBJECTIVES, sectors: INDUSTRY_SECTORS });
});

// Public: client submits Start Project brief
router.post('/', (req, res) => {
  const {
    objective,
    sector,
    fullName,
    companyName,
    email,
    phone,
    summary,
  } = req.body || {};

  if (!fullName?.trim()) return res.status(400).json({ message: 'Full name is required' });
  if (!companyName?.trim()) return res.status(400).json({ message: 'Company name is required' });
  if (!email?.trim()) return res.status(400).json({ message: 'Email is required' });
  if (!phone?.trim()) return res.status(400).json({ message: 'Phone is required' });
  if (!summary?.trim()) return res.status(400).json({ message: 'Project summary is required' });

  const brief = {
    id: uuidv4(),
    objective: objective || 'Launch a New Product',
    sector: sector || 'Real Estate',
    fullName: fullName.trim(),
    companyName: companyName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    summary: summary.trim(),
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  updateCollection('briefs', (list) => [brief, ...list]);
  res.status(201).json({ message: 'Brief submitted successfully', brief: { id: brief.id } });
});

// Start Project: Accessible by Admin, Manager (read-only), and Sales team. Forbidden for Data Entry.
router.get('/', requireBriefsAccess, (_req, res) => {
  const { briefs } = readDb();
  res.json(briefs);
});

router.get('/:id', requireBriefsAccess, (req, res) => {
  const { briefs } = readDb();
  const brief = briefs.find((b) => b.id === req.params.id);
  if (!brief) return res.status(404).json({ message: 'Brief not found' });
  res.json(brief);
});

// Status update: Accessible by Admin and Sales team. Blocked for Manager (read-only) and Data Entry.
router.patch('/:id/status', requireBriefsAccess, requireWriteAccess, (req, res) => {
  const { status } = req.body || {};
  const allowed = ['new', 'in_review', 'contacted', 'closed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  let updated = null;
  updateCollection('briefs', (list) =>
    list.map((b) => {
      if (b.id !== req.params.id) return b;
      updated = { ...b, status, updatedAt: new Date().toISOString() };
      return updated;
    })
  );

  if (!updated) return res.status(404).json({ message: 'Brief not found' });
  res.json(updated);
});

// Deletion: Strict Admin only!
router.delete('/:id', requireAdmin, (req, res) => {
  let found = false;
  updateCollection('briefs', (list) => {
    const next = list.filter((b) => {
      if (b.id === req.params.id) {
        found = true;
        return false;
      }
      return true;
    });
    return next;
  });
  if (!found) return res.status(404).json({ message: 'Brief not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
