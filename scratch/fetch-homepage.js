async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/homepage');
    const data = await res.json();
    console.log('API FETCH SUCCESS:', data.success);
    console.log('Layout sections in API response:');
    if (data.layout) {
      data.layout.forEach(sect => {
        console.log(`- ID: ${sect.id}, Type: ${sect.type}, Visible: ${sect.visible}, Metadata:`, sect.metadata);
      });
    }
    console.log('bentoRightProducts count:', data.bentoRightProducts?.length);
    console.log('bentoLeftProducts count:', data.bentoLeftProducts?.length);
    console.log('featuredProducts count:', data.featuredProducts?.length);
  } catch (err) {
    console.error('FETCH FAILED:', err.message);
  }
}

test();
