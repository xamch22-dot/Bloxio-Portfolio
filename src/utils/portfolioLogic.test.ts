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
  MODELING_CHAIR_IMAGE_URL,
  MODELING_SEA_BEAST_IMAGE_URL,
  SFX_AUDIO_CONFIG,
  FORMSPREE_ENDPOINT,
  COMMISSION_RECIPIENT_EMAIL,
  COMMISSION_COOLDOWN_MS,
  getCommissionCooldownStatus,
  formatCommissionEmailPayload,
  getDemosByCategory,
  scrambleText,
  calculateCommissionBreakdown,
  getRobloxGamepassCheckoutUrl,
  getRobloxInventoryCheckUrl,
  evaluateGamepassOwnershipResponse,
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

  const modelingDemos = getDemosByCategory('modeling');
  assert.equal(modelingDemos.length, 1);
  const modelingDemo = modelingDemos[0];
  assert.equal(modelingDemo.title, 'Highly Polished Chair & Sea Beast');
  assert.equal(modelingDemo.galleryImages?.length, 2);
  assert.equal(modelingDemo.galleryImages?.[0].url, MODELING_CHAIR_IMAGE_URL);
  assert.equal(modelingDemo.galleryImages?.[0].label, 'Highly Polished Chair');
  assert.equal(modelingDemo.galleryImages?.[1].url, MODELING_SEA_BEAST_IMAGE_URL);
  assert.equal(modelingDemo.galleryImages?.[1].label, 'Sea Beast');

  assert.equal(PREVIOUS_WORK_DEMOS.length, 4);
});

test('SFX_AUDIO_CONFIG defines exact trimmed active audio windows for click and page-change YouTube links', () => {
  const clickCfg = SFX_AUDIO_CONFIG.click;
  assert.equal(clickCfg.youtubeUrl, 'https://youtu.be/nUsHboYC5zc');
  assert.equal(clickCfg.videoId, 'nUsHboYC5zc');
  assert.equal(clickCfg.activeStartSec > 0, true);
  assert.equal(clickCfg.activeEndSec < clickCfg.originalDurationSec, true);
  assert.equal(
    Math.abs(clickCfg.activeEndSec - clickCfg.activeStartSec - clickCfg.trimmedDurationSec) < 0.001,
    true
  );
  assert.equal(clickCfg.localTrimmedUrl, '/assets/sfx/click_trimmed.wav');

  const pageCfg = SFX_AUDIO_CONFIG['page-change'];
  assert.equal(pageCfg.youtubeUrl, 'https://youtu.be/y8BpZl32S-Q');
  assert.equal(pageCfg.videoId, 'y8BpZl32S-Q');
  assert.equal(pageCfg.activeStartSec > 0, true);
  assert.equal(pageCfg.activeEndSec < pageCfg.originalDurationSec, true);
  assert.equal(
    Math.abs(pageCfg.activeEndSec - pageCfg.activeStartSec - pageCfg.trimmedDurationSec) < 0.001,
    true
  );
  assert.equal(pageCfg.localTrimmedUrl, '/assets/sfx/camera_flash_trimmed.wav');
});

test('getCommissionCooldownStatus enforces a strict 1-hour (3,600,000 ms) anti-spam cooldown', () => {
  assert.equal(COMMISSION_COOLDOWN_MS, 3600000);

  // No previous submission
  const none = getCommissionCooldownStatus(null, 1000000);
  assert.equal(none.isOnCooldown, false);
  assert.equal(none.remainingMs, 0);

  // 15 minutes after submission -> 45m 00s remaining
  const baseTs = 1700000000000;
  const after15Min = getCommissionCooldownStatus(baseTs, baseTs + 15 * 60 * 1000);
  assert.equal(after15Min.isOnCooldown, true);
  assert.equal(after15Min.remainingMinutes, 45);
  assert.equal(after15Min.remainingSeconds, 0);
  assert.equal(after15Min.formattedRemaining, '45m 00s');

  // Exactly 60 minutes after submission -> cooldown expired
  const after60Min = getCommissionCooldownStatus(baseTs, baseTs + 60 * 60 * 1000);
  assert.equal(after60Min.isOnCooldown, false);
  assert.equal(after60Min.remainingMs, 0);
});

