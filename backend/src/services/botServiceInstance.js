// botService 多实例容器：支持多渠道并存（如企微+飞书同时在线）
// 通知推送遍历所有已启动渠道；指令/绑定各渠道独立处理（互不影响）
let instances = []; // [{ channel, service }]

module.exports = {
  // 注册实例（按 channel 覆盖同渠道旧实例）
  set(svc, channel = '') {
    if (channel) {
      const idx = instances.findIndex(i => i.channel === channel);
      if (idx >= 0) {
        instances[idx].service = svc;
      } else {
        instances.push({ channel, service: svc });
      }
      return;
    }
    // 兼容旧式无 channel 注册：清空重建
    instances = [{ channel: '', service: svc }];
  },

  // 兼容旧接口：返回第一个实例
  get() {
    return instances.length ? instances[0].service : null;
  },

  getAll() {
    return instances.map(i => i.service);
  },

  getChannels() {
    return instances.filter(i => i.channel).map(i => i.channel);
  },

  // 向所有在线渠道的管理群推送（同步，任一成功即 true）
  notifyToGroup(text) {
    let any = false;
    for (const { service } of instances) {
      try {
        if (service && service.notifyToGroup(text)) any = true;
      } catch (e) {
        // 单渠道失败不影响其他渠道
      }
    }
    return any;
  },

  // 停止并清空全部实例（热重载用）
  stopAll() {
    for (const { service } of instances) {
      try {
        if (service) service.stop();
      } catch (e) { /* 忽略停止异常 */ }
    }
    instances = [];
  }
};
