package app.my.chatroom.model;

import lombok.Data;

/**
 * @author Lazyzzz
 * @date 2020/6/16 10:44
 */
@Data
public class BaseMessage {

    private String roomNumber;

    private String username;

    private String message;

    private boolean isSystem = false;

    public BaseMessage() {
    }

    public BaseMessage(String message, boolean isSystem) {
        this.message = message;
        this.isSystem = isSystem;
    }
}
