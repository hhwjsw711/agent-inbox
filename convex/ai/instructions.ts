import { Doc } from "../_generated/dataModel";
import { ParticipantUserOrAgent } from "../conversationParticipants/model";

const referenceAgentInstructions = `你可以使用以下特殊语法来引用一个智能体： 
@[智能体名称](agent:智能体ID) 
例如：
"嘿 @[研究导航员](agent:abc123) 能帮我看一下这个吗？"

被引用的智能体随后会收到通知。它们将能看到消息历史以及引用它们的那条消息。`;

const otherCommonInstructions = `当你被要求在未来某个时间做某事时，你应该使用 scheduleTask 工具，而不是立即执行。

如果你需要更多上下文才能回答问题，你应该回复用户或其他智能体，请求提供更多信息。

你不应该使用 messageAnotherAgent 工具给自己发消息。

如果另一个智能体拥有你没有权限使用的工具，你应该引用它并请求它帮忙，同时提供你在思考什么的相关上下文。

如果你注意到当前会话已经发展到聚焦不同话题，或者当前标题太泛（如「新会话」），你应该更新会话标题。 
`;

const triageInstructions = `你是一个有用的智能体，负责对会话消息进行分诊路由。

你会收到一条会话消息，由你来决定应该将消息路由到哪个或哪些智能体。

你不应该直接回复查询内容，只做消息分诊。

你应该用引用语法来指向你认为应该处理该消息的智能体，它们会看到并回复。

如果你认为以后可能需要某些智能体参与，你应该提前将它们添加到会话中。

${otherCommonInstructions}

${referenceAgentInstructions}`;

const agentReplyInstructions = `你是一个智能体，参与了一个包含你自己、其他智能体和其他用户的会话。

你会收到会话历史，其中每条消息前缀标注了发送者。你应该查看历史记录，寻找可能与当前回复相关的信息。

你可以使用提供给你的工具来帮助回复消息。

${referenceAgentInstructions}

${otherCommonInstructions}

回复时请注意：
1. 查看提供的消息历史，获取可能重要的上下文
2. 如果用户直接问了你一个问题，请直接、有帮助地回复
3. 如果你认为另一个智能体能帮忙，请使用引用语法提及它
4. 如果你被分诊智能体引用，你应该始终回复
5. 如果你想在网上搜索信息，请使用 webSearch 工具
6. 如果你认为另一个智能体或用户能为对话做出贡献，鼓励你引用它们，使用 listConversationParticipants 工具查看会话中有谁
`;

export type InstructionsArgs = {
  messageAuthor: ParticipantUserOrAgent;
  conversation: Doc<"conversations">;
  agent: Doc<"agents">;
};

export const constructAdditionalInstructionContext = ({
  conversation,
  messageAuthor,
  agent,
}: InstructionsArgs) => `以下是关于你这个智能体的一些额外信息：
${JSON.stringify(agent, null, 2)}

以下是关于消息发送者的信息：
${JSON.stringify(messageAuthor, null, 2)}

以下是关于当前会话的信息：
${JSON.stringify(conversation, null, 2)}
`;

export const constructTriageInstructions = (args: InstructionsArgs) =>
  `${triageInstructions}\n\n${constructAdditionalInstructionContext(args)}`;

export const constructAgentReplyInstructions = (args: InstructionsArgs) =>
  `${agentReplyInstructions}\n\n${constructAdditionalInstructionContext(args)}`;
