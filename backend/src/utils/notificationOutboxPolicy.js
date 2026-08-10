function getLastEmailNotificationOrder() {
  // sent_at 历史数据存在 UTC/北京时间混杂，按更新时间取最近实际处理记录更可靠。
  return [['updated_at', 'DESC'], ['id', 'DESC']];
}

module.exports = {
  getLastEmailNotificationOrder
};
