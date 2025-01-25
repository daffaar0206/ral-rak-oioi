import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { TableResult } from '../utils/statistics';

Chart.register(...registerables);

interface ResultDisplayProps {
  results: TableResult[];
}

export default function ResultDisplay({ results = [] }: ResultDisplayProps) {
  const chartRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    // Cleanup previous charts
    chartRefs.current.forEach((canvas, index) => {
      if (canvas) {
        const chart = Chart.getChart(canvas);
        chart?.destroy();
      }
    });

    // Create new charts
    results.forEach((tableResult, index) => {
      const canvas = chartRefs.current[index];
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: tableResult.labels,
          datasets: [{
            label: 'Treatment Means',
            data: tableResult.means,
            backgroundColor: 'rgba(79, 70, 229, 0.5)',
            borderColor: 'rgba(79, 70, 229, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Mean Value'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Treatments'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: `Table ${index + 1} Results`
            }
          }
        }
      });
    });

    // Cleanup function
    return () => {
      chartRefs.current.forEach((canvas) => {
        if (canvas) {
          const chart = Chart.getChart(canvas);
          chart?.destroy();
        }
      });
    };
  }, [results]);

  return (
    <div className="space-y-8">
      {results.map((tableResult, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">Table {index + 1}</h3>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Statistics Section */}
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="copy-table min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Metric</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">F-value</td>
                      <td className="border border-gray-300 px-4 py-2">{tableResult.fValue?.toFixed(4) ?? 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">P-value</td>
                      <td className="border border-gray-300 px-4 py-2">{tableResult.pValue?.toFixed(4) ?? 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Significance Level (α = 0.05)</td>
                      <td className="border border-gray-300 px-4 py-2">3.10</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Significance Level (α = 0.01)</td>
                      <td className="border border-gray-300 px-4 py-2">5.14</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart Section */}
            <div className="h-[400px]">
              <canvas ref={el => chartRefs.current[index] = el}></canvas>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
