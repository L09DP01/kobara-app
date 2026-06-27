async function testLogin() {
  console.log("Testing production login endpoint...");
  try {
    const res = await fetch("https://kobara.app/api/auth/mobile/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client": "kobara-mobile",
      },
      body: JSON.stringify({
        email: "test@kobara.app",
        password: "password123"
      })
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testLogin();
