import { App } from "@slack/bolt";
import { SlackEventHandler } from "./handlers/slackEventHandler";
import {
  SLACK_BOT_TOKEN,
  SLACK_SIGNING_SECRET,
  PORT,
} from "./constants/environment.js";

// 環境変数の検証
function validateEnvironment(): void {
  const requiredVars = [
    { name: "SLACK_BOT_TOKEN", value: SLACK_BOT_TOKEN },
    { name: "SLACK_SIGNING_SECRET", value: SLACK_SIGNING_SECRET },
  ];

  const missingVars = requiredVars.filter((v) => !v.value).map((v) => v.name);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
}

/**
 * Slack Bolt アプリケーションのメインエントリーポイント
 */
async function main() {
  try {
    // 環境変数を検証
    validateEnvironment();

    // ボットトークンと Signing Secret を使ってアプリを初期化
    const app = new App({
      token: SLACK_BOT_TOKEN,
      signingSecret: SLACK_SIGNING_SECRET,
      // socketMode: true,
    });

    // Slackイベントハンドラーを初期化
    new SlackEventHandler(app);

    // アプリを起動
    await app.start(PORT);
    app.logger.info(`⚡️ Bolt app is running on port ${PORT}!`);
  } catch (error) {
    console.error("Error starting app:", error);
    process.exit(1);
  }
}

// アプリケーションを実行
main();
