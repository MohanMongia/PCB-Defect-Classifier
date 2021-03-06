import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import numpy as np
from keras.models import load_model
import keras.optimizers as opt
from cv2 import cv2
import os
import sys

id=sys.argv[1]

path = "/home/mongu_panda/Downloads/major/web/"

def classifier(arr_dir):
    learn = load_model('/home/mongu_panda/Downloads/major/web/api/model_test1.h5')
    optimizers = opt.Adam(learning_rate=0.0001)
    learn.compile(loss='categorical_crossentropy', optimizer=optimizers, metrics=['accuracy'])
    #np.set_printoptions(suppress=True)
    #np.set_printoptions(precision=5)
    s = '/home/mongu_panda/Downloads/major/web/contours/c'+id+'/';
    img_arr = list()
    for image_name in arr_dir:
        path = s+image_name
        # print(path)
        a = cv2.imread(path)
        a = cv2.resize(a,(50,50))
        #a = a.reshape((1,a.shape[0],a.shape[1],a.shape[2]))
        img_arr.append(np.asarray(a).astype(np.float32)/255)
    return np.argmax(learn.predict(np.array(img_arr)),axis=1)
    

def predict(arr_dir):
    prediction = classifier(arr_dir)
    label = []
    for item in prediction:
        if item == 0:
            label.append('spur')
        elif item == 1:
            label.append('open')
        elif item == 2:
            label.append('pinhole')
        elif item == 3:
            label.append('dimensional')
        elif item == 4:
            label.append('spurious_copper')
        elif item == 5:
            label.append('mousebite')
        elif item == 6:
            label.append('short')    
    return(label)



arr_temp = os.listdir(path + "contours/c"+id+"/")
# print(arr_temp)
arr1_dir=list()
for item in arr_temp:
    temp=item[8:]
    temp=int(temp[:-4])
    arr1_dir.append(temp)
arr1_dir.sort()
# print(arr1_dir)
arr_dir=list()
for item in arr1_dir:
    arr_dir.append('contour_'+str(item)+'.png')
# print(arr_dir)
print(predict(arr_dir))






