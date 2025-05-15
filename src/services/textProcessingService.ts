/**
 * TextProcessingService
 *
 * Whisperによって生成されたテキストの校正と要約を行うサービスクラス。
 * OpenAIのAPIを使用してテキストの校正と要約処理を一度のリクエストで行います。
 */

import OpenAI from "openai";
import { logger } from "../utils/logger";
import { OPENAI_API_KEY } from "../constants/environment";
import { proofreadingPrompt, summarizationPrompt } from "../constants/prompt";
import { defaultOpenAIModel } from "../constants/llm";

export interface TextProcessingResult {
  originalText: string;
  correctedText: string;
  summarizedText: string;
  duration: number;
}

export class TextProcessingService {
  private openai: OpenAI;

  constructor() {
    // OpenAI クライアントの初期化
    this.openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
  }

  /**
   * テキストの校正と要約を一度のリクエストで行う
   *
   * @param text 処理対象のテキスト
   * @returns 校正と要約の結果
   */
  async processText(text: string): Promise<TextProcessingResult> {
    try {
      logger.info("Processing text for proofreading and summarization");
      const startTime = Date.now();

      // 校正と要約を並行して実行
      const [correctedText, summarizedText] = await Promise.all([
        this.correctWithOpenAI(text),
        this.summarizeWithOpenAI(text),
      ]);

      const duration = (Date.now() - startTime) / 1000; // 秒単位

      return {
        originalText: text,
        correctedText,
        summarizedText,
        duration,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Failed to process text: ${errorMessage}`);

      // エラーが発生した場合は元のテキストをそのまま返す
      return {
        originalText: text,
        correctedText: text,
        summarizedText: text,
        duration: 0,
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
        model: defaultOpenAIModel,
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
        model: defaultOpenAIModel,
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
export const textProcessingService = new TextProcessingService();
