import java.awt.image.BufferedImage;
import java.io.File;
import javax.imageio.ImageIO;

public final class ConvertWebpToPng {
    public static void main(String[] args) throws Exception {
        if (args.length == 0) {
            throw new IllegalArgumentException("Provide WebP input paths");
        }
        for (String value : args) {
            File input = new File(value);
            BufferedImage image = ImageIO.read(input);
            if (image == null) {
                throw new IllegalStateException("No WebP reader available for " + input);
            }
            if (!ImageIO.write(image, "png", input)) {
                throw new IllegalStateException("PNG writer unavailable for " + input);
            }
            System.out.println("Converted " + input);
        }
    }
}
