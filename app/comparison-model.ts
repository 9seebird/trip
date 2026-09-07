export function comparisonState(value:number) {
  const before = Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : 50;
  return {before, after:100-before, showBefore:before>0, showAfter:before<100};
}
