import sys
import os
import xlsxwriter
id=sys.argv[-1]

if(os.path.exists("./web/results/"+id)==False):
    os.mkdir("./web/results/"+id)
if(os.path.exists("./web/results/"+id+"/results.xlsx")):
    os.remove("./web/results/"+id+"/results.xlsx")

f=open("./web/results/"+id+"/results.xlsx","w+")


workbook=xlsxwriter.Workbook("./web/results/"+id+"/results.xlsx")
worksheet=workbook.add_worksheet()

# print(sys.argv[1])
total=0;
result=sys.argv;
# print(sys.argv);
# result=list(result)
# print(type(result))
# print(result)
result.pop(0)
result.pop(-1)
f_result={}
for item in result:
    if item in f_result.keys():
        f_result[item]=f_result[item]+1
    else:
        f_result[item]=1
    total+=1

row=1;
for key,val in f_result.items():
    worksheet.write('A'+str(row),key)
    worksheet.write('B'+str(row),val)
    row+=1
worksheet.write('A'+str(row+1),'Total Defects')
worksheet.write('B'+str(row+1),total)

workbook.close()
print('File Created')