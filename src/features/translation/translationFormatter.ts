import { EmbedBuilder, User, Message } from 'discord.js';
import { ReplyStrategyService } from '../../services/replyStrategyService';
import { TranslationProcessingResult } from './types';

// Discord埋め込みメッセージのフォーマット機能
export class TranslationFormatter {
  // Larry による日記フィードバックの埋め込みとフォローアップメッセージを作成
  async createFeedbackResponse(
    result: TranslationProcessingResult,
    _originalContent: string,
    author: User,
    message: Message
  ): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle("📝 Larry's Diary Feedback")
      .setColor(0x00ae86)
      .setTimestamp()
      .setFooter({
        text: `Larry detected: ${this.getLanguageDisplayName(result.detectedLanguage)} • Canadian English Tutor`,
        iconURL: author.displayAvatarURL(),
      });

    // 元のターゲット文を追加
    embed.addFields({
      name: `Target Sentence (${this.getLanguageDisplayName(result.detectedLanguage)})`,
      value: this.truncateText(result.targetSentence, 1000),
      inline: false,
    });

    // 完全なメッセージ内容を生成
    const completeMessage = this.generateCompleteMessage(result, author);

    // 短いコンテンツの場合は、埋め込みにサマリーを事前に追加
    if (!ReplyStrategyService.shouldUseAttachment(completeMessage)) {
      const summaryField = this.createContentSummary(result);
      if (summaryField) {
        embed.addFields(summaryField);
      }
    }

    // 条件付きリプライ戦略を使用（一度だけリプライ）
    const replyResult = await ReplyStrategyService.sendConditionalEmbedReply(
      message,
      embed,
      completeMessage,
      `larry-feedback-${author.username}.txt`
    );

