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
