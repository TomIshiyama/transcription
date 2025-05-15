/**
 * TranscriptionService
 *
 * 音声ファイルの文字起こしを行うサービスクラス。
 * WhisperServiceを使用して音声認識処理を行います。
 */

import fs from "fs";
import path from "path";
import { TranscriptionResult } from "../types";
import { logger } from "../utils/logger";
import { whisperService } from "./whisperService";
import os from "os";
import { randomUUID } from "crypto";
import { SLACK_BOT_TOKEN } from "../constants/environment";

export class TranscriptionService {
  /**
   * 音声ファイルのURLから文字起こしを行う
   *
   * @param audioUrl 音声ファイルのURL
   * @returns 文字起こし結果
   */
  async transcribeAudio(
    audioUrl: string,
    fileFormat: string
  ): Promise<TranscriptionResult> {
    let tempFilePath = null;

    try {
      logger.info(`Transcribing audio from URL: ${audioUrl}`);
      // 一時ファイルパスの生成
      const tempDir = os.tmpdir();
      tempFilePath = path.join(tempDir, `audio_${randomUUID()}.${fileFormat}`);

      // 音声ファイルのダウンロード処理
      await this.downloadAudio(audioUrl, tempFilePath);

      // WhisperServiceを使用して音声をテキストに変換
      const startTime = Date.now();
      const result = await whisperService.transcribe(tempFilePath);
      const duration = (Date.now() - startTime) / 1000; // 秒単位

      if (!result.success) {
        logger.warn(`Transcription failed: ${result.error}`);
        throw new Error(result.error);
      }
      return {
        text: result.text,
        duration,
        requestType: "transcription",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Failed to transcribe audio: ${errorMessage}`);
      return {
        text: errorMessage,
        duration: 0,
        requestType: "transcription",
      };
    } finally {
      // 一時ファイルの削除
      if (tempFilePath) {
        this.cleanupTempFile(tempFilePath);
      }
    }
  }
  /**
   * 一時ファイルを削除する
   *
   * @param filePath 削除するファイルパス
   */
  private cleanupTempFile(filePath: string): void {
    try {
      fs.unlinkSync(filePath);
      logger.debug(`Temporary file deleted: ${filePath}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.warn(`Failed to delete temporary file: ${errorMessage}`);
    }
  }
  /**
   * 音声ファイルをダウンロードする
   *
   * @param url ダウンロード元URL
   * @param outputPath 保存先パス
   */
  private async downloadAudio(url: string, outputPath: string): Promise<void> {
    try {
      logger.info(`Downloading audio from: ${url}`);
      // fetch APIを使用してファイルをダウンロード
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
        },
      });
      if (!response.ok) {
        throw new Error(
          `Failed to download file: ${response.status} ${response.statusText}`
        );
      }
      const buffer = await response.arrayBuffer();
      await fs.promises.writeFile(outputPath, Buffer.from(buffer));
      logger.info(`Audio file downloaded to: ${outputPath}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Failed to download audio: ${errorMessage}`);
      throw error;
    }
  }
}

// // サービスのシングルトンインスタンスをエクスポート
// export const transcriptionService = new TranscriptionService();
