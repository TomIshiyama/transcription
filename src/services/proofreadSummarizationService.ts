/**
 * SummarizationService
 *
 * Whisperによって生成されたテキストを要約するサービスクラス。
 * OpenAIのAPIを使用してテキストの要約処理を行います。
 */

import OpenAI from "openai";
// import { SummaryResult } from "../types"; // ../types で以下のように変更想定
import { logger } from "../utils/logger";
import { OPENAI_API_KEY } from "../constants/environment";
import { proofreadingSummarizationPrompt } from "../constants/prompt";

// ../types.ts での変更を想定
export interface SummaryResult {
  text: string;
  duration: number;
  requestType: "summary";
  success: boolean; // 追加: 処理の成功/失敗フラグ
  error?: string; // 追加: エラーメッセージ
}

export interface SummarizeOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  prompt?: string;
}

export class ProofReadSummarizationService {
  private openai: OpenAI;

  constructor(openaiClient?: OpenAI) {
    // OpenAIクライアントをDI可能に
    if (openaiClient) {
      this.openai = openaiClient;
    } else {
      if (!OPENAI_API_KEY) {
        logger.warn(
          "OPENAI_API_KEY is not set. SummarizationService might not work as expected."
        );
        // 必要であればここでエラーをスローする: throw new Error("OPENAI_API_KEY is not configured.");
      }
      this.openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
      });
    }
  }

  /**
   * テキストを要約する
   *
   * @param text 要約対象のテキスト
   * @param options 要約処理のオプション
   * @returns 要約結果
   */
  async summarizeText(
    text: string,
    options?: SummarizeOptions
  ): Promise<SummaryResult> {
    try {
      logger.info("Summarizing text");
      const startTime = Date.now();

      const summarizedText = await this.summarizeWithOpenAI(text, options);
      const duration = (Date.now() - startTime) / 1000; // 秒単位

      if (summarizedText === "" && text !== "") {
        // 元のテキストがあり、要約結果が空の場合は、何らかの問題があった可能性がある
        logger.warn("Summarization resulted in an empty string.");
        return {
          text: "", // または元のテキスト、エラーを示すテキスト
          duration,
          requestType: "summary",
          success: false,
          error: "Summarization resulted in an empty string.",
        };
      }

      return {
        text: summarizedText,
        duration,
        requestType: "summary",
        success: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Failed to summarize text: ${errorMessage}`);

      return {
        text: "", // エラー時は空テキスト、またはエラーを示す情報を返す
        duration: 0,
        requestType: "summary",
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * OpenAIのAPIを使用してテキストを要約する
   *
   * @param text 要約対象のテキスト
   * @param options 要約処理のオプション
   * @returns 要約されたテキスト、またはエラー時は空文字列
   */
  private async summarizeWithOpenAI(
    text: string,
    options?: SummarizeOptions
  ): Promise<string> {
    const model = options?.model || "gpt-4o";
    const temperature = options?.temperature ?? 0.3; // nullish coalescing operator を使用
    const maxTokens = options?.maxTokens ?? 2000;
    const systemPrompt = options?.prompt || proofreadingSummarizationPrompt;

    if (!text.trim()) {
      logger.info(
        "Input text for summarization is empty or whitespace only, returning empty string."
      );
      return ""; // 空の入力の場合は空の要約を返す
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: temperature,
        max_tokens: maxTokens,
      });

      const summarizedContent = response.choices[0]?.message?.content;

      if (!summarizedContent) {
        logger.warn(
          "OpenAI response did not contain summarized text content. Returning empty string."
        );
        return ""; // 要約コンテンツがない場合は空文字列を返す
      }

      return summarizedContent;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`OpenAI summarization failed: ${errorMessage}`);
      throw error; // エラーを再スローして上位の summarizeText で捕捉させる
    }
  }
}

// サービスのシングルトンインスタンスをエクスポート (DI対応)
// 通常の利用では引数なしで呼び出し、テスト時などにモックを注入可能
let summarizationServiceInstance: ProofReadSummarizationService | null = null;

export const getSummarizationService = (
  openaiClient?: OpenAI
): ProofReadSummarizationService => {
  if (!summarizationServiceInstance || openaiClient) {
    // openaiClientが指定された場合は新しいインスタンスを作る（テスト用）
    summarizationServiceInstance = new ProofReadSummarizationService(
      openaiClient
    );
  }
  return summarizationServiceInstance;
};

// デフォルトのシングルトンインスタンス (従来の利用方法を維持する場合)
export const proofReadSummarizationService = getSummarizationService();
