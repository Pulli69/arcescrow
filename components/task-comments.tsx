'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface TaskCommentsProps {
  taskId: string // Supabase task ID
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  // In a full implementation, we would fetch from Supabase `comments` table using `useComments(taskId)`
  // For this milestone, we'll implement a functional UI that handles state locally to demonstrate the UX.
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const comment = {
      id: Math.random().toString(),
      content: newComment,
      created_at: new Date().toISOString(),
      user: {
        display_name: 'You (Current User)',
        avatar_url: null,
      }
    }

    setComments([...comments, comment])
    setNewComment('')
  }

  return (
    <Card className="glass-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="size-4 text-muted-foreground" />
          Task Discussion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Start the discussion!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="size-8 border border-border/50">
                  <AvatarImage src={comment.user?.avatar_url} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {comment.user?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{comment.user?.display_name || 'Anonymous'}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 bg-secondary/50 p-3 rounded-lg rounded-tl-none border border-border/50">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea 
            placeholder="Type your message..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[40px] h-[40px] resize-none bg-card/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button type="submit" size="icon" disabled={!newComment.trim()} className="shrink-0 bg-primary hover:bg-primary/90">
            <Send className="size-4" />
          </Button>
        </form>

      </CardContent>
    </Card>
  )
}
