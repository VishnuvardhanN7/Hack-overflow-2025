function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

function normalizeLevel(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function toMap(skills) {
  const m = new Map();
  (Array.isArray(skills) ? skills : []).forEach((s) => {
    if (!s?.name) return;
    m.set(String(s.name).trim(), normalizeLevel(s.level));
  });
  return m;
}

export function calculateScore(skills, roleProfile) {
  const list = Array.isArray(skills) ? skills : [];
  if (list.length === 0) return 0;

  if (roleProfile?.required?.length) {
    const m = toMap(list);
    const req = roleProfile.required;

    const totalWeight = req.reduce((sum, r) => sum + (Number(r.weight) || 1), 0) || 1;

    const coverage =
      req.reduce((sum, r) => {
        const w = Number(r.weight) || 1;
        const target = Math.max(1, normalizeLevel(r.target));
        const current = m.get(r.name) ?? 0;
        return sum + clamp01(current / target) * w;
      }, 0) / totalWeight;

    return Math.round(coverage * 1000);
  }

  const total = list.reduce((sum, s) => sum + normalizeLevel(s.level), 0);
  const avg = total / list.length;
  return Math.round((avg / 100) * 1000);
}

export function generateRoadmap(skills, roleProfile) {
  const list = Array.isArray(skills) ? skills : [];
  const m = toMap(list);

  if (roleProfile?.required?.length) {
    const gaps = roleProfile.required
      .map((r) => {
        const current = m.get(r.name) ?? 0;
        const target = normalizeLevel(r.target);
        const gap = Math.max(0, target - current);
        const weight = Number(r.weight) || 1;
        return { ...r, current, gap, weight };
      })
      .filter((x) => x.gap > 0)
      .sort((a, b) => b.gap * b.weight - a.gap * a.weight);

    return gaps.map((g) => ({
      key: g.name,
      title: `Level up ${g.name}`,
      detail: `Current ${g.current}/100 → Target ${g.target}/100`,
      points: Math.max(20, Math.min(120, Math.round(g.gap * 1.6))),
    }));
  }

  return list
    .filter((s) => normalizeLevel(s.level) < 60)
    .map((s) => ({
      key: s.name,
      title: `Improve ${s.name}`,
      detail: `Raise to 60+ for better readiness`,
      points: 50,
    }));
}
