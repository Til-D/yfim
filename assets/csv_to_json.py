import csv
import json


def csv_to_json(csvFilePath, jsonFilePath):
    with open(csvFilePath, 'r')as csvfile:
        reader = list(csv.reader(csvfile))
        header = reader[0]
        print(header)
        icebreaker = []
        wouldyou = []
        quest = {
            "mature": [],
            "general": [],
            "kids": []
        }

        for i in range(1, len(reader)):
            row = reader[i]
            icebreaker.append(row[0])
            wouldyou.append(row[1])
            if (row[3] != "") and (row[4] != "") and (row[5]!=""):
                rating = row[5]
                quest[rating].append([row[3], row[4]])

        with open(jsonFilePath, 'w')as jsonfile:
            data = {
                "icebreaker": icebreaker,
                "wouldyou": wouldyou,
                "quest": quest
            }
            json.dump(data, jsonfile)


if __name__ == '__main__':
    csv_file = './conversations.csv'
    json_file = './topics/topics.json'
    csv_to_json(csv_file, json_file)
