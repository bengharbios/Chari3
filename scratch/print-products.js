async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/homepage');
    const data = await res.json();
    console.log('API FETCH SUCCESS:', data.success);
    
    console.log('--- RIGHT CARD PRODUCTS ---');
    data.bentoRightProducts?.slice(0, 4).forEach(p => console.log(`- ${p.name} (Cat: ${p.category?.name})`));

    console.log('--- LEFT CARD PRODUCTS ---');
    data.bentoLeftProducts?.slice(0, 2).forEach(p => console.log(`- ${p.name} (Cat: ${p.category?.name})`));

    console.log('--- TIMER PRODUCTS (Center column) ---');
    data.featuredProducts?.slice(0, 4).forEach(p => console.log(`- ${p.name} (Cat: ${p.category?.name})`));
  } catch (err) {
    console.error('FETCH FAILED:', err.message);
  }
}

test();
