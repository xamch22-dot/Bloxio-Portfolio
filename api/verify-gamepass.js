function makeFallbackRobloxAvatarSvg(username) {
  const clean =
    String(username || 'RBX')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .slice(0, 2)
      .toUpperCase() || 'RX';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="150" height="150"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#064e3b"/><stop offset="100%" stop-color="#090d0b"/></linearGradient></defs><rect width="150" height="150" rx="22" fill="url(#bg)"/><rect x="38" y="26" width="74" height="74" rx="14" fill="#d4d4d8" stroke="#10b981" stroke-width="3"/><circle cx="62" cy="56" r="5" fill="#18181b"/><circle cx="88" cy="56" r="5" fill="#18181b"/><path d="M60 76 Q75 86 90 76" stroke="#18181b" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M26 142 C26 112 124 112 124 142" fill="#10b981" opacity="0.85"/><text x="75" y="136" font-family="monospace" font-size="15" font-weight="bold" fill="#052e16" text-anchor="middle">${clean}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;
}

async function resolveRobloxUser(rawUsername, providedUserId) {
  const cleanUsername = String(rawUsername || '')
    .trim()
    .replace(/^@/, '');

  if (!cleanUsername && !providedUserId) {
    return null;
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
      const userData = await userRes.json();
      const matched = userData?.data?.[0];
      if (matched && matched.id) {
        let avatarUrl = makeFallbackRobloxAvatarSvg(matched.name);
        try {
          const thumbRes = await fetch(
            `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${matched.id}&size=150x150&format=Png&isCircular=false`,
            { headers: { Accept: 'application/json' } }
          );
          if (thumbRes.ok) {
            const thumbData = await thumbRes.json();
            if (thumbData?.data?.[0]?.imageUrl) {
              avatarUrl = thumbData.data[0].imageUrl;
            }
          }
        } catch {}

        return {
          found: true,
          userId: String(matched.id),
          username: matched.name,
          displayName: matched.displayName || matched.name,
          avatarUrl,
        };
      }
    }
  } catch {}

  return {
    found: false,
    userId: String(providedUserId || '156'),
    username: cleanUsername || 'RobloxPlayer',
    displayName: cleanUsername || 'RobloxPlayer',
    avatarUrl: makeFallbackRobloxAvatarSvg(cleanUsername || 'RX'),
  };
}

export default async function handler(req, res) {
  const params =
    req.method === 'POST'
      ? typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : req.body || {}
      : req.query || {};

  const rawUsername = String(params.username || '').trim();
  const rawUserId = String(params.userId || '').trim();
  const gamePassId = String(params.gamePassId || '')
    .trim()
    .replace(/[^0-9]/g, '');
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

  const profile = await resolveRobloxUser(rawUsername, rawUserId);
  const userId = profile.userId;
  const inventoryApiUrl = `https://inventory.roblox.com/v1/users/${encodeURIComponent(userId)}/items/GamePass/${encodeURIComponent(gamePassId)}`;
  const gamePassUrl = `https://www.roblox.com/game-pass/${encodeURIComponent(gamePassId)}`;

  // 1. Check if owner / claim secret was provided
  const validClaimSecret = process.env.GAMEPASS_CLAIM_SECRET || 'BALO-GAMEPASS-VERIFIED';
  if (claimCode && claimCode.toUpperCase() === validClaimSecret.toUpperCase()) {
    res.status(200).json({
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

  // 2. Optional Roblox Open Cloud API v2 check (if ROBLOX_OPEN_CLOUD_API_KEY is configured in Vercel)
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
        const cloudJson = await cloudRes.json();
        if (Array.isArray(cloudJson?.inventoryItems) && cloudJson.inventoryItems.length > 0) {
          res.status(200).json({
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

  // 3. Official Public Roblox Inventory v1 API Check (Zero API Key Required)
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
        const invJson = await invRes.json();
        if (
          Array.isArray(invJson?.data) &&
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

  if (!owned) {
    try {
      const privacyRes = await fetch(
        `https://inventory.roblox.com/v1/users/${encodeURIComponent(userId)}/can-view-inventory`,
        { headers: { Accept: 'application/json' } }
      );
      if (privacyRes.ok) {
        const privacyJson = await privacyRes.json();
        if (privacyJson?.canView === false) {
          inventoryPublic = false;
        }
      }
    } catch {}
  }

  if (owned) {
    res.status(200).json({
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

  res.status(200).json({
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
      ? ` Roblox Inventory for @${profile.username} is set to Private. Set your Roblox Inventory Privacy to Everyone, or enter your Gamepass Claim Code.`
      : `Gamepass #${gamePassId} was not found in @${profile.username}'s Roblox inventory yet. Buy the Gamepass on Roblox first, then click Verify Ownership.`,
  });
}
