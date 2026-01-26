import { Injectable, UnauthorizedException, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom, catchError } from "rxjs";
import { AxiosError } from "axios";
import { SummarizeRequestDto } from "./dto/summarize.request.dto";

interface ClovaStudioMessage {
  role: string;
  content: string;
}

interface ClovaStudioResponse {
  status: {
    code: string;
    message: string;
  };
  result: {
    message: {
      role: string;
      content: string;
      thinkingContent?: string;
    };
    finishReason: string;
    created: number;
    seed: number;
    usage: {
      completionTokens: number;
      promptTokens: number;
      totalTokens: number;
    };
  };
}

interface SummaryResult {
  summary: string;
  tags: string[];
}

@Injectable()
export class AiService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly aiPassword: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiUrl =
      this.configService.get<string>("CLOVA_STUDIO_API_URL") ||
      "https://clovastudio.stream.ntruss.com/v1/chat-completions/HCX-003";
    this.apiKey = this.configService.get<string>("CLOVA_STUDIO_API_KEY") || "";
    this.aiPassword = this.configService.get<string>("AI_PASSWORD") || "";
  }

  async summarizeContent(requestDto: SummarizeRequestDto): Promise<SummaryResult> {
    // AI 비밀번호 검증
    if (requestDto.aiPassword !== this.aiPassword) {
      throw new UnauthorizedException("AI 비밀번호가 올바르지 않습니다");
    }

    // Clova Studio API 호출
    const prompt = this.createPrompt(requestDto.content);
    const response = await this.callClovaStudio(prompt);

    // 응답 파싱
    return this.parseResponse(response);
  }

  private createPrompt(content: string): string {
    return `다음 내용을 분석하여 JSON 형식으로 응답해주세요.

내용:
${content}

다음 형식으로 정확히 응답해주세요:
{
  "summary": "내용을 한글로 간단히 요약 (2-3문장)",
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"]
}

요구사항:
- summary: 내용의 핵심을 한글로 2-3문장으로 요약
- tags: 내용과 관련된 해시태그 3-5개 (# 기호 없이, 기술 관련 내용이면 영어 사용 가능, 한글도 가능)
- 반드시 위의 JSON 형식만 응답하세요`;
  }

  private async callClovaStudio(prompt: string): Promise<string> {
    const requestId = this.generateRequestId();

    const messages: ClovaStudioMessage[] = [
      {
        role: "system",
        content: "당신은 내용을 요약하고 태그를 생성하는 전문가입니다. 항상 JSON 형식으로 응답합니다.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const requestBody = {
      messages,
      topP: 0.8,
      topK: 0,
      maxTokens: 500,
      temperature: 0.5,
      repetitionPenalty: 1.1,
      includeAiFilters: false,
    };

    try {
      const { data } = await firstValueFrom(
        this.httpService
          .post<ClovaStudioResponse>(this.apiUrl, requestBody, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
              "X-NCP-CLOVASTUDIO-REQUEST-ID": requestId,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              const errorBody = error.response?.data ?? error.message;
              console.error("Clova Studio API 에러 응답:", errorBody);
              throw new InternalServerErrorException(
                `Clova Studio API 호출 실패: ${error.response?.status} ${error.response?.statusText} - ${JSON.stringify(errorBody)}`,
              );
            }),
          ),
      );

      if (data.status.code !== "20000") {
        throw new InternalServerErrorException(`Clova Studio API 오류: ${data.status.message}`);
      }

      return data.result.message.content;
    } catch (error: unknown) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      console.error("Clova Studio API 호출 예외:", error);
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
      throw new InternalServerErrorException(`Clova Studio API 호출 중 오류 발생: ${errorMessage}`);
    }
  }

  private parseResponse(response: string): SummaryResult {
    try {
      // JSON 코드 블록 제거 (```json ... ``` 형식 대응)
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(cleanedResponse) as { summary?: string; tags?: [] };

      // 검증
      if (!parsed.summary || !Array.isArray(parsed.tags)) {
        throw new Error("응답 형식이 올바르지 않습니다");
      }

      return {
        summary: parsed.summary,
        tags: parsed.tags,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
      throw new InternalServerErrorException(`AI 응답 파싱 실패: ${errorMessage}`);
    }
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
