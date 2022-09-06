from clickyScript import *
import os
from dotenv import load_dotenv

load_dotenv()
REACT_APP_MEASUREMENT_ID = os.getenv('REACT_APP_MEASUREMENT_ID')
CLICKY_SITE_KEY = os.getenv('CLICKY_SITE_KEY')

clickyUrl = 'https://api.clicky.com/api/stats/4?site_id={}&sitekey={}&type=visitors-list&date=last-week&output=json'.format(REACT_APP_MEASUREMENT_ID, CLICKY_SITE_KEY)
def main(url):
    allData = merge(getNewData(url), getOldData())
    saveAll(allData)


main(clickyUrl)
