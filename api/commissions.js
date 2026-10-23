function makeFallbackRobloxAvatarSvg(username) {
  const clean =
    String(username || 'RBX')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .slice(0, 2)
      .toUpperCase() || 'RX';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="150" height="150"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#064e3b"/><stop offset="100%" stop-color="#090d0b"/></linearGradient></defs><rect width="150" height="150" rx="22" fill="url(#bg)"/><rect x="38" y="26" width="74" height="74" rx="14" fill="#d4d4d8" stroke="#10b981" stroke-width="3"/><circle cx="62" cy="56" r="5" fill="#18181b"/><circle cx="88" cy="56" r="5" fill="#18181b"/><path d="M60 76 Q75 86 90 76" stroke="#18181b" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M26 142 C26 112 124 112 124 142" fill="#10b981" opacity="0.85"/><text x="75" y="136" font-family="monospace" font-size="15" font-weight="bold" fill="#052e16" text-anchor="middle">${clean}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;
}

function makeSampleGameScreenshotSvg(title, accent) {
  const safeTitle = String(title).replace(/&/g, 'AND').replace(/[^a-zA-Z0-9 _\-]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360"><rect width="640" height="360" fill="#090d0b"/><rect x="44" y="44" width="552" height="272" rx="12" fill="#0f1714" stroke="${accent}" stroke-width="2"/><rect x="70" y="74" width="260" height="28" rx="6" fill="${accent}" opacity="0.2"/><text x="84" y="93" font-family="monospace" font-size="13" font-weight="bold" fill="${accent}">${safeTitle}</text><rect x="70" y="122" width="310" height="160" rx="8" fill="#18181b" stroke="#27272a"/><rect x="400" y="122" width="168" height="74" rx="8" fill="#18181b" stroke="#27272a"/><rect x="400" y="208" width="168" height="74" rx="8" fill="#18181b" stroke="#27272a"/><circle cx="225" cy="202" r="42" fill="${accent}" opacity="0.25"/><polygon points="212,182 212,222 246,202" fill="${accent}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;
}

const memoryCommissions = [
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
      makeSampleGameScreenshotSvg('ANIME BATTLEGROUNDS - LOBBY MAP', '#10b981'),
      makeSampleGameScreenshotSvg('CUSTOM HUD AND INVENTORY LAYOUT', '#34d399'),
    ],
    status: 'unread',
    createdAtIso: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
];

export default async function handler(req, res) {
  const method = req.method || 'GET';
  const id = req.query?.id;

  if (method === 'GET') {
    res.status(200).json({ commissions: memoryCommissions });
    return;
  }

  if (method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const robloxUsername = String(body.robloxUsername || '').trim();
    const clientEmail = String(body.clientEmail || '').trim();
    const projectDetails = String(body.projectDetails || '').trim();

    if (!robloxUsername || !clientEmail || !projectDetails) {
      res.status(400).json({ error: 'Gmail, Roblox username, and project details are required.' });
      return;
    }

    const newItem = {
      id: String(body.id || `comm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
      recipientEmail: 'xamch22@gmail.com',
      submitterUid: String(body.submitterUid || 'guest_client'),
      clientEmail: clientEmail.slice(0, 120),
      robloxUsername: robloxUsername.slice(0, 60),
      robloxDisplayName: String(body.robloxDisplayName || robloxUsername).slice(0, 60),
      robloxUserId: String(body.robloxUserId || '156').slice(0, 40),
      robloxAvatarUrl: String(body.robloxAvatarUrl || makeFallbackRobloxAvatarSvg(robloxUsername)).slice(0, 600),
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

    const existingIdx = memoryCommissions.findIndex((c) => c.id === newItem.id);
    if (existingIdx >= 0) {
      memoryCommissions[existingIdx] = newItem;
    } else {
      memoryCommissions.unshift(newItem);
    }

    res.status(201).json({ commission: newItem });
    return;
  }

  if (method === 'PATCH' && id) {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const item = memoryCommissions.find((c) => c.id === id);
    if (item && body.status) {
      item.status = body.status;
    }
    res.status(200).json({ commission: item || null });
    return;
  }

  if (method === 'DELETE' && id) {
    const idx = memoryCommissions.findIndex((c) => c.id === id);
    if (idx >= 0) {
      memoryCommissions.splice(idx, 1);
    }
    res.status(200).json({ deleted: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
