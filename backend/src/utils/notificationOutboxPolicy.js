const { normalizeNotificationTime } = require('./notificationEmailPolicy');

function selectLatestEmailNotification(rows, now = new Date()) {
  return rows.reduce((latest, row) => {
    const rowTime = normalizeNotificationTime(row.sentAt, now);
    if (!rowTime) return latest;
    if (!latest) return row;

    const latestTime = normalizeNotificationTime(latest.sentAt, now);
    if (!latestTime || rowTime.getTime() > latestTime.getTime()) {
      return row;
    }

    if (rowTime.getTime() === latestTime.getTime() && Number(row.id) > Number(latest.id)) {
      return row;
    }

    return latest;
  }, null);
}

module.exports = {
  selectLatestEmailNotification
};
