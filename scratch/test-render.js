async function test() {
  try {
    const res = await fetch('http://localhost:3000/');
    const html = await res.text();
    console.log('HTML length:', html.length);
    console.log('Contains custom text 1:', html.includes('وفر اكثر على مع تحبه مع شاري داي'));
    console.log('Contains default text 1:', html.includes('نوّنها أكثر ووفّر أكثر'));
    console.log('Contains custom text 2:', html.includes('سلعة باطل'));
    console.log('Contains default text 2:', html.includes('عليها العين'));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

test();
