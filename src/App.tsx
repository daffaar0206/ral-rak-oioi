import { useState } from 'react';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';
import { calculateRAL } from './utils/statistics';

export default function App() {
  const [results, setResults] = useState([]); // Initialize as empty array
  const [error, setError] = useState(null);

  const handleCalculate = (data) => {
    try {
      // Pass the entire data structure without flattening
      const calculatedResults = calculateRAL(data.data);
      setResults(Array.isArray(calculatedResults) ? calculatedResults : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Statistical Analysis Tool
          </h1>
          <p className="text-gray-600 mt-2">
            Perform RAL and RAK analysis with beautiful visualizations
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        )}

        <InputForm onSubmit={handleCalculate} />
        <ResultDisplay results={results} />
      </div>
    </div>
  );
}
