import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HACKER_SENTENCES,
  SENTENCE_ANIMATION_DURATION_MS,
  VIDEO_LOOP_START_SECONDS,
  DISCIPLINE_EXPERIENCES,
  PREVIOUS_WORK_DEMOS,
  COMBAT_SYSTEM_ASSET_URL,
  WALK_ANIMATION_VIDEO_URL,
  VIRAL_GAME_UI_IMAGE_URL,
  getDemosByCategory,
  scrambleText,
  calculateCommissionBreakdown,
} from './portfolioLogic';

test('HACKER_SENTENCES contains exact 5 corrected sentences and 1000ms animation duration', () => {
  assert.equal(SENTENCE_ANIMATION_DURATION_MS, 1000);
  assert.equal(VIDEO_LOOP_START_SECONDS, 2.0);
  assert.equal(HACKER_SENTENCES.length, 5);
  assert.deepEqual(
    HACKER_SENTENCES.map((s) => s.sentence),
    [
      'I am a Scripter.',
      'I am a UI Designer.',
      'I am an Animator.',
      'I am a Modeler.',
      'I am an All-Rounder.',
    ]
  );
  assert.equal(HACKER_SENTENCES[4].isCulmination, true);
});

test('scrambleText progresses deterministically without symbol clutter and resolves at 1.0', () => {
  const target = 'I am a Scripter.';
  assert.equal(scrambleText(target, 1), target);
  const mid = scrambleText(target, 0.5);
  assert.equal(mid.startsWith('I am a S'), true);
  assert.equal(/[\[\]\$\=]/.test(mid), false);
});

test('DISCIPLINE_EXPERIENCES matches exact years of experience requested by user', () => {
  const byId = Object.fromEntries(DISCIPLINE_EXPERIENCES.map((d) => [d.id, d.yearsDisplay]));
  assert.equal(byId['scripting'], '3+ Years');
  assert.equal(byId['ui-design'], '2+ Years');
  assert.equal(byId['modeling'], '2+ Years');
  assert.equal(byId['animating'], '1+ Year');
});

test('calculateCommissionBreakdown matches all 5 discipline pricing tiers in USD and Robux', () => {
  // 1. All-Rounder (Full Pack): Commission = $20 / 5,000 R$, Short-Term = $70 / 20,000 R$, Long-Term = $250 / 100,000 R$
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'all-rounder', contractType: 'commission', currency: 'USD' }).totalAmount,
    20
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'all-rounder', contractType: 'commission', currency: 'ROBUX' }).totalAmount,
    5000
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'all-rounder', contractType: 'short-term', currency: 'USD' }).totalAmount,
    70
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'all-rounder', contractType: 'short-term', currency: 'ROBUX' }).totalAmount,
    20000
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'all-rounder', contractType: 'long-term', currency: 'USD' }).totalAmount,
    250
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'all-rounder', contractType: 'long-term', currency: 'ROBUX' }).totalAmount,
    100000
  );

  // 2. Scripting: Commission = $15 / 5,000 R$, Short-Term = $75 / 15,000 R$, Long-Term = $140 / 65,000 R$
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'scripting', contractType: 'commission', currency: 'USD' }).totalAmount,
    15
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'scripting', contractType: 'commission', currency: 'ROBUX' }).totalAmount,
    5000
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'scripting', contractType: 'short-term', currency: 'USD' }).totalAmount,
    75
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'scripting', contractType: 'short-term', currency: 'ROBUX' }).totalAmount,
    15000
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'scripting', contractType: 'long-term', currency: 'USD' }).totalAmount,
    140
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'scripting', contractType: 'long-term', currency: 'ROBUX' }).totalAmount,
    65000
  );

  // 3. Animation: Commission = $10 / 2,000 R$, Short-Term = $37 / 8,000 R$, Long-Term = $120 / 13,000 R$
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'animating', contractType: 'commission', currency: 'USD' }).totalAmount,
    10
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'animating', contractType: 'commission', currency: 'ROBUX' }).totalAmount,
    2000
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'animating', contractType: 'short-term', currency: 'USD' }).totalAmount,
    37
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'animating', contractType: 'short-term', currency: 'ROBUX' }).totalAmount,
    8000
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'animating', contractType: 'long-term', currency: 'USD' }).totalAmount,
    120
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'animating', contractType: 'long-term', currency: 'ROBUX' }).totalAmount,
    13000
  );

  // 4. UI Design: Commission = $10 / 1,500 R$, Short-Term = $34 / 7,000 R$, Long-Term = $95 / 12,000 R$
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'ui-design', contractType: 'commission', currency: 'USD' }).totalAmount,
    10
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'ui-design', contractType: 'commission', currency: 'ROBUX' }).totalAmount,
    1500
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'ui-design', contractType: 'short-term', currency: 'USD' }).totalAmount,
    34
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'ui-design', contractType: 'short-term', currency: 'ROBUX' }).totalAmount,
    7000
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'ui-design', contractType: 'long-term', currency: 'USD' }).totalAmount,
    95
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'ui-design', contractType: 'long-term', currency: 'ROBUX' }).totalAmount,
    12000
  );

  // 5. Modeling: Commission = $35 / 15,000 R$, Short-Term = $75 / 20,000 R$, Long-Term = $130 / 80,000 R$
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'modeling', contractType: 'commission', currency: 'USD' }).totalAmount,
    35
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'modeling', contractType: 'commission', currency: 'ROBUX' }).totalAmount,
    15000
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'modeling', contractType: 'short-term', currency: 'USD' }).totalAmount,
    75
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'modeling', contractType: 'short-term', currency: 'ROBUX' }).totalAmount,
    20000
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'modeling', contractType: 'long-term', currency: 'USD' }).totalAmount,
    130
  );
  assert.equal(
    calculateCommissionBreakdown({ disciplineId: 'modeling', contractType: 'long-term', currency: 'ROBUX' }).totalAmount,
    80000
  );
});

