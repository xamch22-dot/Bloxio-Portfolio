import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HACKER_SENTENCES,
  SENTENCE_ANIMATION_DURATION_MS,
  VIDEO_LOOP_START_SECONDS,
  DISCIPLINE_EXPERIENCES,
  DISCIPLINE_PRICING_TABLE,
  PREVIOUS_WORK_DEMOS,
  COMBAT_SYSTEM_ASSET_URL,
  UI_GUNS_FRAME_IMAGE_URL,
  UI_RAINBOW_STORE_IMAGE_URL,
  UI_GREEN_SHOP_HEADER_IMAGE_URL,
  UI_GOLD_SLOT_IMAGE_URL,
  UI_CLOSE_BUTTON_IMAGE_URL,
  VIRAL_GAME_UI_IMAGE_URL,
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

test('HACKER_SENTENCES and DISCIPLINE_EXPERIENCES contain strictly Scripting and UI Design', () => {
  assert.equal(SENTENCE_ANIMATION_DURATION_MS, 1000);
  assert.equal(VIDEO_LOOP_START_SECONDS, 2.0);
  assert.equal(HACKER_SENTENCES.length, 2);
  assert.deepEqual(
    HACKER_SENTENCES.map((s) => s.sentence),
    ['I am a Scripter.', 'I am a UI Designer.']
  );

  assert.equal(DISCIPLINE_EXPERIENCES.length, 2);
  const byId = Object.fromEntries(DISCIPLINE_EXPERIENCES.map((d) => [d.id, d.yearsDisplay]));
  assert.equal(byId['scripting'], '3+ Years');
  assert.equal(byId['ui-design'], '2+ Years');
  assert.equal('modeling' in byId, false);
  assert.equal('animating' in byId, false);
});

test('scrambleText progresses deterministically without symbol clutter and resolves at 1.0', () => {
  const target = 'I am a Scripter.';
  assert.equal(scrambleText(target, 1), target);
  const mid = scrambleText(target, 0.5);
  assert.equal(mid.startsWith('I am a S'), true);
  assert.equal(/[\[\]\$\=]/.test(mid), false);
});

test('calculateCommissionBreakdown matches Scripting and UI Design pricing tiers in USD and Robux', () => {
  assert.deepEqual(Object.keys(DISCIPLINE_PRICING_TABLE), ['scripting', 'ui-design']);

  // 1. Scripting: Per Task = $15 / 5,000 R$, Short-Term = $75 / 15,000 R$, Long-Term = $140 / 65,000 R$
  const scriptingPerTask = calculateCommissionBreakdown({
    disciplineId: 'scripting',
    contractType: 'commission',
    currency: 'USD',
  });
  assert.equal(scriptingPerTask.totalAmount, 15);
  assert.equal(scriptingPerTask.contractLabel, 'Per Task');
  assert.equal(scriptingPerTask.summaryText.includes('Paid Per Task Only'), true);

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

  // 2. UI Design: Per Task = $10 / 1,500 R$, Short-Term = $34 / 7,000 R$, Long-Term = $95 / 12,000 R$
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
});

test('PREVIOUS_WORK_DEMOS contains strictly Scripting and UI Design demos with all 5 uploaded UI images', () => {
  assert.equal(PREVIOUS_WORK_DEMOS.length, 2);

  const scriptingDemos = getDemosByCategory('scripting');
  assert.equal(scriptingDemos.length, 1);
  const combatDemo = scriptingDemos[0];
  assert.equal(combatDemo.title, 'The Combat System By Balo_xio');
  assert.equal(combatDemo.videoUrl, '/assets/aistudio/1023_0f48f1c9.mp4');
  assert.equal(combatDemo.tryAssetUrl, COMBAT_SYSTEM_ASSET_URL);

  const uiDemos = getDemosByCategory('ui-design');
  assert.equal(uiDemos.length, 1);
  const uiDemo = uiDemos[0];
  assert.equal(uiDemo.mediaType, 'image');
  assert.equal(uiDemo.imageUrl, UI_GUNS_FRAME_IMAGE_URL);
  assert.equal(uiDemo.galleryImages?.length, 6);

  const galleryUrls = (uiDemo.galleryImages || []).map((img) => img.url);
  assert.equal(galleryUrls.includes(UI_GUNS_FRAME_IMAGE_URL), true);
  assert.equal(galleryUrls.includes(UI_RAINBOW_STORE_IMAGE_URL), true);
  assert.equal(galleryUrls.includes(UI_GREEN_SHOP_HEADER_IMAGE_URL), true);
  assert.equal(galleryUrls.includes(UI_GOLD_SLOT_IMAGE_URL), true);
  assert.equal(galleryUrls.includes(UI_CLOSE_BUTTON_IMAGE_URL), true);
  assert.equal(galleryUrls.includes(VIRAL_GAME_UI_IMAGE_URL), true);
});

