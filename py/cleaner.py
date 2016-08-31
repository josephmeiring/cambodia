import pandas as pd

COLUMNS = ["KMLDateTime", "KMLLatDegDecimal", "KMLLonDegDecimal", 
"WeaponTypeWeight", "NumWeaponsDelivered", 
]
df = pd.read_csv('THOR.cleaned.csv', use_columns=COLUMNS)