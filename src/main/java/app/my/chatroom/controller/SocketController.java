package app.my.chatroom.controller;

import app.my.chatroom.service.WebSocketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;

/**
 * @author Lazyzzz
 * @date 2020/6/15 14:51
 */
@RestController
@RequestMapping("/websocket")
public class SocketController {

    @Autowired
    private WebSocketService webSocketService;

    @GetMapping("/online")
    public Set<String> onlineUsers(@RequestParam("roomName") String roomName) {
        return webSocketService.getOnlineUsers(roomName);
    }

    @GetMapping("/exists")
    public boolean existsByRoomNameAndUsername(@RequestParam("roomName") String roomName,
                                               @RequestParam("username") String username) {
        return webSocketService.existsByRoomAndUsername(roomName, username);
    }

    @GetMapping("/allRoom")
    public List<String> allRooms() {
        return webSocketService.getAllRooms();
    }
}
