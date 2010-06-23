from PIL import Image
import re

im = Image.open("../resources/dojo_logo.bmp");
(width, height) = im.size
data = list(im.getdata())

# Just print out in default python formatting
print list((x,y) for (pixel,(x,y)) in zip(data, ((x,y) for x in range(height) for y in range(width))) if pixel == 1)

# Attempt to print as JSON, but this doens't quite work
#print list("{x:%i, y:%i}"%(x,y) for (pixel,(x,y)) in zip(data, ((x,y) for x in range(width) for y in range(height))) if pixel == 0)

# Attempt to print as JSON by converting the output to a list and using a regex
#coords = list((x,y) for (pixel,(x,y)) in zip(data, ((x,y) for x in range(width) for y in range(height))) if pixel == 0)
#print type(''.join(coords))
#re.sub("\((\d+), (\d+)\)", r"{x:\1, y:\2}", coords)
