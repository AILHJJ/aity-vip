function normalizeAccountEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function validateAccountEmail(email) {
  const normalizedEmail = normalizeAccountEmail(email);

  if (!normalizedEmail) {
    return { valid: false, message: '请输入邮箱' };
  }

  if (normalizedEmail.endsWith('@users.aity.vip')) {
    return { valid: false, message: '请填写真实可接收邮件的邮箱' };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(normalizedEmail)) {
    return { valid: false, message: '邮箱格式不正确' };
  }

  return { valid: true, email: normalizedEmail };
}

module.exports = {
  normalizeAccountEmail,
  validateAccountEmail
};
