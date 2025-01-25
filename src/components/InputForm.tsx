import { useState, useRef } from 'react';
import { Calculator, ClipboardList, Dice5 } from 'lucide-react';

export default function InputForm({ onSubmit }) {
  const [treatments, setTreatments] = useState(3);
  const [replications, setReplications] = useState(5);
  const [tables, setTables] = useState(1);
  const [data, setData] = useState(
    Array(tables).fill(
      Array(replications).fill(
        Array(treatments).fill(0)
      )
    )
  );
  const tableRef = useRef<HTMLTableElement>(null);

  const generateRandomData = () => {
    const newData = Array(tables).fill(null).map(() => 
      Array(replications).fill(null).map(() => 
        Array(treatments).fill(null).map(() => 
          Math.floor(Math.random() * 100) + 1
        )
      )
    );
    setData(newData);
  };

  const handleSelectAll = (e) => {
    if (tableRef.current) {
      const table = tableRef.current;
      const range = document.createRange();
      range.selectNodeContents(table);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const handleCopy = () => {
    if (tableRef.current) {
      const table = tableRef.current;
      const range = document.createRange();
      range.selectNodeContents(table);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Create a temporary textarea to hold the table data
        const textarea = document.createElement('textarea');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        
        // Extract table data including input values
        let tableData = '';
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td, th');
          const rowData = Array.from(cells).map(cell => {
            const input = cell.querySelector('input');
            return input ? input.value : cell.textContent;
          }).join('\t');
          tableData += rowData + '\n';
        });
        
        textarea.value = tableData;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        selection.removeAllRanges();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ treatments, replications, tables, data });
  };

  const updateDataStructure = (newTreatments, newReplications, newTables) => {
    setData(prevData => {
      return Array(newTables).fill(null).map((_, tableIndex) => {
        const existingTable = prevData[tableIndex] || [];
        return Array(newReplications).fill(null).map((_, replicationIndex) => {
          const existingReplication = existingTable[replicationIndex] || [];
          return Array(newTreatments).fill(null).map((_, treatmentIndex) => {
            return existingReplication[treatmentIndex] || 0;
          });
        });
      });
    });
  };

  const handleTreatmentsChange = (value) => {
    setTreatments(value);
    updateDataStructure(value, replications, tables);
  };

  const handleReplicationsChange = (value) => {
    setReplications(value);
    updateDataStructure(treatments, value, tables);
  };

  const handleTablesChange = (value) => {
    setTables(value);
    updateDataStructure(treatments, replications, value);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <ClipboardList className="w-5 h-5" />
        Input Data
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Number of Treatments (Columns)</label>
            <input
              type="number"
              value={treatments}
              onChange={(e) => handleTreatmentsChange(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Replications (Rows)</label>
            <input
              type="number"
              value={replications}
              onChange={(e) => handleReplicationsChange(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Number of Tables</label>
            <input
              type="number"
              value={tables}
              onChange={(e) => handleTablesChange(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="1"
              required
            />
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={handleSelectAll}
            className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            Copy to Clipboard
          </button>
        </div>

        {data.map((tableData, tableIndex) => (
          <div key={tableIndex} className="mt-6">
            <h3 className="font-medium mb-2">Table {tableIndex + 1}</h3>
            <div className="overflow-x-auto">
              <table
                ref={tableRef}
                className="min-w-full border-collapse border border-gray-300"
                style={{ tableLayout: 'fixed' }}
              >
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2 bg-gray-100">Replication/Treatment</th>
                    {Array.from({ length: treatments }).map((_, colIndex) => (
                      <th key={colIndex} className="border border-gray-300 p-2 bg-gray-100">
                        T{colIndex + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((replication, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="border border-gray-300 p-2 bg-gray-100">R{rowIndex + 1}</td>
                      {replication.map((value, colIndex) => (
                        <td key={colIndex} className="border border-gray-300 p-2">
                          <input
                            type="number"
                            value={value}
                            onChange={(e) => {
                              const newData = [...data];
                              newData[tableIndex][rowIndex][colIndex] = Number(e.target.value);
                              setData(newData);
                            }}
                            className="w-full text-center border-none focus:ring-0 p-1"
                            required
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={generateRandomData}
            className="mt-4 flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 flex items-center justify-center gap-2"
          >
            <Dice5 className="w-5 h-5" />
            Generate Random Data
          </button>
          <button
            type="submit"
            className="mt-4 flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Calculator className="w-5 h-5" />
            Calculate
          </button>
        </div>
      </form>
    </div>
  );
}