test('SFX_AUDIO_CONFIG defines exact trimmed active audio windows for click and page-change YouTube links', () => {
  const clickCfg = SFX_AUDIO_CONFIG.click;
  assert.equal(clickCfg.youtubeUrl, 'https://youtu.be/nUsHboYC5zc');
  assert.equal(clickCfg.videoId, 'nUsHboYC5zc');
  assert.equal(clickCfg.activeStartSec > 0, true);
  assert.equal(clickCfg.activeEndSec < clickCfg.originalDurationSec, true);
  assert.equal(clickCfg.localTrimmedUrl, '/assets/sfx/click_trimmed.wav');

  const pageCfg = SFX_AUDIO_CONFIG['page-change'];
  assert.equal(pageCfg.youtubeUrl, 'https://youtu.be/y8BpZl32S-Q');
  assert.equal(pageCfg.videoId, 'y8BpZl32S-Q');
  assert.equal(pageCfg.activeStartSec > 0, true);
  assert.equal(pageCfg.activeEndSec < pageCfg.originalDurationSec, true);
  assert.equal(pageCfg.localTrimmedUrl, '/assets/sfx/camera_flash_trimmed.wav');
});

test('getCommissionCooldownStatus enforces a strict 1-hour (3,600,000 ms) anti-spam cooldown', () => {
  assert.equal(COMMISSION_COOLDOWN_MS, 3600000);

  const none = getCommissionCooldownStatus(null, 1000000);
  assert.equal(none.isOnCooldown, false);
  assert.equal(none.remainingMs, 0);

  const baseTs = 1700000000000;
  const after15Min = getCommissionCooldownStatus(baseTs, baseTs + 15 * 60 * 1000);
  assert.equal(after15Min.isOnCooldown, true);
  assert.equal(after15Min.remainingMinutes, 45);
  assert.equal(after15Min.remainingSeconds, 0);
  assert.equal(after15Min.formattedRemaining, '45m 00s');

  const after60Min = getCommissionCooldownStatus(baseTs, baseTs + 60 * 60 * 1000);
  assert.equal(after60Min.isOnCooldown, false);
  assert.equal(after60Min.remainingMs, 0);
});

test('formatCommissionEmailPayload targets https://formspree.io/f/mqppkrdd and xamch@gmail.com', () => {
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

  const ownedPayload = {
    previousPageCursor: null,
    nextPageCursor: null,
    data: [{ type: 'GamePass', id: 2053169441, name: 'A Combat System By Balo_xio', instanceId: null }],
  };
  assert.equal(evaluateGamepassOwnershipResponse(ownedPayload, '2053169441'), true);
  assert.equal(evaluateGamepassOwnershipResponse(ownedPayload, '999999999'), false);
  assert.equal(evaluateGamepassOwnershipResponse({ data: [] }, '2053169441'), false);
  assert.equal(evaluateGamepassOwnershipResponse(null, '2053169441'), false);

  for (const demo of PREVIOUS_WORK_DEMOS) {
    assert.equal(demo.gamePassId, '2053169441');
    assert.equal((demo.gamePassPriceRobux || 0) > 0, true);
    assert.equal(demo.unlockLinkUrl, COMBAT_SYSTEM_ASSET_URL);
  }
});
