import os
import requests
from flask import Flask, request, render_template, jsonify
from function import recommend, fetch_movie_details
import pandas as pd
import pickle

app = Flask(__name__)

# # Download the .pkl file from S3
# S3_URL = 's3://flask-pkl/movie_dict.pkl'  # Replace with your S3 URL
# response = requests.get(S3_URL)
# with open('movie_dict.pkl', 'wb') as file:
#     file.write(response.content)

# Load the data
with open('movie_dict.pkl', 'rb') as file:
    movie_dict = pickle.load(file)
    df = pd.DataFrame(movie_dict)

@app.route('/')
def home():
    movies = df['title'].tolist()
    return render_template('index.html', movies=movies)

@app.route('/recommend', methods=['POST'])
def recommend_movies():
    movie = request.form['movie']
    recommendations = recommend(movie)
    movie_details = fetch_movie_details(movie)
    movies = df['title'].tolist()
    return render_template('index.html', movie=movie, recommendations=recommendations, movies=movies, movie_details=movie_details)

@app.route('/ajax_recommend', methods=['POST'])
def ajax_recommend():
    movie = request.json['movie']
    movie_details = fetch_movie_details(movie)
    recommendations = recommend(movie)
    recommendation_details = [fetch_movie_details(rec) for rec in recommendations]
    return jsonify([movie_details] + recommendation_details)

if __name__ == '__main__':
    app.run(debug=True)