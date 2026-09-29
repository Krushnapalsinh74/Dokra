import javax.imageio.ImageIO;
import java.util.Arrays;

public class FormatCheck {
    public static void main(String[] args) {
        System.out.println("Readers: " + Arrays.toString(ImageIO.getReaderFormatNames()));
        System.out.println("Writers: " + Arrays.toString(ImageIO.getWriterFormatNames()));
    }
}
