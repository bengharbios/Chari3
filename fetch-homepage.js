async function main() {
  console.log('Fetching live homepage from production with diagnostics...');
  try {
    const res = await fetch('https://chariday.com/api/homepage');
    const data = await res.json();
    console.log('Success:', data.success);
    console.log('Is Fallback (Mock):', !!data.isFallback);
    if (data.errorMessage) {
      console.log('Error Message:', data.errorMessage);
    }
    if (data.errorStack) {
      console.log('Error Stack:', data.errorStack);
    }
    console.log('Categories count:', data.categories?.length);
    console.log('Featured Products count:', data.featuredProducts?.length);
    console.log('Top Sellers count:', data.topSellers?.length);
    console.log('Top Stores count:', data.topStores?.length);
  } catch (error) {
    console.error('Error fetching homepage:', error);
  }
}
main();
