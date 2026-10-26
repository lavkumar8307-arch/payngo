import { searchLocationsLocal, ALL_INDIA_LOCATIONS } from '../src/lib/locationData';

console.log('--- Testing Indian Location Dataset & Search Engine ---');
console.log(`Total Indexed Indian Locations: ${ALL_INDIA_LOCATIONS.length}`);

// Test Queries specified in prompt requirements:
const testQueries = ['Hyd', 'Mum', 'Agra', 'Delhi', 'Goa', 'Ladakh', 'Cherlapally', 'Golden Temple', 'Bengaluru'];

testQueries.forEach((q) => {
  const results = searchLocationsLocal(q, 5);
  console.log(`\nQuery: "${q}" -> Top ${results.length} Matches:`);
  results.forEach((r, idx) => {
    console.log(`  ${idx + 1}. [${r.type.toUpperCase()}] ${r.name} (${r.state || 'India'}) - ID: ${r.id}`);
  });
});

console.log('\n--- State and UT Verification ---');
const statesCount = ALL_INDIA_LOCATIONS.filter((l) => l.type === 'state').length;
const utCount = ALL_INDIA_LOCATIONS.filter((l) => l.type === 'ut').length;
console.log(`States count in dataset: ${statesCount} (Target: 28)`);
console.log(`Union Territories count in dataset: ${utCount} (Target: 8)`);

if (statesCount >= 28 && utCount >= 8) {
  console.log('✅ ALL 28 STATES AND 8 UNION TERRITORIES VERIFIED IN DATASET');
} else {
  console.error('❌ Missing States or UTs');
}
