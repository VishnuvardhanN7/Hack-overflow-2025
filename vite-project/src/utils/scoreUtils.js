export function getVerifiedSkills(skills) {
  if (!Array.isArray(skills)) return [];
  return skills.filter((s) => s && s.verified === true);
}

// Return null when nothing verified (so UI can show "Verify a project")
export function calculateScore(skills) {
  const verified = getVerifiedSkills(skills);
  if (verified.length === 0) return null;

  const total = verified.reduce((sum, s) => sum + (Number(s.level) || 0), 0);
  const avg = total / verified.length; // 0..100

  return Math.round((avg / 100) * 1000);
}
