/**
 * ProofreadingService
 *
 * Whisperによって生成されたテキストを校正するサービスクラス。
 * OpenAIのAPIを使用してテキストの校正処理を行います。
 */

import OpenAI from "openai";
import { ProofreadingResult } from "../types";
import { logger } from "../utils/logger";
import { OPENAI_API_KEY } from "../constants/environment";
import { proofreadingPrompt } from "../constants/prompt";

export class ProofreadingService {
  private openai: OpenAI;

  constructor() {
    // OpenAI クライアントの初期化
    this.openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
  }

  /**
   * テキストを校正する
   *
   * @param text 校正対象のテキスト
   * @returns 校正結果
   */
  async proofreadText(text: string): Promise<ProofreadingResult> {
    try {
      logger.info("Proofreading text");
      const startTime = Date.now();

      const correctedText = await this.correctWithOpenAI(text);
      const duration = (Date.now() - startTime) / 1000; // 秒単位

      return {
        originalText: text,
        correctedText,
        duration,
        requestType: "proofreading",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Failed to proofread text: ${errorMessage}`);

      // エラーが発生した場合は元のテキストをそのまま返す
      return {
        originalText: text,
        correctedText: text,
        duration: 0,
        requestType: "proofreading",
      };
    }
  }

  /**
   * OpenAIのAPIを使用してテキストを校正する
   *
   * @param text 校正対象のテキスト
   * @returns 校正されたテキスト
   */
  private async correctWithOpenAI(text: string): Promise<string> {
    try {
      // OpenAIのChat APIを使用
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: proofreadingPrompt,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.3, // 低めの温度設定で一貫性を保つ
        max_tokens: 4000, // 十分な長さの応答を許可
      });

      // 応答からテキストを取得
      const correctedText = response.choices[0]?.message?.content || text;
      return correctedText;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`OpenAI proofreading failed: ${errorMessage}`);
      throw error;
    }
  }
}

// サービスのシングルトンインスタンスをエクスポート
export const proofreadingService = new ProofreadingService();
