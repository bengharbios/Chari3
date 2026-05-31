async function main() {
  console.log('Diagnosing live production database connection...');
  try {
    const res = await fetch('https://chariday.com/api/admin/db-push?token=chari3-push-2026');
    const data = await res.json();
    console.log('Response Status:', res.status);
    console.log('Success:', data.success);
    console.log('Message/Details:', data.message || data.error);
    if (data.details) {
      console.log('Details:', data.details);
    }
  } catch (error) {
    console.error('Error fetching db-push:', error);
  }
}
main();
