package app.my.chatroom.model;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.websocket.Session;

/**
 * @author Lazyzzz
 * @date 2020/6/18 20:57
 */
@Data
@EqualsAndHashCode(exclude = "username")
public class ChatSession {

    private Session session;

    private String username;
}
