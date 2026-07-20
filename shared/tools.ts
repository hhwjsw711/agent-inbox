import { z } from "zod";
import { Id } from "../convex/_generated/dataModel";
import { pick } from "convex-helpers";

export const toolDefinitions = {
  listConversationParticipants: {
    name: "listConversationParticipants",
    description: "列出会话中的参与者",
    parameters: z.object({
      conversationId: z
        .string()
        .describe("要列出参与者的会话ID"),
    }),
  },
  listAgents: {
    name: "listAgents",
    description: "列出用户所有的智能体",
    parameters: z.object({
      userId: z.string().describe("要列出智能体的用户ID"),
    }),
  },
  messageAnotherAgent: {
    name: "messageAnotherAgent",
    description: "向另一个智能体发送消息",
    parameters: z.object({
      target: z
        .object({
          agentId: z.string(),
          agentName: z.string(),
        })
        .describe("消息的目标智能体"),
      content: z.string().describe("要发送的消息内容"),
    }),
  },
  noOutput: {
    name: "noOutput",
    description: "如果你不需要返回任何输出，请使用此工具",
    parameters: z.object({
      reasoning: z.string().describe("不返回输出的原因"),
    }),
  },
  webSearch: {
    name: "webSearch",
    description: "使用此工具在网页上搜索信息",
    parameters: z.object({
      query: z.string().describe("要执行的搜索查询"),
    }),
  },
  scheduleTask: {
    name: "scheduleTask",
    description: "安排一个任务在稍后完成",
    parameters: z.object({
      target: z
        .object({
          agentId: z.string(),
          agentName: z.string(),
        })
        .describe("定时任务的目标智能体"),
      title: z.string().describe("定时任务的标题"),
      content: z.string().describe("定时任务的内容"),
      secondsFromNow: z
        .number()
        .describe("距现在多少秒后执行任务"),
    }),
  },
  updateConversationTitle: {
    name: "updateConversationTitle",
    description: "更新当前会话的标题，使其更好地反映会话内容",
    parameters: z.object({
      title: z.string().describe("会话的新标题"),
    }),
  },
  sendEmail: {
    name: "sendEmail",
    description: "使用 Resend 发送电子邮件",
    parameters: z.object({
      to: z.string().describe("收件人邮箱地址"),
      subject: z.string().describe("邮件主题"),
      content: z.string().describe("邮件的HTML内容"),
      from: z
        .string()
        .optional()
        .describe("可选的发件人地址，默认使用系统默认地址"),
    }),
  },
  addParticipantToConversation: {
    name: "addParticipantToConversation",
    description: "将一个智能体添加到当前会话中",
    parameters: z.object({
      agentId: z
        .string()
        .describe("要添加到会话中的智能体ID"),
    }),
  },
} as const;

export type AgentToolName = keyof typeof toolDefinitions;

// 用户可选择的工具子集
export const userChoosableToolDefinitions = pick(toolDefinitions, [
  "webSearch",
  "scheduleTask",
  "sendEmail",
]);

export type UserChoosableToolName = keyof typeof userChoosableToolDefinitions;

export const alwaysIncludedTools = pick(toolDefinitions, [
  "listConversationParticipants",
  "listAgents",
  "messageAnotherAgent",
  "noOutput",
  "updateConversationTitle",
  "addParticipantToConversation",
]);

export type AlwaysIncludedToolName = keyof typeof alwaysIncludedTools;
