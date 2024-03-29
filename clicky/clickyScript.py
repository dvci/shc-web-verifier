import requests
import json
from datetime import date
from os.path import exists
import matplotlib.pyplot as plt 
 
'''
Retrieves visitor data from the json currently checked into the
repository.

If there is no previous data, creates a template to work with 
and returns that instead.

Returns: a python dictionary of the outdated visitor data
'''
def getOldData():
    if exists('clickyData.json'):
        with open('clickyData.json') as json_file:
            oldDataDict = json.load(json_file)
    else:
        oldDataDict = { 
            'visitData': {
                'numTotalVisits':[],
                'numNewVisitors':[],
                'ipAddress':[]
            },
            'dates': []}
    return oldDataDict
        
'''
Retrieves the new visitor data from the Clicky url.

Returns: python list containing new data from the clicky url
'''
def getNewData(clickyUrl):
    try:
        # allow Timeout exception to be raised if server has not issued
        # a response in 100 seconds
        response = requests.get(clickyUrl, timeout = 100)
        json = response.json()
        newDataList = json[0]['dates'][0]['items']
    # catch the base-class exception for requests
    except requests.exceptions.RequestException as e:
        print('Unable to access Clicky server.')
        raise SystemExit(e)
    except Exception as e:
        print('Unexpected response from Clicky server. Unable to process site visit data.')
        raise SystemExit(e)
    return newDataList

'''
Appends the relevant parts of the new visitor data to the existing
visitor data currently checked into the repository. This includes
the new number of visits, new IP addresses, new unique visits, and
the dates of the new visits.

Returns: the merged data
'''
def merge(newData, oldData):
    newVisitors = 0
    oldData['visitData']['numTotalVisits'].append(len(newData))
    for i in newData:
        ipAddress = i['ip_address']
        if ipAddress not in oldData['visitData']['ipAddress']:
            newVisitors += 1
            oldData['visitData']['ipAddress'].append(ipAddress)
    oldData['visitData']['numNewVisitors'].append(newVisitors)
    t = date.today()
    d = str(t.year) + '-' + str(t.month) + '-' + str(t.day)
    oldData['dates'].append(d)
    return oldData       

'''
Plots the information on a graph and saves the graph to file.
'''
def plotData(allData):
    X1 = allData['dates']
    Y1 = allData['visitData']['numTotalVisits']
    fig = plt.figure(figsize=(10,5))
    plt.plot(X1, Y1, 'o-', label = 'Total Weekly Visits') 

    X2 = allData['dates']
    Y2 = allData['visitData']['numNewVisitors']
    plt.plot(X2, Y2, 'o-', label = 'New Visitors') 
    
    plt.xlabel('Date') 
    plt.ylabel('Number of Weekly Visits') 
    plt.title('Weekly SHC Verifier Use') 
    plt.legend() 
    plt.grid()
    fig.savefig('clickyGraph.jpg', bbox_inches='tight', dpi=150)

'''
Saves the data to a json file.
'''
def saveJson(allData):
    with open('clickyData.json', 'w') as json_file:
        json.dump(allData, json_file, indent=4)

'''
Saves the graph and json at the same time
'''
def saveAll(allInfo):
    saveJson(allInfo)
    plotData(allInfo)