import { auth } from './src/lib/better-auth';

async function test() {
  console.log(Object.keys(auth.api));
}

test();
