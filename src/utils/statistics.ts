export interface TableResult {
  labels: string[];
  means: number[];
  fValue?: number;
  pValue?: number;
  fCritical05?: number;
  fCritical01?: number;
  df1?: number;
  df2?: number;
}

// Helper function to calculate sum of squares
function sumOfSquares(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
}

// Calculate F-value for ANOVA
export function calculateFValue(tableData: number[][]): number {
  if (!tableData || tableData.length === 0) return NaN;

  const numTreatments = tableData[0].length;
  const numReplications = tableData.length;

  // Calculate total sum of squares
  const allValues = tableData.flat();
  const totalSS = sumOfSquares(allValues);

  // Calculate treatment sum of squares
  const treatmentMeans = Array(numTreatments).fill(0);
  tableData.forEach(replication => {
    replication.forEach((value, treatmentIndex) => {
      treatmentMeans[treatmentIndex] += value / numReplications;
    });
  });
  const treatmentSS = treatmentMeans.reduce((sum, mean) => 
    sum + numReplications * Math.pow(mean - (allValues.reduce((a, b) => a + b) / allValues.length), 2), 0);

  // Calculate error sum of squares
  const errorSS = totalSS - treatmentSS;

  // Calculate degrees of freedom
  const df1 = numTreatments - 1;
  const df2 = (numTreatments * numReplications) - numTreatments;

  // Calculate F-value
  return (treatmentSS / df1) / (errorSS / df2);
}

// Calculate p-value using F-distribution approximation
export function calculatePValue(fValue: number, df1: number, df2: number): number {
  if (!fValue || fValue <= 0) return NaN;
  
  // Simplified p-value calculation using F-distribution approximation
  const x = df2 / (df2 + df1 * fValue);
  const a = df2 / 2;
  const b = df1 / 2;
  
  // Incomplete beta function approximation
  let term = 1;
  let sum = 1;
  for (let i = 0; i < 100; i++) {
    term *= (a + i) * (1 - x) / (b + i + 1);
    sum += term;
  }
  
  return Math.pow(x, a) * Math.pow(1 - x, b) * sum / (a * beta(a, b));
}

// Beta function implementation
function beta(a: number, b: number): number {
  return (gamma(a) * gamma(b)) / gamma(a + b);
}

// Gamma function implementation
function gamma(z: number): number {
  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  }
  
  z -= 1;
  let x = 0.99999999999980993;
  const coefficients = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7
  ];
  
  coefficients.forEach((coeff, i) => {
    x += coeff / (z + i + 1);
  });
  
  const t = z + coefficients.length - 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

// Calculate F-critical value using inverse F-distribution approximation
export function calculateFCritical(alpha: number, df1: number, df2: number): number {
  if (alpha <= 0 || alpha >= 1) return NaN;
  
  // Simplified inverse F-distribution approximation
  const z = -Math.log(4 * alpha * (1 - alpha));
  const w = Math.sqrt(z / (1 - z));
  const numerator = w * (1 - 1 / (9 * df2)) - (1 - 1 / (9 * df1));
  const denominator = Math.sqrt(1 / (9 * df1) + w * w / (9 * df2));
  
  return Math.pow(numerator / denominator, 2);
}

export function calculateRAL(data: number[][][]): TableResult[] {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data.map((tableData) => {
    if (!tableData || !Array.isArray(tableData)) {
      return {
        labels: [],
        means: [],
        fValue: undefined,
        pValue: undefined,
        fCritical05: undefined,
        fCritical01: undefined
      };
    }

    const numTreatments = tableData[0]?.length || 0;
    const numReplications = tableData.length;
    
    // Calculate treatment means
    const labels = Array.from({ length: numTreatments }, (_, i) => `T${i + 1}`);
    const means = Array(numTreatments).fill(0);
    
    tableData.forEach(replication => {
      replication.forEach((value, treatmentIndex) => {
        means[treatmentIndex] += value / numReplications;
      });
    });

    // Calculate F-value and p-value
    const fValue = calculateFValue(tableData);
    const pValue = calculatePValue(fValue, numTreatments - 1, (numTreatments * numReplications) - numTreatments);

    // Calculate critical F values
    const df1 = numTreatments - 1;
    const df2 = (numTreatments * numReplications) - numTreatments;
    const fCritical05 = calculateFCritical(0.05, df1, df2);
    const fCritical01 = calculateFCritical(0.01, df1, df2);

    return {
      labels,
      means,
      fValue,
      pValue,
      fCritical05,
      fCritical01,
      df1,
      df2
    };
  });
}
