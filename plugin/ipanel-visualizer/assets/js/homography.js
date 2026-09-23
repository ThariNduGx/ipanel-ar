window.iPanelHomography = {
    solve8: function(A, b) {
        for (var i = 0; i < 8; i++) {
            var p = i;
            for (var r = i + 1; r < 8; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
            var t = A[i]; A[i] = A[p]; A[p] = t;
            var t2 = b[i]; b[i] = b[p]; b[p] = t2;
            var pv = A[i][i] || 1e-12;
            for (var r2 = 0; r2 < 8; r2++) {
                if (r2 === i) continue;
                var f = A[r2][i] / pv;
                for (var c = i; c < 8; c++) A[r2][c] -= f * A[i][c];
                b[r2] -= f * b[i];
            }
        }
        var result = b.map(function(v, i) { return v / (A[i][i] || 1e-12); });
        if (result.some(function(v) { return !isFinite(v); })) return null;
        return result;
    },
    inv3: function(m) {
        var a = m[0], b = m[1], c = m[2], d = m[3], e = m[4], f = m[5], g = m[6], h = m[7], i = m[8];
        var A = e*i - f*h, B = -(d*i - f*g), C = d*h - e*g;
        var det = a*A + b*B + c*C;
        if (!det || Math.abs(det) < 1e-10) return null;
        var r = [A/det, B/det, C/det, -(b*i-c*h)/det, (a*i-c*g)/det, -(a*h-b*g)/det, (b*f-c*e)/det, -(a*f-c*d)/det, (a*e-b*d)/det];
        if (r.some(function(v) { return !isFinite(v); })) return null;
        return r;
    }
};

// RANSAC line fitting for robust edge detection
window.iPanelHomography.ransacLine = function(points, iterations=100, threshold=5) {
  if (points.length < 2) return null;
  
  let bestInliers = 0;
  let bestLine = null;
  
  for (let i = 0; i < iterations; i++) {
    // Random sample 2 points
    const idx1 = Math.floor(Math.random() * points.length);
    let idx2 = Math.floor(Math.random() * points.length);
    if (idx2 === idx1) idx2 = (idx2 + 1) % points.length;
    
    const p1 = points[idx1];
    const p2 = points[idx2];
    
    // Line: ax + by + c = 0
    const a = p2[1] - p1[1];
    const b = p1[0] - p2[0];
    const c = p2[0]*p1[1] - p1[0]*p2[1];
    const len = Math.sqrt(a*a + b*b);
    
    if (len < 1e-6) continue;
    
    // Count inliers
    let inliers = 0;
    for (const p of points) {
      const dist = Math.abs(a*p[0] + b*p[1] + c) / len;
      if (dist < threshold) inliers++;
    }
    
    if (inliers > bestInliers) {
      bestInliers = inliers;
      bestLine = {a: a/len, b: b/len, c: c/len, inliers};
    }
  }
  
  return bestLine;
};

// Total Least Squares refinement
window.iPanelHomography.tlsLine = function(points) {
  if (points.length < 2) return null;
  
  const n = points.length;
  let sumX = 0, sumY = 0;
  for (const p of points) { sumX += p[0]; sumY += p[1]; }
  const mx = sumX / n, my = sumY / n;
  
  // Covariance matrix
  let sxx = 0, sxy = 0, syy = 0;
  for (const p of points) {
    const dx = p[0] - mx, dy = p[1] - my;
    sxx += dx*dx; sxy += dx*dy; syy += dy*dy;
  }
  
  // Eigenvector for smallest eigenvalue
  const theta = 0.5 * Math.atan2(2*sxy, sxx - syy);
  const a = -Math.sin(theta);
  const b = Math.cos(theta);
  const c = -(a*mx + b*my);
  
  return {a, b, c};
};
