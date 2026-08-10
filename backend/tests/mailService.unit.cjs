const assert = require('assert');

const { sendEmail } = require('../src/services/mailService');

async function main() {
  const envBackup = { ...process.env };

  try {
    process.env.MAIL_DRY_RUN = 'true';
    process.env.MAIL_ENABLED = 'true';
    process.env.SMTP_USER = 'lhdms88@163.com';
    process.env.SMTP_PASS = 'test-secret';

    const result = await sendEmail({
      to: 'demo@users.aity.vip',
      subject: 'test',
      text: 'test'
    });

    assert.deepStrictEqual(result, {
      skipped: true,
      reason: 'invalid_recipient'
    });

    console.log('mailService unit tests passed');
  } finally {
    process.env = envBackup;
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
