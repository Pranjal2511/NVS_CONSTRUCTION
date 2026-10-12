#!/usr/bin/env node
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { buildOtpEmailHtml } from '../server/services/emailService.js';

dotenv.config();

const targetEmail = process.argv[2] || process.env.SMTP_USER;

console.log('=====================================================');
console.log('   NVS BUILDCON - EMAIL DELIVERY TEST UTILITY');
console.log('=====================================================\n');

if (!targetEmail) {
  console.error('ERROR: No recipient email provided.');
  console.log('Usage: node scripts/test-email.mjs <your-email@gmail.com>\n');
  process.exit(1);
}

console.log(`[*] Target Recipient: ${targetEmail}`);
console.log(`[*] RESEND_API_KEY:    ${process.env.RESEND_API_KEY ? 'Configured (starts with ' + process.env.RESEND_API_KEY.slice(0, 5) + '...)' : 'Not set'}`);
console.log(`[*] SMTP_USER:         ${process.env.SMTP_USER || 'Not set'}`);
console.log(`[*] SMTP_PASS:         ${process.env.SMTP_PASS ? '****** (length ' + process.env.SMTP_PASS.replace(/\s+/g, '').length + ')' : 'Not set'}`);
console.log(`[*] SMTP_HOST:         ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
console.log(`[*] SMTP_PORT:         ${process.env.SMTP_PORT || '465'}`);
console.log(`[*] SMTP_FROM:         ${process.env.SMTP_FROM || 'Default'}\n`);

async function testEmail() {
  const testOtp = String(Math.floor(100000 + Math.random() * 900000));
  const html = buildOtpEmailHtml('Valued User', testOtp);
  const text = `NVS Buildcon Test Verification Code: ${testOtp}\nValid for 5 minutes.`;

  // 1. Resend
  if (process.env.RESEND_API_KEY) {
    console.log('[*] Testing delivery via Resend API (HTTPS)...');
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.SMTP_FROM || 'NVS Buildcon <onboarding@resend.dev>';
      const { data, error } = await resend.emails.send({
        from,
        to: [targetEmail],
        subject: `Your NVS Buildcon Test OTP: ${testOtp}`,
        text,
        html,
      });

      if (error) {
        throw new Error(error.message || 'Resend API returned an error');
      }

      console.log(`\n[SUCCESS] Email successfully delivered via Resend! ID: ${data?.id}`);
      console.log(`[!] Check your inbox at: ${targetEmail} (including Spam/Junk folder)`);
      return;
    } catch (err) {
      console.error(`\n[FAILED] Resend error: ${err.message}`);
    }
  }

  // 2. SMTP
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('\n[ERROR] Neither RESEND_API_KEY nor SMTP credentials (SMTP_USER, SMTP_PASS) are configured in .env.');
    console.log('\nTo fix this, choose one of two options:');
    console.log('----------------------------------------------------');
    console.log('Option A (Gmail SMTP):');
    console.log('1. Go to https://myaccount.google.com/security');
    console.log('2. Enable 2-Step Verification if not already enabled');
    console.log('3. Go to https://myaccount.google.com/apppasswords');
    console.log('4. Create an App password (name it "NVS Buildcon")');
    console.log('5. Copy the 16-character code into .env as:');
    console.log('   SMTP_USER=your-email@gmail.com');
    console.log('   SMTP_PASS=xxxx xxxx xxxx xxxx');
    console.log('\nOption B (Resend API - Free & Easiest):');
    console.log('1. Sign up at https://resend.com');
    console.log('2. Get your API key (starts with re_...)');
    console.log('3. Put in .env:');
    console.log('   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx');
    console.log('----------------------------------------------------\n');
    process.exit(1);
  }

  console.log('[*] Testing delivery via Nodemailer SMTP...');
  const isGmail = (process.env.SMTP_HOST || '').includes('gmail') || (process.env.SMTP_USER || '').includes('@gmail.com');
  const cleanPass = process.env.SMTP_PASS.replace(/\s+/g, '');
  const cleanUser = process.env.SMTP_USER.trim();

  const transporter = nodemailer.createTransport(
    isGmail
      ? {
          service: 'gmail',
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
          auth: { user: cleanUser, pass: cleanPass },
        }
      : {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '465', 10),
          secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
          auth: { user: cleanUser, pass: cleanPass },
        }
  );

  try {
    console.log('[*] Verifying SMTP server connection and credentials...');
    await transporter.verify();
    console.log('[OK] SMTP connection verified successfully!');

    console.log(`[*] Sending test verification email to ${targetEmail}...`);
    const fromAddress = process.env.SMTP_FROM || `"NVS Buildcon" <${cleanUser}>`;
    const info = await transporter.sendMail({
      from: fromAddress,
      to: targetEmail,
      subject: `Your NVS Buildcon Test OTP: ${testOtp}`,
      text,
      html,
    });

    console.log(`\n[SUCCESS] Email sent successfully via SMTP!`);
    console.log(`[!] Message ID: ${info.messageId}`);
    console.log(`[!] Recipient:  ${targetEmail}`);
    console.log(`[!] Test OTP:    ${testOtp}`);
    console.log(`\nPlease check your Gmail inbox and Spam folder.\n`);
  } catch (err) {
    console.error(`\n[FAILED] SMTP Delivery Error: ${err.message}`);
    if (err.message && (err.message.includes('535') || err.message.includes('BadCredentials') || err.message.includes('Username and Password not accepted'))) {
      console.log('\n>>> DIAGNOSIS: GMAIL REJECTED YOUR CREDENTIALS <<<');
      console.log('Google does NOT allow regular account passwords for SMTP.');
      console.log('You must generate a 16-character Google App Password:');
      console.log('1. Go to: https://myaccount.google.com/security');
      console.log('2. Ensure "2-Step Verification" is ON');
      console.log('3. Visit: https://myaccount.google.com/apppasswords');
      console.log('4. Create an App password named "NVS Website"');
      console.log('5. Paste the generated 16-character code into your .env file:');
      console.log(`   SMTP_USER=${cleanUser}`);
      console.log('   SMTP_PASS=xxxx xxxx xxxx xxxx');
      console.log('\nThen run this test command again:');
      console.log(`node scripts/test-email.mjs ${targetEmail}\n`);
    }
  }
}

testEmail().catch((e) => console.error('Unexpected error:', e));
