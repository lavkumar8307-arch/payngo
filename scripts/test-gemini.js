const apiKey = process.env.GEMINI_API_KEY || '';

async function testGemini() {
  console.log('Testing gemini-2.5-flash...');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Hello, what are 3 famous street food dishes in Hyderabad?' }] }],
      }),
    });

    console.log('Status code:', res.status);
    const data = await res.json();
    if (res.ok) {
      console.log('✅ Gemini Response Success:');
      console.log(data.candidates?.[0]?.content?.parts?.[0]?.text);
    } else {
      console.error('❌ Gemini Error:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testGemini();
