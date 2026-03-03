import { connect } from "@/client.js";

try {
  const client = await connect();
  const page = await client.page("test");
  
  await page.goto("https://example.com");
  const userAgent = await page.evaluate(() => navigator.userAgent);
  console.log("Current browser:", userAgent);
  
  await client.disconnect();
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
