import requests
from pandas.io.json import json_normalize
import pandas as pd
from datetime import date
  
# api-endpoint
url = "https://api.clicky.com/api/stats/4?site_id=101369228&sitekey=6d6a506f44d45a59&type=visitors-list&date=last-week&output=json"

# sending get request and saving the response as response object
df = pd.read_json(url)
r - requests.get(url = url)
# extracting data in json format // change this
pd.json_normalize(df, record_path=[items])

# idea: construct the df as I go, add lines for every unique entry
# so kinda like: check if it exists, if no add and increment all if yes increment total
# nvm that got confusing REAL fast
# ok new game plan, bring in json, make into dict, edit dict, make dict into df, make df into excel, make graph from the excel info
data = r.json()
jsonString = data.loads()
dataDict = json.loads(jsonString)
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
#below is problematic cause it would delete dates as well I think, new plan is transfer the info i want to a new dictionary instead of trying to delete selectively 

uniqueVisitorList = []
for item in dataDict.items():
    if item != (ip_address | items):
        del dataDict[item]
        if !uniqueVisitorList.contains(dataDict.get(item)):
            uniqueVisitorList.append(dataDict.get(item))
totalVisitors = dataDict[items].length()
uniqueVisitors = uniqueVisitorList.length()

##################################################################################################33

newDict = {
    'numTotalVisitors':0,
    'numUniqueVisitors':0,
    'ipAddresses':{
    }
    }


#not sure on the syntax here, would need to either look it up or test it to be sure
#brief googling says this is off, gonna need some editing
# things to fix:
    #incrementing -done
    #accessing the items -done?
    #adding the ipaddresses -done?
for item in dataDict[dates][items]:
        newDict['numTotalVisitors'].get('numTotalVisitors', 0) + 1
        if item not in newDict['ipAddresses']:
            newDict['numUniqueVisitors'].get('numUniqueVisitors', 0) + 1
            newDict['ipAddresses'][newDict['numTotalVisitors'].get('numUniqueVisitors')] = item.get('ip_address')
            

#forgot to do something about the date
'''
now new dict should look like this I think?:
newDict = {
    'numTotalVisitors':4,
    'numUniqueVisitors':4,
    'ipAddresses':[
        1:"24.34.108.0",
        2":"24.34.108.0",
        3:"73.149.20.0",
        4:"216.10.170.0"
    ]
}
'''
#I'm not sure how the whole, convert a dictionary within a dictionary to a df with go
#but I will have to decide how I want to display the data overall before going any further 
#so it's time to finally decide that ahhh