test('formatCommissionEmailPayload targets https://formspree.io/f/mqppkrdd and xamch@gmail.com with aligned details and description', () => {
  assert.equal(FORMSPREE_ENDPOINT, 'https://formspree.io/f/mqppkrdd');
  assert.equal(COMMISSION_RECIPIENT_EMAIL, 'xamch@gmail.com');

  const payload = formatCommissionEmailPayload({
    commissionId: 'comm_test_01',
    clientEmail: 'player@gmail.com',
    robloxUsername: 'Builderman',
    robloxDisplayName: 'Builderman',
    robloxUserId: '156',
    discordTag: 'builder#0001',
    disciplineId: 'scripting',
    contractType: 'short-term',
    currency: 'USD',
    projectDetails: 'Need a complete server-authoritative combat system with raycast hitboxes.',
    screenshotCount: 2,
    submittedAtIso: '2026-10-23T20:00:00.000Z',
  });

  assert.equal(payload['01_Recipient_Gmail'], 'xamch@gmail.com');
  assert.equal(payload['02_Client_Gmail'], 'player@gmail.com');
  assert.equal(payload['03_Roblox_Username'], '@Builderman (Builderman)');
  assert.equal(payload['10_Total_Commission_Rate'], '$75 USD ($75 USD / 15,000 R$)');
  assert.equal(payload['11_Mandatory_40_Percent_Upfront'], '$30 USD');
  assert.equal(payload['15_Project_Description'], 'Need a complete server-authoritative combat system with raycast hitboxes.');
  assert.equal(payload.message.includes('[01. CLIENT & CONTACT DETAILS]'), true);
  assert.equal(payload.message.includes('[02. COMMISSION PACKAGE & PRICING BREAKDOWN]'), true);
  assert.equal(payload.message.includes('[03. PROJECT SCOPE & DESCRIPTION]'), true);
  assert.equal(
    payload.message.indexOf('[01. CLIENT & CONTACT DETAILS]') <
      payload.message.indexOf('[03. PROJECT SCOPE & DESCRIPTION]'),
    true
  );
});

test('Roblox Gamepass checkout URL, inventory check URL, and ownership evaluator work accurately', () => {
  assert.equal(
    getRobloxGamepassCheckoutUrl('2053169441'),
    'https://www.roblox.com/game-pass/2053169441'
  );
  assert.equal(
    getRobloxInventoryCheckUrl('8627411391', '2053169441'),
    'https://inventory.roblox.com/v1/users/8627411391/items/GamePass/2053169441'
  );

  // Owned response from Roblox Inventory API
  const ownedPayload = {
    previousPageCursor: null,
    nextPageCursor: null,
    data: [{ type: 'GamePass', id: 2053169441, name: 'A Combat System By Balo_xio', instanceId: null }],
  };
  assert.equal(evaluateGamepassOwnershipResponse(ownedPayload, '2053169441'), true);
  assert.equal(evaluateGamepassOwnershipResponse(ownedPayload, '999999999'), false);
  assert.equal(evaluateGamepassOwnershipResponse({ data: [] }, '2053169441'), false);
  assert.equal(evaluateGamepassOwnershipResponse(null, '2053169441'), false);

  // Every creation demo has a configured Gamepass ID, price, and unlockable link
  assert.equal(
    COMBAT_SYSTEM_ASSET_URL,
    'https://create.roblox.com/store/asset/113210150229519?viewFromStudio=true&keyword=&searchId=18788722-cf9d-4565-9e61-ae99826d0e18'
  );
  for (const demo of PREVIOUS_WORK_DEMOS) {
    assert.equal(demo.gamePassId, '2053169441');
    assert.equal((demo.gamePassPriceRobux || 0) > 0, true);
    assert.equal(demo.unlockLinkUrl, COMBAT_SYSTEM_ASSET_URL);
  }
});
