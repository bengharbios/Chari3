const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'admin-secure-internal', 'security', 'bans', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetInput = `<Input
                className="flex-1"
                placeholder="Value to block (e.g. 192.168.1.1 or AE)"
                value={newBan.value}
                onChange={(e) => setNewBan({ ...newBan, value: e.target.value })}
              />`;

const replacement = `{newBan.type === 'country' ? (
                <Select value={newBan.value} onValueChange={(v) => setNewBan({ ...newBan, value: v })}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select Country" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DZ">🇩🇿 Algeria</SelectItem>
                    <SelectItem value="SA">🇸🇦 Saudi Arabia</SelectItem>
                    <SelectItem value="AE">🇦🇪 United Arab Emirates</SelectItem>
                    <SelectItem value="EG">🇪🇬 Egypt</SelectItem>
                    <SelectItem value="MA">🇲🇦 Morocco</SelectItem>
                    <SelectItem value="TN">🇹🇳 Tunisia</SelectItem>
                    <SelectItem value="QA">🇶🇦 Qatar</SelectItem>
                    <SelectItem value="KW">🇰🇼 Kuwait</SelectItem>
                    <SelectItem value="BH">🇧🇭 Bahrain</SelectItem>
                    <SelectItem value="OM">🇴🇲 Oman</SelectItem>
                    <SelectItem value="JO">🇯🇴 Jordan</SelectItem>
                    <SelectItem value="LB">🇱🇧 Lebanon</SelectItem>
                    <SelectItem value="FR">🇫🇷 France</SelectItem>
                    <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                    <SelectItem value="US">🇺🇸 United States</SelectItem>
                    <SelectItem value="CN">🇨🇳 China</SelectItem>
                    <SelectItem value="RU">🇷🇺 Russia</SelectItem>
                    <SelectItem value="IN">🇮🇳 India</SelectItem>
                    <SelectItem value="IL">🇮🇱 Israel</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  className="flex-1"
                  placeholder="Value to block (e.g. 192.168.1.1)"
                  value={newBan.value}
                  onChange={(e) => setNewBan({ ...newBan, value: e.target.value })}
                />
              )}`;

content = content.replace(targetInput, replacement);

// Reset value when type changes
content = content.replace(
  `onValueChange={(v) => setNewBan({ ...newBan, type: v })}`,
  `onValueChange={(v) => setNewBan({ ...newBan, type: v, value: '' })}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Bans page patched.');
