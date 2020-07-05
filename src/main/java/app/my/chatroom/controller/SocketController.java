package app.my.chatroom.controller;

import app.my.chatroom.service.WebSocketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * @author Lazyzzz
 * @date 2020/6/15 14:51
 */
@RestController
@RequestMapping("/websocket")
public class SocketController {

    private static final String UPLOAD_DIR = System.getProperty("user.home") + "/.chatroom/uploads/";

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Path.of(UPLOAD_DIR));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

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

    @PostMapping("/upload")
    public String upload(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Upload File is Empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new RuntimeException("Upload FileName Cannot be Empty");
        }

        String ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
        if (".jpg".equals(ext) || ".png".equals(ext) || ".gif".equals(ext)) {
            String uuid = UUID.randomUUID().toString().replaceAll("-", "");
            String fileName = uuid + ext;
            try {
                file.transferTo(Path.of(UPLOAD_DIR, fileName));
            } catch (IOException e) {
                throw new RuntimeException("Upload Fail");
            }
        }

        return "";
    }
}
