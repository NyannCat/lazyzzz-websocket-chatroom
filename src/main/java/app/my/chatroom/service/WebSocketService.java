package app.my.chatroom.service;

import app.my.chatroom.model.BaseMessage;
import app.my.chatroom.utils.JsonUtils;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * @author Lazyzzz
 * @date 2020/6/16 8:51
 */
@Slf4j
@Service
@ServerEndpoint("/websocket/{roomName}/{username}")
public class WebSocketService {

    private static final AtomicInteger onlineNum = new AtomicInteger();

    /**
     * key：房间号 value：房间号对应的session集合
     */
    private static final ConcurrentHashMap<String, Set<Session>> roomSessionMap
            = new ConcurrentHashMap<>();

    /**
     * key: 房间号 value: 用户名
     */
    private static final ConcurrentHashMap<String, Set<String>> roomUserMap
            = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session,
                       @PathParam("roomName") String roomName,
                       @PathParam("username") String username) {
        //先判断房间是否存在，如果不存在就创建新的set
        roomSessionMap.computeIfAbsent(roomName, k -> new HashSet<>());
        //添加用户
        roomSessionMap.get(roomName).add(session);

        //加入房间系统消息
        BaseMessage response = new BaseMessage(username + "加入房间", true);
        sendToAll(session, roomName, response);

        roomUserMap.computeIfAbsent(roomName, k -> new HashSet<>());
        roomUserMap.get(roomName).add(username);

        log.info(username + "加入房间:" + roomName + ", 当前人数:" + onlineNum.incrementAndGet());
    }

    @OnClose
    public void onClose(Session session,
                        @PathParam("roomName") String roomName,
                        @PathParam("username") String username) {
        roomSessionMap.get(roomName).remove(session);
        if (roomSessionMap.get(roomName).isEmpty()) {
            roomSessionMap.remove(roomName);
        } else {
            BaseMessage response = new BaseMessage(username + "离开房间", true);
            sendToAll(session, roomName, response);
        }
        roomUserMap.get(roomName).remove(username);
        if (roomUserMap.get(roomName).isEmpty()) {
            roomUserMap.remove(roomName);
        }
        log.info(username + "退出房间:" + roomName + ", 当前人数:" + onlineNum.decrementAndGet());
    }

    @OnMessage
    public void onMessage(Session session, String message) {
        BaseMessage response = JsonUtils.toObject(message, BaseMessage.class);
        String roomName = response.getRoomNumber();
        sendToAll(session, roomName, response);
    }

    @OnError
    public void onError(Throwable throwable) {
        log.error("Websocket错误", throwable);
    }

    public Set<String> getOnlineUsers(@NonNull String roomName) {
        return roomUserMap.get(roomName);
    }

    public List<String> getAllRooms() {
        return new ArrayList<>(roomSessionMap.keySet());
    }

    public boolean existsByRoomAndUsername(@NonNull String roomName, @NonNull String username) {
        if (roomUserMap.containsKey(roomName)) {
            return roomUserMap.get(roomName).contains(username);
        }
        return false;
    }

    private void sendToAll(Session session, String roomName, BaseMessage response) {
        for (Session other : roomSessionMap.get(roomName)) {
            if (!session.equals(other)) {
                sendMessage(other, response);
            }
        }
    }

    private void sendMessage(Session session, BaseMessage response) {
        if (session != null) {
            try {
                session.getBasicRemote().sendText(JsonUtils.toJson(response));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
