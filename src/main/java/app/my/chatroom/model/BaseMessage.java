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

    /**
     * 消息（系统或用户）
     */
    private String message;

    /**
     * 头像地址
     */
    private String avatar;

    /**
     * 标记消息是否是系统
     */
    private boolean isSystem = false;

    /**
     * 消息是否为图片
     */
    private boolean isImage = false;

    public BaseMessage() {
    }

    public BaseMessage(String message, boolean isSystem) {
        this.message = message;
        this.isSystem = isSystem;
    }
}
