from clickyDataCompiling import *

print("made it in tester--------------------------------------------------------------------")



clickyUrl = "https://api.clicky.com/api/stats/4?site_id=101369228&sitekey=6d6a506f44d45a59&type=visitors-list&date=last-week&output=json"
def main(url):
    combinedData = merge(getNewData(url), getOldData())
    print(combinedData)
    saveAll(combinedData)

main(clickyUrl)

'''
full list now:
    done - load new data
    done - load old data
    done - merge the two
    done - save the result to json
    done - save the information as a graph
    done - make graph more legible
    - fix SSL issue
    done - clean up
    done - recomment
'''
# if ClickyJson exists and is empty, throws an error: shouldn't run into it though
