function makeFallbackRobloxAvatarSvg(username) {
  const clean =
    String(username || 'RBX')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .slice(0, 2)
      .toUpperCase() || 'RX';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="150" height="150"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#064e3b"/><stop offset="100%" stop-color="#090d0b"/></linearGradient></defs><rect width="150" height="150" rx="22" fill="url(#bg)"/><rect x="38" y="26" width="74" height="74" rx="14" fill="#d4d4d8" stroke="#10b981" stroke-width="3"/><circle cx="62" cy="56" r="5" fill="#18181b"/><circle cx="88" cy="56" r="5" fill="#18181b"/><path d="M60 76 Q75 86 90 76" stroke="#18181b" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M26 142 C26 112 124 112 124 142" fill="#10b981" opacity="0.85"/><text x="75" y="136" font-family="monospace" font-size="15" font-weight="bold" fill="#052e16" text-anchor="middle">${clean}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;
}

export default async function handler(req, res) {
  const rawUsername = String(req.query?.username || '').trim();
  const cleanUsername = rawUsername.replace(/^@/, '');

  if (!cleanUsername) {
    res.status(400).json({ error: 'Username is required' });
    return;
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
            const fetchedUrl = thumbData?.data?.[0]?.imageUrl;
            if (fetchedUrl) {
              avatarUrl = fetchedUrl;
            }
          }
        } catch {}

        res.status(200).json({
          found: true,
          id: String(matched.id),
          userId: String(matched.id),
          name: matched.name,
          username: matched.name,
          displayName: matched.displayName || matched.name,
          avatarUrl,
          profileUrl: `https://www.roblox.com/users/${matched.id}/profile`,
        });
        return;
      }
    }
  } catch {}

  res.status(200).json({
    found: false,
    id: '156',
    userId: '156',
    name: cleanUsername,
    username: cleanUsername,
    displayName: cleanUsername,
    avatarUrl: makeFallbackRobloxAvatarSvg(cleanUsername),
    profileUrl: `https://www.roblox.com/search/users?keyword=${encodeURIComponent(cleanUsername)}`,
  });
}
