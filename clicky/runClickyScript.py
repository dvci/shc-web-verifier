from clickyScript import *

# I wonder if we should make site_id and sitekey parameters / ENV variables?
clickyUrl = "https://api.clicky.com/api/stats/4?site_id=101369228&sitekey=6d6a506f44d45a59&type=visitors-list&date=last-month&output=json"
def main(url):
    allData = merge(getNewData(url), getOldData())
    saveAll(allData)

main(clickyUrl)