test('PREVIOUS_WORK_DEMOS contains Scripting Combat System and Animation Walk Cycle demos', () => {
  const scriptingDemos = getDemosByCategory('scripting');
  assert.equal(scriptingDemos.length, 1);
  const combatDemo = scriptingDemos[0];
  assert.equal(combatDemo.title, 'The Combat System By Balo_xio');
  assert.equal(combatDemo.videoUrl, '/assets/aistudio/1023_0f48f1c9.mp4');
  assert.equal(combatDemo.tryAssetUrl, COMBAT_SYSTEM_ASSET_URL);
  assert.equal(combatDemo.systemsIncluded.includes('Headshot System'), true);
  assert.equal(combatDemo.systemsIncluded.includes('Hit Markers'), true);
  assert.equal(combatDemo.systemsIncluded.includes('Recoil System'), true);
  assert.equal(combatDemo.systemsIncluded.includes('Raycasting System'), true);
  assert.equal(combatDemo.systemsIncluded.includes('Animations'), true);
  assert.equal(combatDemo.systemsIncluded.includes('Reloading GUI System'), true);

  const animationDemos = getDemosByCategory('animating');
  assert.equal(animationDemos.length, 1);
  const walkDemo = animationDemos[0];
  assert.equal(walkDemo.title, 'A Walk Animation Made By Balo_xio');
  assert.equal(walkDemo.videoUrl, WALK_ANIMATION_VIDEO_URL);
  assert.equal(walkDemo.systemsIncluded.includes('Cinematic Walk Cycle'), true);
  assert.equal(walkDemo.systemsIncluded.includes('Cinematic Camera Animation'), true);

  const uiDemos = getDemosByCategory('ui-design');
  assert.equal(uiDemos.length, 1);
  const uiDemo = uiDemos[0];
  assert.equal(uiDemo.title, 'Viral Game UI');
  assert.equal(uiDemo.mediaType, 'image');
  assert.equal(uiDemo.imageUrl, VIRAL_GAME_UI_IMAGE_URL);
  assert.equal(uiDemo.description.includes('Viral Game UI made by Balo_xio'), true);

  assert.equal(PREVIOUS_WORK_DEMOS.length, 3);
});



