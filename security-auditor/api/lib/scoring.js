const SEVERITY_WEIGHTS = { critical: 30, high: 20, medium: 10, low: 5, none: 0 };

export function computeScore(findings) {
  const totalDeductions = findings
    .filter((f) => !f.pass)
    .reduce((sum, f) => sum + (SEVERITY_WEIGHTS[f.severity] ?? 0), 0);

  const score = Math.max(0, 100 - totalDeductions);

  let grade;
  if (score >= 90) grade = "A";
  else if (score >= 75) grade = "B";
  else if (score >= 60) grade = "C";
  else if (score >= 40) grade = "D";
  else grade = "F";

  return { score, grade };
}
