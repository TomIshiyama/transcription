import { SayFn } from "@slack/bolt";
import {
  SummaryRequest,
  SummaryResult,
  TranscriptionRequest,
  TranscriptionResult,
} from "../types";
import { SlackEventHandler } from "../handlers/slackEventHandler";
import { availableFormat, availableText } from "../constants/whisper";
import { TranscriptionService } from "./transcriptionService";
import { SummarizationService } from "./summarizationService";
import { ProofReadSummarizationService } from "./proofreadSummarizationService";
import { ProofreadingService } from "./proofreadingService";

type File = any; // TODO

/**
 * 文字起こしサービス
 * 音声ファイルの文字起こしと要約を処理する
 */
export class MessageService {
  private event: any; //TODO: type
  private say: SayFn;
  private file: any;
  private transcriptionService: TranscriptionService;
  private summarizationService: SummarizationService;
  private proofreadingService: ProofreadingService;
  private proofReadSummarizationService: ProofReadSummarizationService;

  constructor(e: SlackEventHandler, say: SayFn, f: File) {
    this.event = e;
    this.say = say;
    this.file = f;
    this.transcriptionService = new TranscriptionService();
    this.summarizationService = new SummarizationService();
    this.proofreadingService = new ProofreadingService();
    this.proofReadSummarizationService = new ProofReadSummarizationService();
  }

  /**
   * 文字起こしリクエストを処理する
   * @param request 文字起こしリクエスト
   * @returns 文字起こし結果
   */
  public async requestTranscription(): // request: TranscriptionRequest
  Promise<void> {
    await this.say({
      text: "文字起こしリクエストを受け付けました。",
      thread_ts: this.event.ts,
    });

    const transcription = await this.transcriptionService.transcribeAudio(
      this.file.url_private_download,
      this.file.filetype
    );

    const result = await this.proofreadingService.proofreadText(
      transcription.text
    );

    this.say({ text: result.correctedText });
  }

  public async requestSummary(): // TranscriptionRequest
  Promise<void> {
    await this.say({
      text: "要約リクエストを受け付けました。出力までしばらくお待ち下さい。",
      thread_ts: this.event.ts,
    });

    const result = await this.summarizationService.summarizeText(
      this.file.url_private_download,
      this.file.filetype
    );

    this.say({ text: result.text });
  }

  public async requestEach(): Promise<void> {
    this.say("文字起こしと要約を開始しました。出力までしばらくお待ち下さい。");
    const transcription = await this.transcriptionService.transcribeAudio(
      this.file.url_private_download,
      this.file.filetype
    );
    // TODO: 外部API接続サービス テキストを要約する。
    // const result = await this.proofReadSummarizationService.summarizeText(
    //   transcription.text
    // );
    const result = transcription;

    this.say({ text: result.text });
  }

  public async doPing() {
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
