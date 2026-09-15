// botService 单例容器
// 解耦：index.js 启动时 set 实例，notifyService 等模块通过 get 使用
let instance = null;

module.exports = {
  set(svc) { instance = svc; },
  get() { return instance; },
  // 便捷方法：向管理员群主动推送（业务通知用）
  notifyToGroup(text) {
    return instance ? instance.notifyToGroup(text) : false;
  }
};