    // ログに戦略を記録
    console.log(`🎯 Larry diary feedback: ${ReplyStrategyService.getStrategyStatusMessage(replyResult)}`);
  }

  // エラー時の埋め込みメッセージを作成
  createErrorEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle("❌ Larry's Translation Error")
      .setDescription(
        'Sorry, I encountered an error while processing your diary entry. Please try again later.'
      )
      .setColor(0xff0000)
      .setTimestamp();
  }

  // 短いコンテンツ用のサマリーフィールドを作成
  private createContentSummary(result: TranslationProcessingResult) {
    let summaryContent = '';
    
    // シナリオ別にサマリーを作成
    switch (result.scenario) {
      case 'japanese-only':
        if (result.threeLevelTranslations) {
          summaryContent = `🟢 **Beginner:** ${this.truncateText(result.threeLevelTranslations.beginner, 200)}\n` +
                          `🟡 **Intermediate:** ${this.truncateText(result.threeLevelTranslations.intermediate, 200)}\n` +
                          `🔴 **Upper:** ${this.truncateText(result.threeLevelTranslations.upper, 200)}`;
        }
        break;
      
      case 'japanese-with-try':
        if (result.threeLevelTranslations && result.translationEvaluation) {
          summaryContent = `🎯 **Evaluation:** ${this.truncateText(result.translationEvaluation.evaluation, 300)}\n` +
                          `💡 **Key Point:** ${result.translationEvaluation.studyPoints[0] || 'N/A'}`;
        }
        break;
      
      case 'english-only':
        if (result.japaneseTranslation && result.vocabularyExplanation) {
          summaryContent = `🇯🇵 **Translation:** ${this.truncateText(result.japaneseTranslation, 200)}\n` +
                          `📖 **Key Vocabulary:** ${this.truncateText(result.vocabularyExplanation, 200)}`;
        }
        break;
    }

    if (summaryContent) {
      return {
        name: '📋 Key Feedback Points',
        value: summaryContent,
        inline: false
      };
    }
    
    return null;
  }

  // 言語名を表示用に変換
  private getLanguageDisplayName(language: string): string {
    switch (language) {
      case 'japanese':
        return '🇯🇵 Japanese';
      case 'english':
        return '🇺🇸 English';
      case 'mixing':
        return '🇯🇵🇺🇸 Mixed (JP + EN)';
      default:
        return '🌍 Other';
    }
  }

  // テキストを指定長で切り詰め
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }

  // 長いテキストを100文字ごとに改行
  private addLineBreaks(text: string, maxLineLength: number = 100): string {
    if (text.length <= maxLineLength) {
      return text;
    }

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      // 現在の行に単語を追加した時の長さをチェック
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (testLine.length <= maxLineLength) {
        // 長さが制限内なら追加
        currentLine = testLine;
      } else {
        // 制限を超える場合
        if (currentLine) {
          // 現在の行をプッシュして新しい行を開始
          lines.push(currentLine);
          currentLine = word;
        } else {
          // 単語自体が制限を超える場合は強制的に分割
          if (word.length > maxLineLength) {
            let remainingWord = word;
            while (remainingWord.length > maxLineLength) {
              lines.push(remainingWord.substring(0, maxLineLength));
              remainingWord = remainingWord.substring(maxLineLength);
            }
            currentLine = remainingWord;
          } else {
            currentLine = word;
          }
        }
      }
    }

    // 最後の行を追加
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.join('\n');
  }

  // 完全なメッセージ内容を生成（改行を適切に配置して読みやすく）
  private generateCompleteMessage(result: TranslationProcessingResult, author: User): string {
    const lines: string[] = [];
    
    // ヘッダー部分
    lines.push(`📝 Larry's Complete Diary Feedback for ${author.username}`);
    lines.push(`═══════════════════════════════════════════════════════`);
    lines.push(``);
    
    // 基本情報
    lines.push(`🎯 DETECTED LANGUAGE: ${this.getLanguageDisplayName(result.detectedLanguage)}`);
    lines.push(`📖 SCENARIO: ${result.scenario.toUpperCase().replace(/-/g, ' ')}`);
    lines.push(``);
    
    // ターゲット文
    lines.push(`📝 TARGET SENTENCE:`);
    lines.push(`${result.targetSentence}`);
    lines.push(``);
    lines.push(`═══════════════════════════════════════════════════════`);
    lines.push(``);

    // シナリオ別の内容を追加
    const scenarioLines = this.getScenarioContentLines(result);
    lines.push(...scenarioLines);

    // 質問回答を追加（長いテキストは100文字で分割）
    if (result.hasQuestions && result.questionAnswers && result.questionAnswers.length > 0) {
      lines.push(``);
      lines.push(`═══════════════════════════════════════════════════════`);
      lines.push(``);
      lines.push(`❓ QUESTIONS & ANSWERS:`);
      lines.push(``);
      
      result.questionAnswers.forEach((qa, index) => {
        // 質問も100文字で分割
        const questionText = `Q${index + 1}: ${qa.question}`;
        lines.push(...this.addLineBreaks(questionText).split('\n'));
        lines.push(``);
        
        // 回答も100文字で分割
        const answerText = `A${index + 1}: ${qa.answer}`;
        lines.push(...this.addLineBreaks(answerText).split('\n'));
        lines.push(``);
        
        if (index < result.questionAnswers!.length - 1) {
          lines.push(`---`);
          lines.push(``);
        }
      });
    }

    // フッター
    lines.push(`═══════════════════════════════════════════════════════`);
    lines.push(`Generated by Larry • Canadian English Tutor`);
    lines.push(`Timestamp: ${new Date().toISOString()}`);
    lines.push(``);

    // 改行で結合して返す
    return lines.join('\n');
  }

  // シナリオ別の内容を行配列で取得（改行を適切に配置、長いテキストは100文字で分割）
  private getScenarioContentLines(result: TranslationProcessingResult): string[] {
    const lines: string[] = [];
    
    switch (result.scenario) {
      case 'japanese-only':
        if (result.threeLevelTranslations) {
          lines.push(`📚 THREE LEVEL ENGLISH TRANSLATIONS:`);
          lines.push(``);
          
          lines.push(`🟢 BEGINNER LEVEL:`);
          lines.push(...this.addLineBreaks(result.threeLevelTranslations.beginner).split('\n'));
          lines.push(``);
          
          lines.push(`🟡 INTERMEDIATE LEVEL:`);
          lines.push(...this.addLineBreaks(result.threeLevelTranslations.intermediate).split('\n'));
          lines.push(``);
          
          lines.push(`🔴 UPPER LEVEL:`);
          lines.push(...this.addLineBreaks(result.threeLevelTranslations.upper).split('\n'));
          lines.push(``);
        }
        break;

      case 'japanese-with-try':
        if (result.threeLevelTranslations) {
          lines.push(`📚 THREE LEVEL ENGLISH TRANSLATIONS:`);
          lines.push(``);
          
          lines.push(`🟢 BEGINNER LEVEL:`);
          lines.push(...this.addLineBreaks(result.threeLevelTranslations.beginner).split('\n'));
          lines.push(``);
          
          lines.push(`🟡 INTERMEDIATE LEVEL:`);
          lines.push(...this.addLineBreaks(result.threeLevelTranslations.intermediate).split('\n'));
          lines.push(``);
          
          lines.push(`🔴 UPPER LEVEL:`);
          lines.push(...this.addLineBreaks(result.threeLevelTranslations.upper).split('\n'));
          lines.push(``);
        }

        if (result.translationEvaluation) {
          lines.push(`═══════════════════════════════════════════════════════`);
          lines.push(``);
          
          lines.push(`🎯 TRANSLATION EVALUATION:`);
          lines.push(...this.addLineBreaks(result.translationEvaluation.evaluation).split('\n'));
          lines.push(``);
          
          lines.push(`📝 STUDY POINTS:`);
          result.translationEvaluation.studyPoints.forEach((point, index) => {
            const numberedPoint = `${index + 1}. ${point}`;
            lines.push(...this.addLineBreaks(numberedPoint).split('\n'));
          });
          lines.push(``);
          
          lines.push(`💡 IMPROVEMENTS:`);
          lines.push(...this.addLineBreaks(result.translationEvaluation.improvements).split('\n'));
          lines.push(``);
        }
        break;

      case 'english-only':
        if (result.japaneseTranslation && result.vocabularyExplanation && result.grammarExplanation) {
          lines.push(`🇯🇵 JAPANESE TRANSLATION:`);
          lines.push(...this.addLineBreaks(result.japaneseTranslation).split('\n'));
          lines.push(``);
          
          lines.push(`📖 VOCABULARY EXPLANATION:`);
          lines.push(...this.addLineBreaks(result.vocabularyExplanation).split('\n'));
          lines.push(``);
          
          lines.push(`📝 GRAMMAR EXPLANATION:`);
          lines.push(...this.addLineBreaks(result.grammarExplanation).split('\n'));
          lines.push(``);
        }
        break;
    }
    
    return lines;
  }

}
