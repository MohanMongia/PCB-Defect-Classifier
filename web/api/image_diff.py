import cv2
import numpy as np
import sys
import os
import random
import shutil   
import warnings
warnings.filterwarnings("ignore")  

# print(cv2.__version__)
path = "./"
name_test = sys.argv[1]
name_temp = sys.argv[2]

# print(name_temp)
# print(name_test)
# print(sys.argv[2].split('/')[1])

# def directory(choice , directory_path , force = False):
#     if choice == "make":
#         os.mkdir(directory_path)
#     elif choice == "remove":
#         if force:
#             shutil.rmtree(directory_path)
#         else:
#             os.rmdir(directory_path)

ROI_number = 0
cnt_add = 0

def extract_contours_from_image(image_path, write_path, hsv_lower, hsv_upper):
    image = cv2.imread(image_path)
    original = image.copy()
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    hsv_lower = np.array(hsv_lower)
    hsv_upper = np.array(hsv_upper)
    mask = cv2.inRange(hsv, hsv_lower, hsv_upper)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    opening = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    close = cv2.morphologyEx(opening, cv2.MORPH_CLOSE, kernel, iterations=1)
    cnts = cv2.findContours(close, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = cnts[0] if len(cnts) == 2 else cnts[1]
    offset = 20
    global ROI_number
    global cnt_add
    for c in cnts:
        x, y, w, h = cv2.boundingRect(c)
        cv2.rectangle(image, (x - offset, y - offset), (x + w + offset, y + h + offset), (36, 255, 12), 2)
        ROI = original[y - offset:y + h + offset, x - offset:x + w + offset]
        try:
            cv2.imwrite(write_path + name_test.split('/')[1].split('_')[0] + str(ROI_number) +'.png',ROI)
            print(name_test.split('/')[1].split('_')[0] + str(ROI_number) +'.png')
        except:
            ROI_number+=1
            # print(name_test.split('/')[1].split('_')[0] + '{}'.format(ROI_number))
            continue   
        ROI_number += 1            
    for i in range(len(cnts)):
        cnt=cnts[i]
        x,y,w,h = cv2.boundingRect(cnt)
        img_final_rect = cv2.rectangle(original,(x,y),(x+w,y+h),(0,255,0),2)
        cv2.putText(original,"Error",(int(x+w/2),int(y+h/2)),cv2.FONT_HERSHEY_SIMPLEX,0.25,(0, 255, 0))
    cv2.imwrite(path+"web/display_comb_cntrs/"+name_test.split('/')[1].split('_')[0]+str(cnt_add)+".png",original)
    cnt_add = cnt_add+1

def subtract_images_black(image_path_1, image_path_2, write_path):
    image1 = cv2.imread(image_path_1)
    image2 = cv2.imread(image_path_2)
    difference = cv2.subtract(image1, image2)
    Conv_hsv_Gray = cv2.cvtColor(difference, cv2.COLOR_BGR2GRAY)
    ret, mask = cv2.threshold(Conv_hsv_Gray, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
    difference[mask != 255] = [0, 0, 255]
    image1[mask != 255] = [0, 0, 255]
    image2[mask != 255] = [0, 0, 255]
    # cv2.imshow('imgb',image1)
    cv2.imwrite(write_path, image1)

def subtract_images_white(image_path_1, image_path_2, write_path):
    image1 = cv2.imread(image_path_1)
    image2 = cv2.imread(image_path_2)
    difference = cv2.subtract(image2, image1)
    Conv_hsv_Gray = cv2.cvtColor(difference, cv2.COLOR_BGR2GRAY)
    ret, mask = cv2.threshold(Conv_hsv_Gray, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
    difference[mask != 255] = [0, 0, 255]
    image1[mask != 255] = [0, 0, 255]
    image2[mask != 255] = [0, 0, 255]
    # cv2.imshow('imgw',image1)
    cv2.imwrite(write_path, image1)    

def image_differencing(image_path_1, image_path_2, name):

    subtract_images_black(**{
        "image_path_1": image_path_1,
        "image_path_2": image_path_2,
        "write_path": path+"web/images/"+ name_test.split('/')[1].split('_')[0] +  '1.png'
        
    })
    
    subtract_images_white(**{
        "image_path_1": image_path_1,
        "image_path_2": image_path_2,
        "write_path": path+"web/images/"+ name_test.split('/')[1].split('_')[0] + '0.png'
    })
    return(True)

def exec_main():

    # directory("remove" ,path + "contours" , force = True)
    # directory("remove" ,path+"display_comb_cntrs", force = True)

    # img_holdout = os.listdir(path + "images/")
    
    # if(os.path.exists(path+'contours')):
    #     directory("remove" ,path + "contours", force = True)
    # os.mkdir(path+"contours")

    # if(os.path.exists(path+'images')):
    #     directory("remove" ,path + "images", force = True)
    # os.mkdir(path+"images")
    # if(os.path.exists(path+'display_comb_cntrs')):
    #     directory("remove" ,path + "display_comb_cntrs", force = True)
    # os.mkdir(path+"display_comb_cntrs")
    
    image_differencing(path + name_temp,path + name_test,"1")
    print(name_test.split('/')[1].split('_')[0] + "0.png")
    print(name_test.split('/')[1].split('_')[0] +'1.png')

    # os.mkdir(path + "contours")
    # os.mkdir(path+"display_comb_cntrs")
    count=0
    # all_differenced_images = os.listdir(path + "images/")
    all_differenced_images=[name_test.split('/')[1].split('_')[0] + '0.png',name_test.split('/')[1].split('_')[0] + '1.png']
    for filename in all_differenced_images:
        
        this_write_path = path + 'web/'+ "contours"+'/'
        extract_contours_from_image(**{
            "image_path" : path + "web/images/"+ filename,
            "write_path" : this_write_path,
            "hsv_lower" : [0,150,50],
            "hsv_upper" : [10,255,255]
    })

exec_main()
print(ROI_number)

