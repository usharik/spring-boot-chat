package ru.geekbrains.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import ru.geekbrains.service.UserService;
import ru.geekbrains.websocket.ChatMessage;

@Controller
public class WebSocketChatController {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketChatController.class);

    private final SimpMessagingTemplate messagingTemplate;

    private final UserService userService;

    @Autowired
    public WebSocketChatController(SimpMessagingTemplate messagingTemplate, UserService userService) {
        this.messagingTemplate = messagingTemplate;
        this.userService = userService;
    }

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/status")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        return chatMessage;
    }

    @MessageMapping("/chat.sendPersonalMessage")
    public void sendPersonalMessage(@Payload ChatMessage chatMessage,
                                    SimpMessageHeaderAccessor headerAccessor) {
        logger.info("New message from user: {} sessionId: {}", chatMessage.getSenderName(),
                headerAccessor.getSessionId());
        messagingTemplate.convertAndSendToUser(chatMessage.getReceiverName(), "/queue/chat", chatMessage);
    }

    @MessageMapping("/chat.newUser")
    @SendTo("/topic/status")
    public ChatMessage newUser(@Payload ChatMessage chatMessage) {
        userService.setUserOnline(chatMessage.getSenderName());
        return chatMessage;
    }
}
