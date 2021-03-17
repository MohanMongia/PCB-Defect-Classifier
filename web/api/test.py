import os
import shutil
import cv2
import numpy as np


image_path_1= "C:\\Users\\ashutosh jaspal\\Desktop\\Major Project\\00041000_temp.jpg"
image_path_2= "C:\\Users\\ashutosh jaspal\\Desktop\\Major Project\\00041000_test.jpg"
write_path = "C:\\Users\\ashutosh jaspal\\Desktop\\Major Project\\web\\images\\"
image1 = cv2.imread(image_path_1)
image2 = cv2.imread(image_path_2)
#cv2.imshow("c1",image1)
#cv2.imshow("c2",image2)
cv2.imwrite(write_path+'img1.jpg',image1)
