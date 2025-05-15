/**
 * シンプルなロガーユーティリティ
 *
 * アプリケーション全体で一貫したログ出力を提供します。
 */

export const logger = {
  /**
   * 情報ログを出力
   * @param message ログメッセージ
   */
  info: (message: string): void => {
    console.log(`[INFO] ${message}`);
  },

  /**
   * 警告ログを出力
   * @param message ログメッセージ
   */
  warn: (message: string): void => {
    console.warn(`[WARN] ${message}`);
  },

  /**
   * エラーログを出力
   * @param message ログメッセージ
   */
  error: (message: string): void => {
    console.error(`[ERROR] ${message}`);
  },

  /**
   * デバッグログを出力（開発環境のみ）
   * @param message ログメッセージ
   */
  debug: (message: string): void => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`);
    }
  },
};
