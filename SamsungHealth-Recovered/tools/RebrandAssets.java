import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import javax.imageio.ImageIO;

public class RebrandAssets {

    public static BufferedImage resizeWithAspect(BufferedImage src, int targetW, int targetH, double paddingRatio) {
        BufferedImage output = new BufferedImage(targetW, targetH, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = output.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        int availW = (int) (targetW * (1.0 - paddingRatio * 2));
        int availH = (int) (targetH * (1.0 - paddingRatio * 2));
        if (availW <= 0) availW = targetW;
        if (availH <= 0) availH = targetH;

        double scale = Math.min((double) availW / src.getWidth(), (double) availH / src.getHeight());
        int drawW = (int) (src.getWidth() * scale);
        int drawH = (int) (src.getHeight() * scale);
        int drawX = (targetW - drawW) / 2;
        int drawY = (targetH - drawH) / 2;

        g.drawImage(src, drawX, drawY, drawW, drawH, null);
        g.dispose();
        return output;
    }

    public static BufferedImage createBackground(int w, int h) {
        BufferedImage output = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = output.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setColor(new Color(255, 255, 255));
        g.fillRect(0, 0, w, h);
        g.dispose();
        return output;
    }

    public static void replaceImage(File targetFile, BufferedImage dokraLogo, String role) throws Exception {
        BufferedImage existing = ImageIO.read(targetFile);
        int w = 192;
        int h = 192;
        if (existing != null) {
            w = existing.getWidth();
            h = existing.getHeight();
        }

        BufferedImage replacement;
        if (role.equals("background")) {
            replacement = createBackground(w, h);
        } else if (role.equals("foreground")) {
            // Adaptive icon foreground - centered in 65% safe zone
            replacement = resizeWithAspect(dokraLogo, w, h, 0.15);
        } else if (role.equals("banner_logo")) {
            // Wide banner / actionbar logo
            replacement = resizeWithAspect(dokraLogo, w, h, 0.05);
        } else {
            // Standard icon / logo
            replacement = resizeWithAspect(dokraLogo, w, h, 0.05);
        }

        String format = targetFile.getName().endsWith(".webp") ? "webp" : "png";
        boolean success = ImageIO.write(replacement, format, targetFile);
        if (!success) {
            System.err.println("Failed writing " + targetFile.getAbsolutePath() + " as " + format);
        } else {
            System.out.println("Replaced [" + role + "] " + targetFile.getName() + " (" + w + "x" + h + ") format=" + format);
        }
    }

    public static void main(String[] args) throws Exception {
        String sourceLogoPath = "C:/Users/AE/.gemini/antigravity-ide/brain/62b21517-7f82-4415-954c-1b35d32df86a/.user_uploaded/media_1789643163697.png";
        File sourceFile = new File(sourceLogoPath);
        if (!sourceFile.exists()) {
            throw new RuntimeException("Source logo file not found: " + sourceLogoPath);
        }
        BufferedImage dokraLogo = ImageIO.read(sourceFile);
        System.out.println("Loaded source Dokra logo: " + dokraLogo.getWidth() + "x" + dokraLogo.getHeight());

        String resRoot = "c:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/res";

        // Collect all target files to update
        List<File> allFiles = new ArrayList<>();
        findFiles(new File(resRoot), allFiles);

        for (File f : allFiles) {
            String name = f.getName().toLowerCase();
            if (name.equals("samsung_health_background.png") || name.equals("samsung_health_bg.png")) {
                replaceImage(f, dokraLogo, "background");
            } else if (name.equals("samsung_health_foreground.png") || name.equals("samsung_health_fg.png")) {
                replaceImage(f, dokraLogo, "foreground");
            } else if (name.equals("ic_samsung_health.png")) {
                replaceImage(f, dokraLogo, "icon");
            } else if (name.startsWith("common_samsung_health_logo") && (name.endsWith(".png") || name.endsWith(".webp"))) {
                replaceImage(f, dokraLogo, "banner_logo");
            } else if (name.equals("samsung_account_logo_nos.png")) {
                replaceImage(f, dokraLogo, "banner_logo");
            } else if (name.equals("share_samsung_health_logo_b_mtrl.webp")) {
                replaceImage(f, dokraLogo, "banner_logo");
            } else if (name.startsWith("widget_preview_b2_samsunghealth") && name.endsWith(".webp")) {
                replaceImage(f, dokraLogo, "icon");
            }
        }

        // Also update SVG raw files with Dokra Health vector representation
        updateSvgFiles(new File(resRoot + "/raw"));

        System.out.println("All Dokra logos and brand assets replaced successfully!");
    }

    private static void updateSvgFiles(File rawDir) throws Exception {
        if (!rawDir.exists()) return;
        File[] svgs = rawDir.listFiles((dir, name) -> name.startsWith("common_samsung_health_logo") && name.endsWith(".svg"));
        if (svgs == null) return;

        String dokraHealthSvg = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
                + "<svg width=\"146px\" height=\"20px\" viewBox=\"0 0 146 20\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">\n"
                + "    <g fill=\"#222222\" font-family=\"sans-serif\" font-size=\"14\" font-weight=\"bold\">\n"
                + "        <text x=\"2\" y=\"15\">DOKRA HEALTH</text>\n"
                + "    </g>\n"
                + "</svg>\n";

        for (File svg : svgs) {
            Files.write(svg.toPath(), dokraHealthSvg.getBytes("UTF-8"));
            System.out.println("Updated SVG: " + svg.getName());
        }
    }

    private static void findFiles(File dir, List<File> result) {
        File[] list = dir.listFiles();
        if (list == null) return;
        for (File f : list) {
            if (f.isDirectory()) {
                findFiles(f, result);
            } else {
                result.add(f);
            }
        }
    }
}
