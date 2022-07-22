from clickyDataCompiling import *

# call the methods all together like the example you have in the bottom of the other file
# need to make allowances for if a file doesn't exist, could work around it by making a file 
# beforehand, if even just for testing purposes

combinedData = mergeData(getNewData("https://api.clicky.com/api/stats/4?site_id=101369228&sitekey=6d6a506f44d45a59&type=visitors-list&date=last-week&output=json"), getOldData())
saveAll(combinedData)