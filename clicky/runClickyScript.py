from clickyScript import *


clickyUrl = "https://api.clicky.com/api/stats/4?site_id=101369228&sitekey=6d6a506f44d45a59&type=visitors-list&date=last-week&output=json"
def main(url):
    allData = merge(getNewData(url), getOldData())
    saveAll(allData)


main(clickyUrl)
