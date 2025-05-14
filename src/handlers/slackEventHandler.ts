import { App, SlackEventMiddlewareArgs } from "@slack/bolt";
import { TranscriptionService } from "../services/transcriptionService";
import { TranscriptionRequest } from "../types";
import { match, P } from "ts-pattern";
import { help, ping, summary, transcribe } from "../constants/regexList";
import { MessageService } from "../services/messageService";
import { availableFormat } from "../constants/whisper";
import { File } from "buffer";
import { normalizeSlackCommand } from "../utils/util";

/**
 * Slackイベントハンドラー
 * Slackからのイベントを処理する
 */
export class SlackEventHandler {
  private app: App;
  private transcriptionService: TranscriptionService;
  private messageService: MessageService | null;

  constructor(app: App) {
    this.app = app;
    this.transcriptionService = new TranscriptionService();
    this.messageService = null;
    this.registerEventHandlers();
  }

  /**
   * イベントハンドラーを登録する
   */
  private registerEventHandlers(): void {
    // this.registerMessageHandlers();
    this.registerCommandHandlers();
    // NOTE: アプリへのDMのときにファイル共有のみで登録できると面白いはず
    // this.registerFileHandlers();
  }

  /**
   * コマンドハンドラーを登録する
   */
  private registerCommandHandlers(): void {
    // @botname transcribe のようなメンションコマンドを処理する
    this.app.event("app_mention", async ({ event, say, client }: any) => {
      const text = normalizeSlackCommand(event.text);

      // 2つ目以降のファイルは初期リリースでは無視する
      const file = event.files?.[0];

      const messageService = new MessageService(event, say, file);

      console.log("------registerCommandHandlers------");
      console.log("text", text);
      console.log("filetype", file?.filetype);
      console.log("text =", text, typeof text);
      console.log("filetype =", file?.filetype, typeof file?.filetype);

      match<{ text?: string; filetype?: any }>({
        text,
        filetype: file?.filetype,
      })
        .with({ text: P.string.regex(ping), filetype: P.nullish }, () =>
          messageService.doPing()
        )
        .with({ text: P.string.regex(help), filetype: P.nullish }, () =>
          messageService.doHelp()
        )
        .with(
          {
            text: P.string.regex(transcribe),
            filetype: P.union(...availableFormat),
          },
          () => messageService.requestTranscription()
        )
        .with(
          {
            text: P.string.regex(summary),
            filetype: P.union(...availableFormat),
          },
          () => messageService.requestTranscription()
        )
        .with(
          { text: P.nullish, filetype: P.union(...availableFormat) },
          () => {
            say("文字起こしと要約実行中");
          }
        )
        .otherwise(() => messageService.doOtherwise());
    });
  }
}
