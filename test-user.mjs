async function test() {
  const loginRes = await fetch("http://localhost:3000/api/auth/mobile/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "smartcoreexpress@gmail.com", password: "Smart22@" })
  });
  
  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    console.error("Login failed", loginData);
    return;
  }
  console.log("Logged in!", loginData.token.substring(0, 20) + "...");

  const dashRes = await fetch("http://localhost:3000/api/mobile/dashboard/summary", {
    headers: { "Authorization": `Bearer ${loginData.token}` }
  });
  const dashData = await dashRes.json();
  console.log("Dashboard data:", JSON.stringify(dashData, null, 2));
}

test();
