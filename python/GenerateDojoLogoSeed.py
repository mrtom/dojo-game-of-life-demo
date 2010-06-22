from PIL import Image
im = Image.open("../resources/dojo_logo.bmp");
(width, height) = im.size
data = list(im.getdata())
print list((x,y) for (pixel,(x,y)) in zip(data, ((x,y) for x in range(width) for y in range(height))) if pixel == 0)
