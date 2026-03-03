import { connect } from "@/client.js";

const client = await connect();

// 获取登录页面的 AI snapshot
const snapshot = await client.getAISnapshot("login");

console.log("Login page snapshot:");
console.log(snapshot);

await client.disconnect();
