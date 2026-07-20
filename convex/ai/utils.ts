import { internal } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { ActionCtx } from "../_generated/server";
import * as Agents from "../agents/model";

export const sendSystemMessageToConversation = async (
  ctx: ActionCtx,
  args: {
    conversationId: Id<"conversations">;
    content: string;
    meta?: any;
  },
) =>
  ctx.runMutation(
    internal.conversationMessages.internalMutations.sendSystemMessage,
    {
      conversationId: args.conversationId as Id<"conversations">,
      content: args.content,
      meta: args.meta,
    },
  );

export const getAgentAndEnsureItIsJoinedToConversation = async (
  ctx: ActionCtx,
  args: {
    agentId: Id<"agents">;
    conversationId: Id<"conversations">;
  },
) => {
  // Get the referenced agent
  const agent = await ctx.runQuery(internal.agents.internalQueries.find, {
    agentId: args.agentId,
  });

  if (!agent)
    throw new Error(`找不到ID为 '${args.agentId}' 的智能体`);

  // Get or create the participant for this agent in the conversation
  const participant = await ctx.runMutation(
    internal.conversationParticipants.internalMutations
      .addAgentIfNotAlreadyJoined,
    {
      conversationId: args.conversationId,
      agentId: agent._id,
    },
  );

  return { agent, participant };
};

export const getTriageAgent = async (ctx: ActionCtx) => {
  const agent = await ctx.runQuery(
    internal.agents.internalQueries.findSystemAgentByKind,
    { systemAgentKind: "triage" },
  );
  if (agent) return agent;
  return await ctx.runMutation(
    internal.agents.internalMutations.createSystemAgent,
    {
      systemAgentKind: "triage",
      name: "系统分诊智能体",
      description: `将消息分诊路由到正确的智能体`,
      personality: `有帮助、简洁`,
      avatarUrl: Agents.createAgentAvatarUrl(`system-triage`),
      tools: [],
      lastActiveTime: Date.now(),
      kind: "system_agent",
    },
  );
};

export const getTriageAgentAndEnsureItIsJoinedToConversation = async (
  ctx: ActionCtx,
  conversationId: Id<"conversations">,
) => {
  const agent = await getTriageAgent(ctx);

  const participant = await ctx.runMutation(
    internal.conversations.internalMutations
      .joinTriageAgentToConversationIfNotAlreadyJoined,
    {
      conversationId,
    },
  );

  if (participant.kind != "agent")
    throw new Error(
      `参与者类型不是智能体，但分诊智能体必须是智能体`,
    );

  return { agent, participant };
};

/**
 * Generic function to handle AI generation with consistent status management
 */
export const runAgentAIGeneration = async <T>(
  ctx: ActionCtx,
  args: {
    agent: Doc<"agents">;
    participant: Doc<"conversationParticipants"> & { kind: "agent" };
    conversation: Doc<"conversations">;
    generateAIResponse: () => Promise<T>;
  },
) => {
  // Set the agent's status to thinking
  await ctx.runMutation(
    internal.conversationParticipants.internalMutations.updateParticipantStatus,
    {
      participantId: args.participant._id,
      status: "thinking",
    },
  );

  try {
    return await args.generateAIResponse();
  } catch (error: unknown) {
    await handleAgentError(ctx, {
      error,
      conversationId: args.conversation._id,
      errorContext: "回复消息",
    });
    return null;
  } finally {
    // No longer thinking
    await ctx.runMutation(
      internal.conversationParticipants.internalMutations
        .updateParticipantStatus,
      {
        participantId: args.participant._id,
        status: "inactive",
      },
    );
  }
};

/**
 * Handles agent errors with a consistent approach
 */
export const handleAgentError = async (
  ctx: ActionCtx,
  args: {
    error: unknown;
    conversationId: Id<"conversations">;
    errorContext: string;
  },
) => {
  console.error(`Error while ${args.errorContext}:`, args.error);

  const errorMessage =
    args.error instanceof Error ? args.error.message : "未知错误";

  // Send error message to conversation
  await sendSystemMessageToConversation(ctx, {
    conversationId: args.conversationId,
    content: `${args.errorContext}时出错：${errorMessage}`,
    meta: {
      error: errorMessage,
      errorContext: args.errorContext,
      fullError:
        args.error instanceof Error
          ? {
              message: args.error.message,
              stack: args.error.stack,
              name: args.error.name,
            }
          : String(args.error),
    },
  });
};

/**
 * Process AI result and handle noOp cases
 */
export const processAgentAIResult = async (
  ctx: ActionCtx,
  args: {
    result: { text: string; toolCalls: Array<{ toolName: string; args: any }> };
    agent: Doc<"agents">;
    conversation: Doc<"conversations">;
    participant: Doc<"conversationParticipants"> & { kind: "agent" };
    sendMessage: (text: string) => Promise<void>;
  },
) => {
  console.log(`Agent result:`, args.result);
  console.log(`Tool Calls:`, args.result.toolCalls);

  if (args.result.text !== "") {
    await args.sendMessage(args.result.text);
  } else {
    const noOp = args.result.toolCalls.find((t) => t.toolName === "noOutput");
    if (noOp) {
      await sendSystemMessageToConversation(ctx, {
        conversationId: args.conversation._id,
        content: `智能体 ${args.agent.name} 决定不回复此消息，原因："${noOp.args.reasoning}"`,
        meta: {
          toolName: "noOutput",
          reasoning: noOp.args.reasoning,
          agentName: args.agent.name,
          agentId: args.agent._id,
        },
      });
    }
  }
};
