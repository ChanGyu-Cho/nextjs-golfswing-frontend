export function findMetric(parsedJson: any, key: string) {
  if (!parsedJson) return null;
  const metrics = parsedJson.metrics || {};
  if (metrics[key]) return metrics[key];
  // search nested under each top-level metric
  for (const k of Object.keys(metrics)) {
    const v = metrics[k];
    if (!v) continue;
    if (v.metrics && typeof v.metrics === 'object') {
      if (v.metrics[key]) return v.metrics[key];
      // sometimes nested deeper
      for (const kk of Object.keys(v.metrics)) {
        const vv = v.metrics[kk];
        if (vv && vv.metrics && typeof vv.metrics === 'object' && vv.metrics[key]) return vv.metrics[key];
      }
    }
  }
  // fallback top-level
  if (parsedJson[key]) return parsedJson[key];
  return null;
}
