function selectLatestEmailNotification(rows) {
  return rows.reduce((latest, row) => {
    if (!latest) return row;

    if (Number(row.id) > Number(latest.id)) {
      return row;
    }

    return latest;
  }, null);
}

module.exports = {
  selectLatestEmailNotification
};
