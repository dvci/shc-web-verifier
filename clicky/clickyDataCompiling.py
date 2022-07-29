import requests
import json
import pandas as pd
from datetime import date
from os.path import exists
import matplotlib.pyplot as plt 
 
 
# successfully handles if there is no file existing
def getOldData():
    if exists('ClickyJson.json'):
        with open('ClickyJson.json') as json_file:
            data = json.load(json_file)
            print("This is the old data", data)
    else:
        data = { 
            'visitorData': {
                'numTotalVisitors':[],
                'numUniqueVisitors':[],
            },
            'dates': []}
    return data
        

# still broken because of the SSL issue
def getNewData(clickyUrl):
    response = requests.get(clickyUrl, verify=False)
    # print(response.text)
    json = response.json()
    newDataList = json[0]['dates'][0]['items']
    # print(type(combine), ' 0000000000000000000000000000000000000000000000000000000000000000')
    return newDataList


def merge(newData, oldData):
    uniqueVisitors = []
    oldData["visitorData"]['numTotalVisitors'].append(len(newData))
    for i in newData:
        ipAddress = i["ip_address"]
        if ipAddress not in uniqueVisitors:
            uniqueVisitors.append(ipAddress)
    oldData["visitorData"]['numUniqueVisitors'].append(len(uniqueVisitors))
    t = date.today()
    d = str(t.year) + '-' + str(t.month) + '-' + str(t.day)
    oldData["dates"].append(d)
    return oldData       


def plotData(allData):
    # Declaring the points for first line plot
    X1 = allData['dates']
    Y1 = allData["visitorData"]['numTotalVisitors']
    fig = plt.figure(figsize=(10,5))
    plt.plot(X1, Y1, label = "Total Visits") 
    X2 = allData['dates']
    Y2 = allData["visitorData"]['numUniqueVisitors']
    plt.plot(X2, Y2, label = "Unique Visits") 
    plt.xlabel('Date') 
    plt.ylabel('Number of Visits') 
    plt.title('SHC Verifier Use') 
    plt.legend() 
    fig.savefig('clickyGraph.jpg', bbox_inches='tight', dpi=150)
    # remove after testing
    plt.show() 


def saveJson(allData):
    with open('ClickyJson.json', 'w') as json_file:
        json.dump(allData, json_file)


def saveAll(allInfo):
    plotData(allInfo)
    saveJson(allInfo)
