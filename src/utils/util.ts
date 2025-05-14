/**
 * Slackのメッセージテキストからメンションを除去し、
 * コマンド部分のみを返す正規化関数
 *
 * @param text Slackメッセージ本文（例: "<@U12345> ping"）
 * @returns 正規化されたコマンド文字列（例: "ping"）
 */
export function normalizeSlackCommand(text?: string): string | undefined {
  if (!text) return undefined;

  // 先頭のメンション (<@XXXXXXX>) を除去し、前後の空白を削除
  const result = text
    .toLowerCase()
    .replace(/^<@[\w\d]+>\s*/, "")
    .trim();

  if (!result.length) return undefined;

  return result;
}
