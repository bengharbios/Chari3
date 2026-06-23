import fs
path = 'src/app/layout.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace("import NextAuthProvider from '@/providers/NextAuthProvider';\n", "")
c = c.replace("        <NextAuthProvider>\n", "")
c = c.replace("        </NextAuthProvider>\n", "")
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print("Done")
