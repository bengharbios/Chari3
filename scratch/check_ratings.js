const http = require('http');

http.get('http://localhost:3000/api/homepage', (res) => {
  let d = '';
  res.on('data', c => d+=c);
  res.on('end', () => {
    try {
      const data = JSON.parse(d);
      const products = data.featuredProducts;
      if (products) {
        console.log(JSON.stringify(products.map(p => ({name: p.name, rating: p.rating, soldCount: p.soldCount})), null, 2));
      } else {
        console.log("No featured products found.");
      }
    } catch(e) {
      console.error(e);
    }
  });
});
