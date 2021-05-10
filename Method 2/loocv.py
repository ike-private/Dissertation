# loocv evaluate random forest on the sonar dataset
from numpy import mean
from numpy import std
from pandas import read_csv
from sklearn.model_selection import LeaveOneOut
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import average_precision_score
# load dataset
url = '/Users/ikeolagunju/Documents/Final year/Dissertation/Coding/Gait recognition/Method 2/combo 2.csv'
dataframe = read_csv(url, header=None)
data = dataframe.values
# print(data[: ,3:5])
# data[:, :1] All confidence scores 
# data[:, -1] all labels
# data[: ,2:3] nose label
# data[: ,1:3] nose confidence and label
# data[: ,3:5] nose coordinates
# split into inputs and outputs

X, y = data[:, :-1], data[:, -1]
# X, y = data[: ,3:5], data[: ,2:3]
print(X.shape, y.shape)
# create loocv procedure
cv = LeaveOneOut()
# create model
# model = RandomForestClassifier(random_state=1)
model = DecisionTreeClassifier()
# evaluate model
scores = cross_val_score(model, X, y, scoring='accuracy', cv=cv, n_jobs=-1)
# report performance
print('Accuracy: %.3f (%.3f)' % (mean(scores), std(scores)))