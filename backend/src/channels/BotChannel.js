// BotChannel 渠道接口（基类）
// 业务逻辑（botService）通过本接口与具体 IM 渠道解耦。
// 新增渠道（飞书/钉钉）只需继承本类，实现各方法。
//
// ChannelMessage 统一消息结构（各渠道转换为该结构后交给 botService）：
// {
//   msgId: string,       // 消息唯一 ID（幂等去重）
//   userId: string,      // 用户标识（企微 userid / 飞书 open_id）
//   chatId: string,      // 群会话 ID（主动推送用）
//   chatType: string,    // 'group' | 'single'
//   content: string,     // 文本内容（text/mixed 提取后；纯图片消息为空）
//   imageObjs: any[],    // 原始图片对象数组（未下载，交 botService 调 downloadImage）
//   reqId: string,       // 被动回复需透传的标识（企微 req_id / 飞书 message_id）
// }
class BotChannel {
  constructor(name) {
    this.name = name;
    this.groupChatId = null;   // 缓存的群会话 ID（主动推送目标）
    this.messageHandler = null; // 收到用户消息时的回调
  }

  start() { throw new Error(`[${this.name}] start() 未实现`); }
  stop() { throw new Error(`[${this.name}] stop() 未实现`); }

  // 注册收到用户消息时的回调 handler(ChannelMessage)
  onUserMessage(handler) { this.messageHandler = handler; }

  // 被动回复（响应用户指令）
  reply(reqId, text) { throw new Error(`[${this.name}] reply() 未实现`); }

  // 主动推送（业务通知用），返回是否发送成功
  sendToGroup(text) { throw new Error(`[${this.name}] sendToGroup() 未实现`); }

  // 图片下载解密，返回 { url, filename } 或 null
  async downloadImage(imageObj) { throw new Error(`[${this.name}] downloadImage() 未实现`); }
}

module.exports = BotChannel;
