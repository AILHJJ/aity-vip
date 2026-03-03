/*
 * @Author: fuli fuli@example.com
 * @Date: 2026-02-27 18:56:32
 * @LastEditors: fuli fuli@example.com
 * @LastEditTime: 2026-02-27 20:20:13
 * @FilePath: \.claude\skills\dev-browser\test-connection.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { connect } from "@/client.js";

try {
  const client = await connect();
  console.log("Connected to relay server");
  
  const page = await client.page("test");
  console.log("Created page");
  
  await page.goto("https://example.com");
  console.log({ title: await page.title() });
  
  await client.disconnect();
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
