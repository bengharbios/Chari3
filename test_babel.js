const babel = require('@babel/parser');
const code = `
export default function App() {
  return (
    <CardContent>
      <div className="space-y-6">
        {true && (
          <div>
          </div>
        )}
      </div>
      {/* Advanced Styling & Visibility Control */}
      <div className="space-y-4 pt-4 border-t border-border/60">
      </div>
    </CardContent>
  );
}
`;

try {
  babel.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  console.log("Parsed correctly!");
} catch (e) {
  console.log("Error:", e.message);
}
