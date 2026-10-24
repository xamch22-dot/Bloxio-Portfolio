import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ServerCommissionItem {
  id: string;
  recipientEmail: string;
  submitterUid: string;
  clientEmail: string;
  robloxUsername: string;
  robloxDisplayName: string;
  robloxUserId: string;
  robloxAvatarUrl: string;
  discordTag: string;
  workType: 'scripting' | 'ui-design' | 'modeling' | 'animating' | 'all-rounder';
  contractType: 'commission' | 'short-term' | 'long-term';
  currency: 'USD' | 'ROBUX';
  totalPrice: number;
  upfrontPrice: number;
  projectDetails: string;
  gameImages: string[];
  status: 'unread' | 'read' | 'starred' | 'accepted' | 'completed';
  createdAtIso: string;
}

function makeFallbackRobloxAvatarSvg(username: string): string {
  const clean = (username || 'RBX').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 2).toUpperCase() || 'RX';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="150" height="150"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#064e3b"/><stop offset="100%" stop-color="#090d0b"/></linearGradient></defs><rect width="150" height="150" rx="22" fill="url(#bg)"/><rect x="38" y="26" width="74" height="74" rx="14" fill="#d4d4d8" stroke="#10b981" stroke-width="3"/><circle cx="62" cy="56" r="5" fill="#18181b"/><circle cx="88" cy="56" r="5" fill="#18181b"/><path d="M60 76 Q75 86 90 76" stroke="#18181b" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M26 142 C26 112 124 112 124 142" fill="#10b981" opacity="0.85"/><text x="75" y="136" font-family="monospace" font-size="15" font-weight="bold" fill="#052e16" text-anchor="middle">${clean}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;
}

function makeSampleGameScreenshotSvg(title: string, accent: string): string {
  const safeTitle = title.replace(/&/g, 'AND').replace(/[^a-zA-Z0-9 _\-]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360"><rect width="640" height="360" fill="#090d0b"/><rect x="44" y="44" width="552" height="272" rx="12" fill="#0f1714" stroke="${accent}" stroke-width="2"/><rect x="70" y="74" width="260" height="28" rx="6" fill="${accent}" opacity="0.2"/><text x="84" y="93" font-family="monospace" font-size="13" font-weight="bold" fill="${accent}">${safeTitle}</text><rect x="70" y="122" width="310" height="160" rx="8" fill="#18181b" stroke="#27272a"/><rect x="400" y="122" width="168" height="74" rx="8" fill="#18181b" stroke="#27272a"/><rect x="400" y="208" width="168" height="74" rx="8" fill="#18181b" stroke="#27272a"/><circle cx="225" cy="202" r="42" fill="${accent}" opacity="0.25"/><polygon points="212,182 212,222 246,202" fill="${accent}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;
}

async function lookupRobloxProfile(rawUsername: string) {
  const cleanUsername = rawUsername.trim().replace(/^@/, '');
  if (!cleanUsername) {
    return {
      found: false,
      userId: '0',
      username: 'Unknown',
      displayName: 'Unknown',
      avatarUrl: makeFallbackRobloxAvatarSvg('RBX'),
      profileUrl: 'https://www.roblox.com',
    };
  }

  try {
    const userRes = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        usernames: [cleanUsername],
        excludeBannedUsers: false,
      }),
    });

    if (userRes.ok) {
      const userData = (await userRes.json()) as {
        data?: Array<{ id: number; name: string; displayName: string }>;
      };
      const matched = userData.data?.[0];
      if (matched && matched.id) {
        let avatarUrl = makeFallbackRobloxAvatarSvg(matched.name);
        try {
          const thumbRes = await fetch(
            `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${matched.id}&size=150x150&format=Png&isCircular=false`,
            { headers: { Accept: 'application/json' } }
          );
          if (thumbRes.ok) {
            const thumbData = (await thumbRes.json()) as {
              data?: Array<{ imageUrl?: string; state?: string }>;
            };
            const fetchedUrl = thumbData.data?.[0]?.imageUrl;
            if (fetchedUrl) {
              avatarUrl = fetchedUrl;
            }
          }
        } catch {
          // Keep clean fallback SVG if thumbnail endpoint times out
        }

        return {
          found: true,
          id: String(matched.id),
          userId: String(matched.id),
          name: matched.name,
          username: matched.name,
          displayName: matched.displayName || matched.name,
          avatarUrl,
          profileUrl: `https://www.roblox.com/users/${matched.id}/profile`,
        };
      }
    }
  } catch {
    // Fallback if external network is restricted
  }

  return {
    found: false,
    id: '156',
    userId: '156',
    name: cleanUsername,
    username: cleanUsername,
    displayName: cleanUsername,
    avatarUrl: makeFallbackRobloxAvatarSvg(cleanUsername),
    profileUrl: `https://www.roblox.com/search/users?keyword=${encodeURIComponent(cleanUsername)}`,
  };
}

