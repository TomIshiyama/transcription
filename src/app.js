const { App } = require("@slack/bolt");

const {
  SLACK_BOT_TOKEN,
  SLACK_SIGNING_SECRET,
  PORT,
} = require("./constants/environment");

// ボットトークンと Signing Secret を使ってアプリを初期化します
const app = new App({
  token: SLACK_BOT_TOKEN,
  signingSecret: SLACK_SIGNING_SECRET,
  // socketMode: true,
});

(async () => {
  // アプリを起動します
  await app.start(PORT);
  console.log(SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET);

  app.logger.info("⚡️ Bolt app is running!");
})();
