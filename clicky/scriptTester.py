from clickyDataCompiling import *

print("made it in tester---------------------------------")



url = "https://api.clicky.com/api/stats/4?site_id=101369228&sitekey=6d6a506f44d45a59&type=visitors-list&date=last-week&output=json"
combine = merge(getNewData(url), getOldData())
print(combine)
saveJson(combine)
plotData(combine)



'''
full list now:
    done - load new data
    done - load old data
    done - merge the two
    done - save the result to json
    done - save the information as a graph
    - make graph more legible
    - fix SSL issue
    - clean up
    - recomment
'''
