import cv2
import numpy as np
import os
import random


path = "/home/mongu_panda/Downloads/major/web/"    

img1 = cv2.imread(path + "images/diffb_1.png")
img2 = cv2.imread(path + "images/diffw_1.png")
img3 = img1+img2
cv2.imshow('img1',img1)
cv2.imshow('img2',img2)          
cv2.imshow('img3',img3)
