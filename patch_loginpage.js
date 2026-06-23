const fs = require('fs');
const path = 'src/components/auth/LoginPage.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(
  "const { signIn } = await import('next-auth/react');",
  "const { signIn } = await import('@/lib/auth-client');"
);

c = c.replace(
  "const res = await signIn('credentials', {\n        email: 'bengharbios@gmail.com',\n        password: 'admin1234',\n        redirect: false,\n      });",
  "const res = await signIn.email({\n        email: 'bengharbios@gmail.com',\n        password: 'admin1234',\n      });"
);

fs.writeFileSync(path, c);
console.log("Done patching LoginPage.tsx");
