from clickyScript import *


clickyUrl = "https://api.clicky.com/api/stats/4?site_id=101369228&sitekey=6d6a506f44d45a59&type=visitors-list&date=last-week&output=json"
def main(url):
    allData = merge(getNewData(url), getOldData())
    saveAll(allData)


main(clickyUrl)

'''
if ClickyJson exists and is empty, an error will occur 
    shouldn't run into it but could add error handling
might want to implement something to counter if multiple runs on one day yield different numbers
    (ex: ran once automatically and then after we choose to run it manually for some reason)
you would want to check if the date is already there, if it is then use the bigger number
    presumably that would be the more accurate number, taken at a later time
    '''
