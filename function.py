import pickle
import pandas as pd
import requests


# Load the data
with open('src/movie_dict.pkl', 'rb') as file:
    movie_dict = pickle.load(file)
    df = pd.DataFrame(movie_dict)

with open('src/similarity.pkl', 'rb') as file:
    similarity = pickle.load(file)

def recommend(movie):
    if movie not in df['title'].tolist():
        return f"Movie '{movie}' not found in the dataset."
    
    movie_index = df[df['title'] == movie].index[0]
    distances = similarity[movie_index]
    movies_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:6]
    
    recommended_movies = [df.iloc[i[0]].title for i in movies_list]
    return recommended_movies


def fetch_movie_details(movie_title):
    api_key = 'b929fa75'  # Replace with your OMDb API key
    url = f'https://www.omdbapi.com/?t={movie_title}&apikey={api_key}'
    response = requests.get(url)
    return response.json()