/**
 * SummarizationService
 *
 * Whisperによって生成されたテキストを要約するサービスクラス。
 * OpenAIのAPIを使用してテキストの要約処理を行います。
 */

import OpenAI from "openai";
import { SummaryResult } from "../types";
import { logger } from "../utils/logger";
import { OPENAI_API_KEY } from "../constants/environment";
import { summarizationPrompt } from "../constants/prompt";

export class SummarizationService {
  private openai: OpenAI;

  constructor() {
    // OpenAI クライアントの初期化
    this.openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
  }

  /**
   * テキストを要約する
   *
   * @param text 要約対象のテキスト
   * @returns 要約結果
   */
  async summarizeText(text: string): Promise<SummaryResult> {
    try {
      logger.info("Summarizing text");
      const startTime = Date.now();

      const summarizedText = await this.summarizeWithOpenAI(text);
      const duration = (Date.now() - startTime) / 1000; // 秒単位

      return {
        text: summarizedText,
        duration,
        requestType: "summary",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Failed to summarize text: ${errorMessage}`);

      // エラーが発生した場合は元のテキストをそのまま返す
      return {
        text: text,
        duration: 0,
        requestType: "summary",
      };
    }
  }

  /**
   * OpenAIのAPIを使用してテキストを要約する
   *
   * @param text 要約対象のテキスト
   * @returns 要約されたテキスト
   */
  private async summarizeWithOpenAI(text: string): Promise<string> {
    try {
      // OpenAIのChat APIを使用
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: summarizationPrompt,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.3, // 低めの温度設定で一貫性を保つ
        max_tokens: 2000, // 要約なので元のテキストより短くなる想定
      });

      // 応答からテキストを取得
      const summarizedText = response.choices[0]?.message?.content || text;
      return summarizedText;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`OpenAI summarization failed: ${errorMessage}`);
      throw error;
    }
  }
}

// サービスのシングルトンインスタンスをエクスポート
export const summarizationService = new SummarizationService();
