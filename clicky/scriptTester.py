from clickyDataCompiling import *

print("made it in tester---------------------------------")

''' this is what the current clicky data looks like when you get it from the link
[
  {
    "type": "visitors-list",
    "dates": [
      {
        "date": "2022-06-26,2022-06-30",
        "items": [
          { "time":"1656520164", "time_pretty":"Wed Jun 29 2022, 12:29p", "time_total":"84", "ip_address":"24.34.108.0", "uid":"1313781915", "session_id":"247859048", "actions":"2", "total_visits":"1", "first_visit": {"time":"1656520164", "session_id":"247859048"}, "landing_page":"http://dvci.github.io/shc-web-verifier/", "web_browser":"Google Chrome 103.0", "operating_system":"Mac OS X", "screen_resolution":"1792x1120", "javascript":"1", "language":"English", "referrer_type":"direct", "geolocation":"Arlington, Massachusetts, USA", "country_code":"us", "latitude":"42.4188", "longitude":"-71.1557", "hostname":"comcast.net", "organization":"Comcast Cable", "stats_url":"https://clicky.com/stats/visitors-actions?site_id=101369228&session_id=247859048"},
          { "time":"1656519562", "time_pretty":"Wed Jun 29 2022, 12:19p", "time_total":"992", "ip_address":"24.34.108.0", "uid":"3166136560", "session_id":"247853892", "actions":"4", "total_visits":"1", "first_visit": {"time":"1656519562", "session_id":"247853892"}, "landing_page":"http://dvci.github.io/shc-web-verifier/", "web_browser":"Safari 15.2", "operating_system":"Mac OS X", "screen_resolution":"1920x1200", "javascript":"1", "language":"English", "referrer_type":"direct", "geolocation":"Arlington, Massachusetts, USA", "country_code":"us", "latitude":"42.4188", "longitude":"-71.1557", "hostname":"comcast.net", "organization":"Comcast Cable", "stats_url":"https://clicky.com/stats/visitors-actions?site_id=101369228&session_id=247853892"},
          { "time":"1656519103", "time_pretty":"Wed Jun 29 2022, 12:11p", "time_total":"122", "ip_address":"73.149.20.0", "uid":"951136834", "session_id":"247850157", "actions":"1", "total_visits":"1", "first_visit": {"time":"1656519103", "session_id":"247850157"}, "landing_page":"http://dvci.github.io/shc-web-verifier/", "web_browser":"Microsoft Edge 102", "operating_system":"Mac OS X", "screen_resolution":"1792x1120", "javascript":"1", "language":"English", "referrer_type":"direct", "geolocation":"Cambridge, Massachusetts, USA", "country_code":"us", "latitude":"42.3649", "longitude":"-71.0987", "hostname":"comcast.net", "organization":"Comcast Cable", "stats_url":"https://clicky.com/stats/visitors-actions?site_id=101369228&session_id=247850157"},
          { "time":"1656518793", "time_pretty":"Wed Jun 29 2022, 12:06p", "time_total":"602", "ip_address":"216.10.170.0", "uid":"2415498954", "session_id":"247847735", "actions":"1", "total_visits":"1", "first_visit": {"time":"1656518793", "session_id":"247847735"}, "landing_page":"http://dvci.github.io/shc-web-verifier/", "web_browser":"Google Chrome 103.0", "operating_system":"Mac OS X", "screen_resolution":"1680x1050", "javascript":"1", "language":"English", "referrer_type":"direct", "geolocation":"Laconia, New Hampshire, USA", "country_code":"us", "latitude":"43.5728", "longitude":"-71.4787", "hostname":"atlanticbb.net", "organization":"Atlantic Broadband", "stats_url":"https://clicky.com/stats/visitors-actions?site_id=101369228&session_id=247847735"},
          { "time":"1656518705", "time_pretty":"Wed Jun 29 2022, 12:05p", "time_total":"31", "ip_address":"216.10.170.0", "uid":"384878448", "session_id":"247847073", "actions":"1", "total_visits":"1", "first_visit": {"time":"1656518705", "session_id":"247847073"}, "landing_page":"http://dvci.github.io/shc-web-verifier/", "web_browser":"Google Chrome 103.0", "operating_system":"Mac OS X", "screen_resolution":"1680x1050", "javascript":"1", "language":"English", "referrer_type":"direct", "geolocation":"Laconia, New Hampshire, USA", "country_code":"us", "latitude":"43.5728", "longitude":"-71.4787", "hostname":"atlanticbb.net", "organization":"Atlantic Broadband", "stats_url":"https://clicky.com/stats/visitors-actions?site_id=101369228&session_id=247847073"},
          { "time":"1656518430", "time_pretty":"Wed Jun 29 2022, 12p", "time_total":"265", "ip_address":"216.10.170.0", "uid":"1721381887", "session_id":"247844917", "actions":"3", "total_visits":"1", "first_visit": {"time":"1656518430", "session_id":"247844917"}, "landing_page":"http://dvci.github.io/shc-web-verifier/", "web_browser":"Google Chrome 103.0", "operating_system":"Mac OS X", "screen_resolution":"1680x1050", "javascript":"1", "language":"English", "referrer_type":"direct", "geolocation":"Laconia, New Hampshire, USA", "country_code":"us", "latitude":"43.5728", "longitude":"-71.4787", "hostname":"atlanticbb.net", "organization":"Atlantic Broadband", "stats_url":"https://clicky.com/stats/visitors-actions?site_id=101369228&session_id=247844917"}
        ]
      }
    ]
  }
]
'''


testJson = {
    "visitorData": {
        'numTotalVisitors':[20,30,40,50, 1, 17, 33, 5],
        'numUniqueVisitors':[5,10,15,20, 1, 13, 3, 5]
    },
    "dates": ['2022-7-3','2022-7-10','2022-7-17','2022-7-24','2022-7-31','2022-8-7','2022-7-14','2022-7-21']
}

testJson2 = {
    "visitorData": {
        'numTotalVisitors':[1, 2, 3],
        'numUniqueVisitors':[10, 20, 30]
    },
    "dates": ['2022-7-3','2022-7-10','2022-7-17','2022-7-24']
}
# run if there is no file made yet for now
# saveJson(testJson)

# call the methods all together like the example you have in the bottom of the other file
# need to make allowances for if a file doesn't exist, could work around it by making a file 
# beforehand, if even just for testing purposes

url = "https://api.clicky.com/api/stats/4?site_id=101369228&sitekey=6d6a506f44d45a59&type=visitors-list&date=last-month&output=json"



# import requests as r
# print(r.certs.where())

# combinedData = mergeData(getNewData(url), getOldData())
# saveAll(combinedData)
#getNewData(url)
# getOldData()
combine = merge(getNewData(url), getOldData())
print(combine)
saveJson(combine)
# combinedJson = newMerge(testJson2, getOldData())
# plotting is working but isn't saved yet
# plotData(combine)



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
# something to consider: what to do if there are no entries at all? handle it so it is 0 for both I guess
# need to check ip directly? yes because time could change so need to check ip specifically 