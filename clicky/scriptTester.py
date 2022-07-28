from clickyDataCompiling import *


# call the methods all together like the example you have in the bottom of the other file
# need to make allowances for if a file doesn't exist, could work around it by making a file 
# beforehand, if even just for testing purposes

url = "https://api.clicky.com/api/stats/4?site_id=101369228&sitekey=6d6a506f44d45a59&type=visitors-list&date=last-week&output=json"

print("made it in tester")
testJson = {
    "visitorData": {
        'numTotalVisitors':[20,12,5,4],
        'numUniqueVisitors':[20,10,5,4],
    },
    "date": ['2022-7-3','2022-7-10','2022-7-17','2022-7-24']
}
# import requests as r
# print(r.certs.where())

# combinedData = mergeData(getNewData(url), getOldData())
# saveAll(combinedData)
# getNewData(url)
getOldData()
saveJson(testJson)
# plotData()



'''
ok things to do:
- fix reading new data (SSL issue)
- reading in old data: what to do if there is none
    - how to change: 2 options: make the file at the start, don't do anything if it doesn't exist
- saving the json to the repo
- saving the graph to the repo

- my plan: do nothing if the file doesn't exist and just use an empty template
    - save some json and work based on that result
'''
