/**
 * WhisperService
 *
 * 音声ファイルをテキストに変換するためのサービスクラス。
 * OpenAI Whisper API またはローカルインスタンスを使用して音声認識を行う。
 *
 * @see https://platform.openai.com/docs/guides/speech-to-text
 */

import fs from "fs";
import path from "path";
import OpenAI from "openai";
import {
  AvailableFormat,
  availableFormat,
  WHISPER_LANGUAGE,
  WHISPER_MODEL,
  WHISPER_RESPONSE_FORMAT,
  WHISPER_TEMPERATURE,
} from "../constants/whisper";
import { logger } from "../utils/logger";
import {
  OPENAI_API_KEY,
  WHISPER_LOCAL_ENDPOINT,
  WHISPER_LOCAL_INSTANCE,
} from "../constants/environment";

export interface WhisperOptions {
  model?: string;
  language?: string;
  responseFormat?: string;
  temperature?: number;
  useLocalInstance?: boolean;
}

export interface WhisperResult {
  text: string;
  success: boolean;
  error?: string;
}

export class WhisperService {
  private openai: OpenAI;
  private localEndpoint: string | undefined;

  constructor() {
    // OpenAI クライアントの初期化
    this.openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // ローカルインスタンスのエンドポイント設定（存在する場合）
    this.localEndpoint = `${process.env.WHISPER_LOCAL_ENDPOINT}/transcribe`;
  }

  /**
   * 音声ファイルをテキストに変換する
   *
   * @param audioFilePath 音声ファイルのパス
   * @param options 変換オプション
   * @returns 変換結果
   */
  public async transcribe(
    audioFilePath: string,
    options?: WhisperOptions
  ): Promise<WhisperResult> {
    // return { text: "hello", success: true };
    try {
      logger.info(`Whisper service.transcribe: ${audioFilePath}`);
      // ファイルの存在確認
      try {
        await fs.promises.access(audioFilePath);
      } catch {
        throw new Error(`Audio file not found: ${audioFilePath}`);
      }

      // ファイル拡張子の確認
      const fileExt = path
        .extname(audioFilePath)
        .toLowerCase()
        .replace(".", "");

      if (!availableFormat.includes(fileExt as AvailableFormat)) {
        throw new Error(
          `Unsupported file format: ${fileExt}. Supported formats: ${availableFormat.join(
            ", "
          )}`
        );
      }

      // オプションの設定
      const model = options?.model ?? WHISPER_MODEL;
      const language = options?.language ?? WHISPER_LANGUAGE;
      const responseFormat = options?.responseFormat ?? WHISPER_RESPONSE_FORMAT;
      const temperature = options?.temperature ?? WHISPER_TEMPERATURE;
      const useLocalInstance =
        options?.useLocalInstance ?? process.env.WHISPER_LOCAL_INSTANCE;
      console.log("env:", process.env);
      console.log("localInstance", useLocalInstance, WHISPER_LOCAL_INSTANCE);
      // ローカルインスタンスを使用する場合
      if (useLocalInstance && this.localEndpoint) {
        return await this.transcribeWithLocalInstance(audioFilePath, {
          model,
          language,
          responseFormat,
          temperature,
        });
      }

      // OpenAI Whisper API を使用する場合
      return await this.transcribeWithOpenAI(audioFilePath, {
        model,
        language,
        responseFormat,
        temperature,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger?.error?.(
        `Transcription failed for ${audioFilePath} using model ${WHISPER_MODEL}: ${errorMessage}`
      );
      return {
        text: "",
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * OpenAI Whisper API を使用して音声ファイルをテキストに変換する
   *
   * @param audioFilePath 音声ファイルのパス
   * @param options 変換オプション
   * @returns 変換結果
   */
  private async transcribeWithOpenAI(
    audioFilePath: string,
    options: Omit<WhisperOptions, "useLocalInstance">
  ): Promise<WhisperResult> {
    try {
      const audioFile = fs.createReadStream(audioFilePath);

      const response = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: options.model || "whisper-1",
        language: options.language,
        response_format: (options.responseFormat || "json") as any,
        temperature: options.temperature ?? 0,
      });

      return {
        text: "text" in response ? response.text : JSON.stringify(response),
        success: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger?.error?.(`OpenAI transcription failed: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * ローカルの Whisper インスタンスを使用して音声ファイルをテキストに変換する
   *
   * @param audioFilePath 音声ファイルのパス
   * @param options 変換オプション
   * @returns 変換結果
   */
  private async transcribeWithLocalInstance(
    audioFilePath: string,
    options: Omit<WhisperOptions, "useLocalInstance">
  ): Promise<WhisperResult> {
    try {
      logger.info(`transcribeWithLocalInstance: ${options.model}`);
      if (!this.localEndpoint) {
        throw new Error("Local Whisper endpoint is not configured");
      }

      // ファイル名の取得
      const fileName = path.basename(audioFilePath);

      // FormData の作成
      const formData = new FormData();
      const fileBlob = new Blob([fs.readFileSync(audioFilePath)]);
      formData.append("file", fileBlob, fileName);
      formData.append("model", options.model || "whisper-1");

      if (options.language) {
        formData.append("language", options.language);
      }

      if (options.responseFormat) {
        formData.append("response_format", options.responseFormat);
      }

      if (options.temperature !== undefined) {
        formData.append("temperature", options.temperature.toString());
      }

      // ローカルインスタンスへのリクエスト
      const response = await fetch(this.localEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          `Local Whisper instance returned status: ${response.status}`
        );
      }

      const responseFormat = options.responseFormat || "json";
      let result;

      if (responseFormat === "json") {
        result = await response.json();
        return {
          text: result.text || "",
          success: true,
        };
      } else {
        const text = await response.text();
        return {
          text,
          success: true,
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger?.error?.(`Local transcription failed: ${errorMessage}`);
      throw error;
    }
  }
}

export const whisperService = new WhisperService();
