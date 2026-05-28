import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, inject, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLElement>;

  chatService = inject(ChatService);
  authService = inject(AuthService);
  newMessage = '';
  private shouldScroll = false;
  private atBottom = true;

  constructor() {
    effect(() => {
      this.chatService.messages();
      if (this.atBottom) this.shouldScroll = true;
    });
  }

  ngOnInit(): void {
    this.chatService.loadHistory();
    this.chatService.connect();
    this.shouldScroll = true;
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  onScroll(): void {
    const el = this.messagesContainer.nativeElement;
    this.atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
  }

  send(): void {
    const text = this.newMessage.trim();
    if (!text) return;
    this.chatService.sendMessage(text);
    this.newMessage = '';
    this.shouldScroll = true;
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
