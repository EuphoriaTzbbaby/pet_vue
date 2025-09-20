<script setup lang="ts">
import { defineProps } from 'vue'
import { Star, ChatDotRound } from '@element-plus/icons-vue'

const props = defineProps<{
  comment: any
  getAuthorName: (id: number) => string
  getAuthorAvatar: (id: number) => string
  formatTime: (time: string) => string
  toggleCommentLike: (comment: any) => void
  submitReply: (comment: any) => void
  cancelReply: (comment: any) => void
}>()
</script>

<template>
  <div class="comment-item">
    <!-- 评论头部 -->
    <div class="comment-header">
      <el-avatar :size="32" :src="props.getAuthorAvatar(props.comment.userId)" />
      <div class="comment-meta">
        <span class="author-name">{{ props.getAuthorName(props.comment.userId) }}</span>
        <span class="comment-time">{{ props.formatTime(props.comment.createdAt) }}</span>
      </div>
    </div>

    <!-- 评论内容 -->
    <div class="comment-content">
      <p>{{ props.comment.content }}</p>
      <div class="comment-actions">
        <el-button type="text" size="small" @click="props.toggleCommentLike(props.comment)">
          <el-icon :class="{ 'is-liked': props.comment.isLiked }"><Star /></el-icon>
          {{ props.comment.likes || 0 }}
        </el-button>
        <el-button
          type="text"
          size="small"
          @click="props.comment.showReplyInput = !props.comment.showReplyInput"
        >
          <el-icon><ChatDotRound /></el-icon> 回复
        </el-button>
      </div>
    </div>

    <!-- 回复输入框 -->
    <div v-if="props.comment.showReplyInput" class="reply-input">
      <el-input
        v-model="props.comment.replyContent"
        type="textarea"
        :rows="2"
        :placeholder="`回复 @${props.getAuthorName(props.comment.userId)}...`"
        @keyup.ctrl.enter="props.submitReply(props.comment)"
      />
      <div class="reply-actions">
        <el-button type="primary" size="small" @click="props.submitReply(props.comment)">回复</el-button>
        <el-button size="small" @click="props.cancelReply(props.comment)">取消</el-button>
      </div>
    </div>

    <!-- 子评论递归 -->
    <div v-if="props.comment.replies?.length > 0" class="replies">
      <CommentItem
        v-for="reply in props.comment.replies"
        :key="reply.commentId"
        :comment="reply"
        :getAuthorName="props.getAuthorName"
        :getAuthorAvatar="props.getAuthorAvatar"
        :formatTime="props.formatTime"
        :toggleCommentLike="props.toggleCommentLike"
        :submitReply="props.submitReply"
        :cancelReply="props.cancelReply"
      />
    </div>
  </div>
</template>

<style scoped>
.comment-item {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 20px;
  margin-bottom: 20px;
}
.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.comment-meta {
  margin-left: 10px;
}
.comment-content {
  margin-bottom: 10px;
}
.comment-actions {
  display: flex;
  gap: 10px;
}
.reply-input {
  margin-top: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}
.replies {
  margin-left: 40px;
  margin-top: 10px;
  padding-left: 10px;
  border-left: 2px solid #ebeef5;
}
.is-liked {
  color: #f56c6c;
}
</style>