// Seed with one realistic commission inquiry so the inbox immediately demonstrates the Roblox avatar + Gmail + game screenshot workflow
const serverCommissions: ServerCommissionItem[] = [
  {
    id: 'comm_seed_builderman',
    recipientEmail: 'xamch22@gmail.com',
    submitterUid: 'seed_system_user',
    clientEmail: 'david.studio.lead@gmail.com',
    robloxUsername: 'Builderman',
    robloxDisplayName: 'Builderman',
    robloxUserId: '156',
    robloxAvatarUrl: makeFallbackRobloxAvatarSvg('BM'),
    discordTag: 'builderman_dev',
    workType: 'all-rounder',
    contractType: 'short-term',
    currency: 'ROBUX',
    totalPrice: 20000,
    upfrontPrice: 8000,
    projectDetails:
      'Hey balo_xio! We need help finishing our Anime Battlegrounds lobby UI, 2 custom sword meshes, R15 dash animations, and the server-side cooldown script. Ready to pay the 40% upfront (8,000 Robux) today.',
    gameImages: [
      makeSampleGameScreenshotSvg('ANIME BATTLEGROUNDS — LOBBY MAP', '#10b981'),
      makeSampleGameScreenshotSvg('CUSTOM HUD & INVENTORY LAYOUT', '#34d399'),
    ],
    status: 'unread',
    createdAtIso: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
];

// Try to hydrate the seed commission's real Builderman avatar on startup
lookupRobloxProfile('Builderman')
  .then((profile) => {
    if (profile.found && serverCommissions[0]) {
      serverCommissions[0].robloxAvatarUrl = profile.avatarUrl;
      serverCommissions[0].robloxUserId = profile.userId;
      serverCommissions[0].robloxDisplayName = profile.displayName;
    }
  })
  .catch(() => {});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // Roblox Avatar Bot Endpoint
  app.get('/api/roblox-user', async (req, res) => {
    const username = String(req.query.username || '').trim();
    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }
    const result = await lookupRobloxProfile(username);
    res.json(result);
  });

  // Roblox Gamepass Ownership Verification Bot Endpoint
  const handleVerifyGamepass = async (req: express.Request, res: express.Response) => {
    const params = req.method === 'POST' ? req.body || {} : req.query || {};
    const rawUsername = String(params.username || '').trim();
    const gamePassId = String(params.gamePassId || '').trim().replace(/[^0-9]/g, '');
    const creationId = String(params.creationId || '').trim();
    const claimCode = String(params.claimCode || '').trim();

    if (!rawUsername || rawUsername.length < 2) {
      res.status(400).json({
        verified: false,
        owned: false,
        error: 'Please enter a valid Roblox username (at least 2 characters).',
      });
      return;
    }

    if (!gamePassId) {
      res.status(400).json({
        verified: false,
        owned: false,
        error: 'Missing Roblox Gamepass ID.',
      });
      return;
    }

    const profile = await lookupRobloxProfile(rawUsername);
    const userId = profile.userId;
    const inventoryApiUrl = `https://inventory.roblox.com/v1/users/${encodeURIComponent(userId)}/items/GamePass/${encodeURIComponent(gamePassId)}`;
    const gamePassUrl = `https://www.roblox.com/game-pass/${encodeURIComponent(gamePassId)}`;

    const validClaimSecret = process.env.GAMEPASS_CLAIM_SECRET || 'BALO-GAMEPASS-VERIFIED';
    if (claimCode && claimCode.toUpperCase() === validClaimSecret.toUpperCase()) {
      res.json({
        verified: true,
        owned: true,
        inventoryPublic: true,
        userId,
        username: profile.username,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        gamePassId,
        gamePassUrl,
        creationId,
        checkedEndpoint: inventoryApiUrl,
        message: `Gamepass #${gamePassId} verified for @${profile.username}! Creation unlocked.`,
      });
      return;
    }

    const openCloudKey = process.env.ROBLOX_OPEN_CLOUD_API_KEY;
    if (openCloudKey) {
      try {
        const cloudUrl = `https://apis.roblox.com/cloud/v2/users/${encodeURIComponent(userId)}/inventory-items?filter=gamePassIds=${encodeURIComponent(gamePassId)}`;
        const cloudRes = await fetch(cloudUrl, {
          headers: {
            'x-api-key': openCloudKey,
            Accept: 'application/json',
          },
        });
        if (cloudRes.ok) {
          const cloudJson = (await cloudRes.json()) as { inventoryItems?: unknown[] };
          if (Array.isArray(cloudJson.inventoryItems) && cloudJson.inventoryItems.length > 0) {
            res.json({
              verified: true,
              owned: true,
              inventoryPublic: true,
              userId,
              username: profile.username,
              displayName: profile.displayName,
              avatarUrl: profile.avatarUrl,
              gamePassId,
              gamePassUrl,
              creationId,
              checkedEndpoint: cloudUrl,
              message: `Gamepass #${gamePassId} ownership confirmed via Roblox Open Cloud for @${profile.username}!`,
            });
            return;
          }
        }
      } catch {}
    }

    let owned = false;
    let inventoryPublic = true;
    const candidatePassIds =
      gamePassId === '2053169441' ? ['2053169441', '2053109415'] : [gamePassId];

    for (const passIdToCheck of candidatePassIds) {
      try {
        const checkUrl = `https://inventory.roblox.com/v1/users/${encodeURIComponent(userId)}/items/GamePass/${encodeURIComponent(passIdToCheck)}`;
        const invRes = await fetch(checkUrl, {
          headers: { Accept: 'application/json' },
        });
        if (invRes.ok) {
          const invJson = (await invRes.json()) as { data?: Array<{ id?: number | string }> };
          if (
            Array.isArray(invJson.data) &&
            invJson.data.some((item) => String(item.id) === String(passIdToCheck))
          ) {
            owned = true;
            break;
          }
        } else if (invRes.status === 403) {
          inventoryPublic = false;
        }
      } catch {}
    }

    if (owned) {
      res.json({
        verified: true,
        owned: true,
        inventoryPublic: true,
        userId,
        username: profile.username,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        gamePassId,
        gamePassUrl,
        creationId,
        checkedEndpoint: inventoryApiUrl,
        message: `Roblox Bot confirmed @${profile.username} owns Gamepass #${gamePassId}! Creation unlocked.`,
      });
      return;
    }

    res.json({
      verified: false,
      owned: false,
      inventoryPublic,
      userId,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      gamePassId,
      gamePassUrl,
      creationId,
      checkedEndpoint: inventoryApiUrl,
      message: !inventoryPublic
        ? `Roblox Inventory for @${profile.username} is set to Private. Set your Roblox Inventory Privacy to Everyone, or enter your Gamepass Claim Code.`
        : `Gamepass #${gamePassId} was not found in @${profile.username}'s Roblox inventory yet. Buy the Gamepass on Roblox first, then click Verify Ownership.`,
    });
  };

  app.get('/api/verify-gamepass', handleVerifyGamepass);
  app.post('/api/verify-gamepass', handleVerifyGamepass);

  // Get Commissions Relay
  app.get('/api/commissions', (_req, res) => {
    res.json({ commissions: serverCommissions });
  });

  // Submit New Commission Application (automatically invokes Roblox Avatar Bot if avatarUrl is missing)
  app.post('/api/commissions', async (req, res) => {
    try {
      const body = req.body || {};
      const robloxUsername = String(body.robloxUsername || '').trim();
      const clientEmail = String(body.clientEmail || '').trim();
      const projectDetails = String(body.projectDetails || '').trim();

      if (!robloxUsername || !clientEmail || !projectDetails) {
        res.status(400).json({ error: 'Gmail, Roblox username, and project details are required.' });
        return;
      }

      let avatarUrl = String(body.robloxAvatarUrl || '').trim();
      let robloxUserId = String(body.robloxUserId || '').trim();
      let robloxDisplayName = String(body.robloxDisplayName || '').trim();

      if (!avatarUrl || !robloxUserId) {
        const lookedUp = await lookupRobloxProfile(robloxUsername);
        avatarUrl = lookedUp.avatarUrl;
        robloxUserId = lookedUp.userId;
        robloxDisplayName = lookedUp.displayName;
      }

      const newItem: ServerCommissionItem = {
        id: String(body.id || `comm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
        recipientEmail: 'xamch22@gmail.com',
        submitterUid: String(body.submitterUid || 'guest_client'),
        clientEmail: clientEmail.slice(0, 120),
        robloxUsername: robloxUsername.slice(0, 60),
        robloxDisplayName: (robloxDisplayName || robloxUsername).slice(0, 60),
        robloxUserId: (robloxUserId || '0').slice(0, 40),
        robloxAvatarUrl: avatarUrl.slice(0, 600),
        discordTag: String(body.discordTag || 'Not provided').slice(0, 80),
        workType: body.workType || 'scripting',
        contractType: body.contractType || 'commission',
        currency: body.currency === 'ROBUX' ? 'ROBUX' : 'USD',
        totalPrice: Number(body.totalPrice) || 10,
        upfrontPrice: Number(body.upfrontPrice) || 4,
        projectDetails: projectDetails.slice(0, 3000),
        gameImages: Array.isArray(body.gameImages) ? body.gameImages.slice(0, 4) : [],
        status: 'unread',
        createdAtIso: new Date().toISOString(),
      };

      // Deduplicate by ID
      const existingIdx = serverCommissions.findIndex((c) => c.id === newItem.id);
      if (existingIdx >= 0) {
        serverCommissions[existingIdx] = newItem;
      } else {
        serverCommissions.unshift(newItem);
      }

      res.status(201).json({ commission: newItem });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  });

  // Update Commission Status
  app.patch('/api/commissions/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};
    const item = serverCommissions.find((c) => c.id === id);
    if (!item) {
      res.status(404).json({ error: 'Commission not found' });
      return;
    }
    if (['unread', 'read', 'starred', 'accepted', 'completed'].includes(status)) {
      item.status = status;
    }
    res.json({ commission: item });
  });

  // Delete Commission
  app.delete('/api/commissions/:id', (req, res) => {
    const { id } = req.params;
    const idx = serverCommissions.findIndex((c) => c.id === id);
    if (idx >= 0) {
      serverCommissions.splice(idx, 1);
    }
    res.json({ deleted: true });
  });

  // Download Full Website ZIP Archive
  app.get('/api/download-zip', (_req, res) => {
    const zipPath = path.join(__dirname, 'public', 'balo_xio-portfolio.zip');
    if (!fs.existsSync(zipPath)) {
      res.status(404).json({ error: 'ZIP archive not found' });
      return;
    }
    res.download(zipPath, 'balo_xio-portfolio.zip');
  });

  // Download Single Standalone HTML File for Google Sites
  app.get('/api/google-sites-html', (_req, res) => {
    const htmlPath = path.join(__dirname, 'public', 'balo_xio-google-sites.html');
    if (!fs.existsSync(htmlPath)) {
      res.status(404).json({ error: 'HTML file not found' });
      return;
    }
    res.download(htmlPath, 'balo_xio-google-sites.html');
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`balo_xio portfolio server running on http://localhost:${PORT}`);
  });
}

startServer();
