import requests
import json
import pandas as pd
from datetime import date

# things to pass in/define outside:
    # the name of the old data file
    # the link to the new clicky data
    # the name that you are saving to (graph and json)

url = "https://api.clicky.com/api/stats/4?site_id=101369228&sitekey=6d6a506f44d45a59&type=visitors-list&date=last-week&output=json"

# ways to change this: add the file name as a param, return the json instead of assigning it
# figure out where to store the clicky info in the repo and also how
def getOldData():
    with open("clickyData.json", "r") as read_file:
    clickyData = json.load(read_file.read())  
    # make dictionary - that's what load does, it takes json and makes it a dictionary
    return clickyData
# get old data and combine it with the new data here, old data is a dictionary 
# example might be like this: think about how I would save it first before thinking about
# how to reload it


'''
clickyData = {
    visitorData = {
        'numTotalVisitors':[3,12,5],
        'numUniqueVisitors':[2,10,5],
    }
    date = ['2022-7-3','2022-7-10','2022-7-17']
}
'''


# ways to change: make link param, return dict - check
def getNewData(clickyUrl):
    response = requests.get(clickyUrl)
    dataDict = json.load(response.json)
    return dataDict
### this pulls in the new information from the clicky link


'''what it should look like right now: [
  [
  {
    "type": "visitors-list",
    "dates": [
      {
        "date": "2022-06-17,2022-06-30",
        "items": [
          { "time":"1656520164", "time_pretty":"Wed Jun 29 2022, 12:29p", "time_total":"84", "ip_address":"24.34.108.0", "uid":"1313781915", "session_id":"247859048", "actions":"2", "total_visits":"1", "first_visit": {"time":"1656520164", "session_id":"247859048"}, "landing_page":"http://dvci.github.io/shc-web-verifier/", "web_browser":"Google Chrome 103.0", "operating_system":"Mac OS X", "screen_resolution":"1792x1120", "javascript":"1", "language":"English", "referrer_type":"direct", "geolocation":"Arlington, Massachusetts, USA", "country_code":"us", "latitude":"42.4188", "longitude":"-71.1557", "hostname":"comcast.net", "organization":"Comcast Cable", "stats_url":"https://clicky.com/stats/visitors-actions?site_id=101369228&session_id=247859048"},
          { "time":"1656519562", "time_pretty":"Wed Jun 29 2022, 12:19p", "time_total":"992", "ip_address":"24.34.108.0", "uid":"3166136560", "session_id":"247853892", "actions":"4", "total_visits":"1", "first_visit": {"time":"1656519562", "session_id":"247853892"}, "landing_page":"http://dvci.github.io/shc-web-verifier/", "web_browser":"Safari 15.2", "operating_system":"Mac OS X", "screen_resolution":"1920x1200", "javascript":"1", "language":"English", "referrer_type":"direct", "geolocation":"Arlington, Massachusetts, USA", "country_code":"us", "latitude":"42.4188", "longitude":"-71.1557", "hostname":"comcast.net", "organization":"Comcast Cable", "stats_url":"https://clicky.com/stats/visitors-actions?site_id=101369228&session_id=247853892"},
          { "time":"1656519103", "time_pretty":"Wed Jun 29 2022, 12:11p", "time_total":"122", "ip_address":"73.149.20.0", "uid":"951136834", "session_id":"247850157", "actions":"1", "total_visits":"1", "first_visit": {"time":"1656519103", "session_id":"247850157"}, "landing_page":"http://dvci.github.io/shc-web-verifier/", "web_browser":"Microsoft Edge 102", "operating_system":"Mac OS X", "screen_resolution":"1792x1120", "javascript":"1", "language":"English", "referrer_type":"direct", "geolocation":"Cambridge, Massachusetts, USA", "country_code":"us", "latitude":"42.3649", "longitude":"-71.0987", "hostname":"comcast.net", "organization":"Comcast Cable", "stats_url":"https://clicky.com/stats/visitors-actions?site_id=101369228&session_id=247850157"},
          { "time":"1656518793", "time_pretty":"Wed Jun 29 2022, 12:06p", "time_total":"602", "ip_address":"216.10.170.0", "uid":"2415498954", "session_id":"247847735", "actions":"1", "total_visits":"1", "first_visit": {"time":"1656518793", "session_id":"247847735"}, "landing_page":"http://dvci.github.io/shc-web-verifier/", "web_browser":"Google Chrome 103.0", "operating_system":"Mac OS X", "screen_resolution":"1680x1050", "javascript":"1", "language":"English", "referrer_type":"direct", "geolocation":"Laconia, New Hampshire, USA", "country_code":"us", "latitude":"43.5728", "longitude":"-71.4787", "hostname":"atlanticbb.net", "organization":"Atlantic Broadband", "stats_url":"https://clicky.com/stats/visitors-actions?site_id=101369228&session_id=247847735"}
           ]
      }
    ]
  }
]'''


# things to change: pass in new and old data as params, return the new collection maybe?
def mergeData(newData, oldData):
    uniqueVisitors = []
    newData[visitorData][numTotalVisitors].append(len(oldData[dates][items]))
    for item in oldData[dates][items]:
        if item not in uniqueVisitors:
            uniqueVisitors.append(item)
    newData[visitorData][numUniqueVisitors].append(len(uniqueVisitors))
    newData[date].append(date.today())
    return newData # ?
### this calculates and adds the new information to the old information 


'''
now new dict should look like this I think?:
clickyData = {
    visitorData = {
        'numTotalVisitors':[3,12,5,4],
        'numUniqueVisitors':[2,10,5,4],
    }
    date = ['2022-7-3','2022-7-10','2022-7-17','2022-7-24']
}
'''


# things to change: pass in visitorData and date
def plotData(allData):
    df = pd.DataFrame(allData[visitorData], index = allData[date])
    lines = df.plot.line()



# save graph somewhere? yea that would make sense since this is automated and someone would want to 
# be able to just check it when they need to

# save the info as json somewhere
def saveJson():
    with open("ClickyData", "w") as fp:
        json.dump(clickyData, fp) 


# things left to do: 
    # clean up code
    # figure out where/how to store the graph
    # clean up where everything is stored
    # test


# example call: 
    # combinedData = mergeData(getNewData(url), getOldData())
    # plotData(combinedData)
