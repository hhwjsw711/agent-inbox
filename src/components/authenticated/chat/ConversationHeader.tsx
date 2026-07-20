import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { Skeleton } from "../../ui/skeleton";
import { Wrench, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Confirm } from "../../ui/confirm";
import { routes } from "../../../routes";
import { ConversationParticipants } from "./ConversationParticipants";

interface ConversationHeaderProps {
  conversation: Doc<"conversations"> | undefined | null;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
}) => {
  const updateConversation = useMutation(
    api.conversations.mutations.updateMine,
  );
  const deleteConversation = useMutation(
    api.conversations.mutations.removeMine,
  );
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState(conversation?.title ?? "");

  React.useEffect(() => {
    if (conversation?.title) setNewTitle(conversation.title);
  }, [conversation?.title]);

  const handleSave = async () => {
    if (!conversation?._id || !newTitle.trim()) return;

    await updateConversation({
      conversationId: conversation?._id as Id<"conversations">,
      title: newTitle.trim(),
    });
    setIsOpen(false);
  };

  const handleDelete = async () => {
    if (!conversation?._id) return;

    await deleteConversation({
      conversationId: conversation?._id as Id<"conversations">,
    });
    setIsDeleteConfirmOpen(false);
    setIsOpen(false);
    routes.home().push();
  };

  return (
    <div className="h-14  flex items-center px-4 ">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="font-medium text-lg gap-2 bg-background"
          >
            {conversation?._id && !conversation ? (
              <Skeleton className="h-7 w-48" />
            ) : (
              <>
                {conversation?.title}
                <Wrench className="h-4 w-4 opacity-20" />
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>会话设置</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              会话名称
            </label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="输入会话名称"
            />
          </div>
          <DialogFooter className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setIsDeleteConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              删除会话
            </Button>
            <Button onClick={handleSave}>保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Confirm
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="删除会话"
        description={`确定要删除"${conversation?.title}"吗？此操作不可撤销。`}
        confirmText="删除会话"
        variant="destructive"
        onConfirm={handleDelete}
      />

      <ConversationParticipants conversation={conversation} />
    </div>
  );
};
