import pandas as pd

COLUMNS = ["KMLDateTime", "KMLLatDegDecimal", "KMLLonDegDecimal",
           "WeaponTypeWeight", "NumWeaponsDelivered"
]

df = pd.read_csv('THOR_Vietnam_7_31_2013.csv', usecols=COLUMNS)
df.dropna(subset=["KMLDateTime", "KMLLatDegDecimal"])