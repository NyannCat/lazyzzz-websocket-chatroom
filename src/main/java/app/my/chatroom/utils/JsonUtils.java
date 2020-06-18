package app.my.chatroom.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;

/**
 * @author Lazyzzz
 * @date 2020/6/16 10:41
 */
@Slf4j
public class JsonUtils {

    private static final ObjectMapper mapper = new ObjectMapper();

    @NonNull
    public static <T> T toObject(@NonNull String json, Class<T> toConvert) {
        try {
            return mapper.readValue(json, toConvert);
        } catch (JsonProcessingException e) {
            log.error("json解析失败", e);
        }
        return null;
    }

    @NonNull
    public static String toJson(Object message) {
        try {
            return mapper.writeValueAsString(message);
        } catch (JsonProcessingException e) {
            log.error("json构建失败", e);
        }
        return null;
    }
}
