import { SayFn } from "@slack/bolt";
import {
  SummaryRequest,
  SummaryResult,
  TranscriptionRequest,
  TranscriptionResult,
} from "../types";
import { SlackEventHandler } from "../handlers/slackEventHandler";
import { availableFormat, availableText } from "../constants/whisper";

type File = any; // TODO

/**
 * 文字起こしサービス
 * 音声ファイルの文字起こしと要約を処理する
 */
export class MessageService {
  private event: any; //TODO: type
  private say: SayFn;
  private file: any;

  constructor(e: SlackEventHandler, say: SayFn, f: File) {
    this.event = e;
    this.say = say;
    this.file = f;
  }

  /**
   * 文字起こしリクエストを処理する
   * @param request 文字起こしリクエスト
   * @returns 文字起こし結果
   */
  public async requestTranscription(): // request: TranscriptionRequest
  Promise<TranscriptionResult> {
    await this.say({
      text: "文字起こしリクエストを受け付けました。",
      thread_ts: this.event.ts,
    });

    // TODO: 実装では、ここでWhisperやLLMのAPIを呼び出す

    // fetch()
    // ダミーの結果を返す;
    return {
      text: "これはダミーの文字起こし結果です。実際の実装では、WhisperやLLMのAPIを使用して文字起こしを行います。",
      duration: 60,
      requestType: "transcription",
    };
  }

  public async requestSummary(): // TranscriptionRequest
  Promise<SummaryResult> {
    await this.say({
      text: "要約リクエストを受け付けました。",
      thread_ts: this.event.ts,
    });

    // 実装では、ここでWhisperやLLMのAPIを呼び出す
    // fetch()
    return {
      text: "これはダミーの要約結果です。実際の実装では、LLMのAPIを使用して要約を生成します。",
      duration: 60,
      requestType: "summary",
    };
  }

  public async requestEach(): Promise<SummaryResult> {
    // const hoge = this.requestTranscription();
    // const piyo = this.requestSummary();
    return {
      text: "これはダミーの要約結果です。実際の実装では、LLMのAPIを使用して要約を生成します。",
      duration: 60,
      requestType: "summary",
    };
  }

  public async doPing() {
    console.log("pong");
    await this.say("pong");
  }

  public async doHelp() {
    await this.say({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `文字起こしと要約が必要ですか？\`@zackly\`のようにメンションし、音声ファイルをアップロードしてください。\n- 文字起こしのみ実行する場合: \`@zackly transcribe\`\n- 要約のみ実行する場合: \`@zackly summary\`\n- 対応音声ファイル: ${availableFormat.join(
              ","
            )}\n- 対応テキストファイル: ${availableText.join(",")}
            `,
          },
        },
      ],
      text: `文字起こしまたは要約が必要ですか？`,
    });
  }

  public async doOtherwise() {
    await this.say({
      text: "コマンドが認識できませんでした。`@zackly` をしてからファイルを添付してください。",
      thread_ts: this.event.ts,
    });
  }
}
